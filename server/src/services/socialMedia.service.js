import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const execFileAsync = promisify(execFile);
const WINDOWS = process.platform === "win32";
const MAX_BYTES = 100 * 1024 * 1024;

const ALLOWED_HOSTS = {
  instagram: ["instagram.com", "www.instagram.com"],
  pinterest: ["pinterest.com", "www.pinterest.com", "pin.it"],
};

const IMAGE_HOSTS = ["i.pinimg.com"];

function validateUrl(rawUrl, platform) {
  if (typeof rawUrl !== "string" || !rawUrl.trim()) {
    throw new Error("A media URL is required.");
  }

  let parsed;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    throw new Error("Enter a valid URL.");
  }

  if (
    parsed.protocol !== "https:" ||
    !ALLOWED_HOSTS[platform]?.includes(parsed.hostname.toLowerCase()) ||
    parsed.username ||
    parsed.password
  ) {
    throw new Error(`Enter a supported public ${platform} HTTPS URL.`);
  }

  parsed.hash = "";
  return parsed.toString();
}

async function runYtDlp(args, timeout = 90000) {
  const customExecutable = process.env.YTDLP_BIN;
  const executable = customExecutable || (WINDOWS ? "py" : "yt-dlp");
  const finalArgs =
    !customExecutable && WINDOWS ? ["-m", "yt_dlp", ...args] : args;

  try {
    const { stdout } = await execFileAsync(executable, finalArgs, {
      timeout,
      maxBuffer: 8 * 1024 * 1024,
      windowsHide: true,
      env: process.env,
    });
    return stdout;
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error(
        WINDOWS && !customExecutable
          ? 'Python or yt-dlp was not found. Run "py -m yt_dlp --version".'
          : "yt-dlp was not found. Install it or configure YTDLP_BIN.",
      );
    }

    if (error.killed || error.code === "ETIMEDOUT") {
      throw new Error("The media operation timed out. Please try again.");
    }

    const details = error.stderr?.trim();
    throw new Error(
      details
        ? `yt-dlp failed: ${details.slice(-1200)}`
        : error.message || "The media operation failed.",
    );
  }
}

// Follow only HTTPS redirects to known Pinterest hosts.
async function fetchPinterestPage(rawUrl) {
  let currentUrl = validateUrl(rawUrl, "pinterest");

  for (let i = 0; i < 6; i++) {
    const parsed = new URL(currentUrl);

    if (
      parsed.protocol !== "https:" ||
      !ALLOWED_HOSTS.pinterest.includes(parsed.hostname.toLowerCase())
    ) {
      throw new Error("Pinterest redirected to an unsupported host.");
    }

    const response = await fetch(currentUrl, {
      redirect: "manual",
      signal: AbortSignal.timeout(20000),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      if (!location) throw new Error("Pinterest returned an invalid redirect.");
      currentUrl = new URL(location, currentUrl).toString();
      continue;
    }

    if (!response.ok) {
      throw new Error(`Pinterest page request failed (${response.status}).`);
    }

    const type = response.headers.get("content-type") || "";
    if (!type.includes("text/html")) {
      throw new Error("Pinterest did not return a readable page.");
    }

    const html = await response.text();
    return { html, url: currentUrl };
  }

  throw new Error("Too many redirects while opening the Pinterest pin.");
}

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function getMeta(html, key) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const patterns = [
    new RegExp(
      `<meta\\b[^>]*\\bproperty=["']${escaped}["'][^>]*\\bcontent=["']([^"']+)["'][^>]*>`,
      "i",
    ),
    new RegExp(
      `<meta\\b[^>]*\\bcontent=["']([^"']+)["'][^>]*\\bproperty=["']${escaped}["'][^>]*>`,
      "i",
    ),
    new RegExp(
      `<meta\\b[^>]*\\bname=["']${escaped}["'][^>]*\\bcontent=["']([^"']+)["'][^>]*>`,
      "i",
    ),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return decodeHtml(match[1]);
  }

  return null;
}

function validateImageUrl(rawUrl) {
  let parsed;

  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error("Pinterest did not provide a valid image URL.");
  }

  if (
    parsed.protocol !== "https:" ||
    !IMAGE_HOSTS.includes(parsed.hostname.toLowerCase())
  ) {
    throw new Error("Pinterest did not provide a supported image URL.");
  }

  return parsed.toString();
}

async function getPinterestImageInfo(rawUrl) {
  const { html, url } = await fetchPinterestPage(rawUrl);

  const thumbnail = getMeta(html, "og:image") || getMeta(html, "twitter:image");

  if (!thumbnail) {
    throw new Error(
      "Pinterest exposed no video formats or usable image URL for this pin.",
    );
  }

  return {
    success: true,
    platform: "pinterest",
    title:
      getMeta(html, "og:title") ||
      getMeta(html, "twitter:title") ||
      "Pinterest media",
    thumbnail: validateImageUrl(thumbnail),
    duration: null,
    mediaType: "image",
    webpageUrl: url,
    downloadType: "image",
  };
}

async function downloadPinterestImage(rawUrl, res) {
  const info = await getPinterestImageInfo(rawUrl);
  const imageUrl = validateImageUrl(info.thumbnail);

  const response = await fetch(imageUrl, {
    redirect: "error",
    signal: AbortSignal.timeout(30000),
    headers: { "User-Agent": "Mozilla/5.0" },
  });

  if (!response.ok) {
    throw new Error("Unable to retrieve the Pinterest image.");
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.startsWith("image/")) {
    throw new Error("Pinterest did not return an image file.");
  }

  const declaredLength = Number(response.headers.get("content-length") || 0);
  if (declaredLength > MAX_BYTES) {
    throw new Error("The image exceeds the 100 MB download limit.");
  }

  if (!response.body) {
    throw new Error("Pinterest returned an empty image response.");
  }

  const chunks = [];
  let total = 0;

  for await (const chunk of response.body) {
    total += chunk.length;
    if (total > MAX_BYTES) {
      throw new Error("The image exceeds the 100 MB download limit.");
    }
    chunks.push(chunk);
  }

  const extensionByType = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/avif": "avif",
  };

  const extension = extensionByType[contentType.split(";")[0].toLowerCase()];
  if (!extension) {
    throw new Error("This Pinterest image format is not supported.");
  }

  const filename = `pinterest-image.${extension}`;
  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Content-Length", total);
  res.end(Buffer.concat(chunks));
}

export async function inspectSocialMedia(rawUrl, platform) {
  const url = validateUrl(rawUrl, platform);

  try {
    const output = await runYtDlp(
      [
        "--dump-single-json",
        "--no-warnings",
        "--no-playlist",
        "--skip-download",
        "--socket-timeout",
        "20",
        url,
      ],
      90000,
    );

    const info = JSON.parse(output);
    const extension = (info.ext || "").toLowerCase();
    const isImage = ["jpg", "jpeg", "png", "webp", "gif", "avif"].includes(
      extension,
    );

    return {
      success: true,
      platform,
      title: info.title || "Media preview",
      thumbnail: info.thumbnail || info.thumbnails?.at(-1)?.url || null,
      duration: Number.isFinite(info.duration) ? info.duration : null,
      mediaType: isImage ? "image" : "video",
      webpageUrl: info.webpage_url || url,
      downloadType: isImage ? "image" : "video",
    };
  } catch (error) {
    if (platform === "pinterest") {
      try {
        return await getPinterestImageInfo(url);
      } catch (fallbackError) {
        throw new Error(
          `${error.message}. Image fallback: ${fallbackError.message}`,
        );
      }
    }

    throw error;
  }
}

export async function downloadSocialMedia(rawUrl, platform, res) {
  const url = validateUrl(rawUrl, platform);

  if (platform === "pinterest") {
    try {
      await runYtDlp(
        [
          "--no-warnings",
          "--no-playlist",
          "--restrict-filenames",
          "--max-filesize",
          "100M",
          "-f",
          "best",
          "-o",
          path.join(os.tmpdir(), "snapload-%(id)s.%(ext)s"),
          url,
        ],
        180000,
      );
    } catch (error) {
      const message = error.message.toLowerCase();

      if (
        message.includes("no video formats found") ||
        message.includes("requested format is not available") ||
        message.includes("no formats found")
      ) {
        return downloadPinterestImage(url, res);
      }

      throw error;
    }

    // yt-dlp video downloads are handled below in the shared flow.
  }

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "snapload-"));



try {
  const formatSelector =
    platform === "pinterest"
      ? "V_HLSV3_MOBILE-1626+V_HLSV3_MOBILE-audio1-1/bestvideo+bestaudio/best"
      : "best";

  const args = [
    "--no-warnings",
    "--no-playlist",
    "--restrict-filenames",
    "--max-filesize",
    "100M",
    "-f",
    formatSelector,
    "--merge-output-format",
    "mp4",
    "-o",
    path.join(tempDir, "%(title).80s.%(ext)s"),
    url,
  ];

  await runYtDlp(args, 180000);

  const files = await fs.readdir(tempDir);
  const mediaFiles = files.filter((name) =>
    /\.(mp4|webm|mkv|mov|jpg|jpeg|png|webp|gif|avif)$/i.test(name),
  );

  if (mediaFiles.length === 0) {
    throw new Error("No downloadable media was found for this link.");
  }

  const filename = mediaFiles[0];
  const filePath = path.join(tempDir, filename);

  res.download(filePath, filename, async (error) => {
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});

    if (error && !res.headersSent) {
      res.status(500).json({
        success: false,
        message: "The download could not be completed.",
      });
    }
  });
} catch (error) {
  await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
  throw error;
}
}
