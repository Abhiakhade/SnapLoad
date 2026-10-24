import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const execFileAsync = promisify(execFile);

const ALLOWED_HOSTS = {
  instagram: ["instagram.com", "www.instagram.com"],
  pinterest: ["pinterest.com", "www.pinterest.com", "pin.it"],
};

const MAX_IMAGE_SIZE = 25 * 1024 * 1024;
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;
const WINDOWS = process.platform === "win32";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

function validateUrl(rawUrl, platform) {
  if (typeof rawUrl !== "string" || !rawUrl.trim()) {
    throw new Error("A media URL is required.");
  }

  let url;

  try {
    url = new URL(rawUrl.trim());
  } catch {
    throw new Error("Enter a valid URL.");
  }

  if (
    !ALLOWED_HOSTS[platform] ||
    url.protocol !== "https:" ||
    !ALLOWED_HOSTS[platform].includes(url.hostname.toLowerCase())
  ) {
    throw new Error(`Enter a supported public ${platform} HTTPS URL.`);
  }

  if (url.username || url.password) {
    throw new Error("URLs containing credentials are not supported.");
  }

  url.hash = "";
  return url.toString();
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
          ? 'Python or yt-dlp was not found. Check with "py -m yt_dlp --version".'
          : "yt-dlp was not found. Install it or configure YTDLP_BIN.",
      );
    }

    if (error.killed || error.code === "ETIMEDOUT") {
      throw new Error("The media operation timed out. Please try again.");
    }

    const details = error.stderr?.trim();

    throw new Error(
      details
        ? `yt-dlp failed: ${details.slice(-1000)}`
        : error.message || "The media operation failed.",
    );
  }
}

function decodeHtml(value = "") {
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, "&#62;");
}

function getMetaContent(html, key) {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];

  for (const tag of tags) {
    const attrs = {};

    for (const match of tag.matchAll(
      /([^\s=/>]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g,
    )) {
      attrs[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? "";
    }

    const property = (
      attrs.property ||
      attrs.name ||
      attrs.itemprop ||
      ""
    ).toLowerCase();

    if (property === key.toLowerCase() && attrs.content) {
      return decodeHtml(attrs.content.trim());
    }
  }

  return null;
}

function isAllowedImageHost(hostname, platform) {
  const host = hostname.toLowerCase();

  if (platform === "instagram") {
    return host === "cdninstagram.com" || host.endsWith(".cdninstagram.com");
  }

  if (platform === "pinterest") {
    return host === "pinimg.com" || host.endsWith(".pinimg.com");
  }

  return false;
}

async function getPageImage(rawUrl, platform) {
  const url = validateUrl(rawUrl, platform);

  let response;

  try {
    response = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
      headers: {
        "User-Agent": USER_AGENT,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        Referer: `https://www.${platform}.com/`,
      },
    });
  } catch {
    throw new Error(
      `Could not connect to ${platform}. Please try again later.`,
    );
  }

  if (!response.ok) {
    throw new Error(
      `Could not read the ${platform} page (HTTP ${response.status}).`,
    );
  }

  const finalUrl = new URL(response.url);

  if (
    finalUrl.protocol !== "https:" ||
    !ALLOWED_HOSTS[platform].includes(finalUrl.hostname.toLowerCase())
  ) {
    throw new Error("The page redirected to an unsupported domain.");
  }

  const contentType = response.headers.get("content-type") || "";

  if (!contentType.toLowerCase().includes("text/html")) {
    throw new Error("The page did not return HTML.");
  }

  const html = await response.text();

  // Temporary diagnostics. Remove these logs after testing.
  console.log("\n--- SnapLoad HTML Debug ---");
  console.log("Platform:", platform);
  console.log("Page URL:", response.url);
  console.log("HTTP Status:", response.status);
  console.log("HTML Length:", html.length);
  console.log("Has og:image:", html.toLowerCase().includes("og:image"));
  console.log(
    "Has twitter:image:",
    html.toLowerCase().includes("twitter:image"),
  );
  console.log("Has login text:", html.toLowerCase().includes("login"));
  console.log("Has CAPTCHA text:", html.toLowerCase().includes("captcha"));
  console.log("--- End HTML Debug ---\n");

  const imageUrl =
    getMetaContent(html, "og:image") ||
    getMetaContent(html, "twitter:image") ||
    getMetaContent(html, "twitter:image:src");

  if (!imageUrl) {
    const lowerHtml = html.toLowerCase();

    if (
      lowerHtml.includes("captcha") ||
      lowerHtml.includes("login") ||
      lowerHtml.includes("accounts/login")
    ) {
      throw new Error(
        `${platform} returned a login or CAPTCHA page instead of the post. The image cannot be accessed through this request.`,
      );
    }

    throw new Error(
      `No image metadata was found. The ${platform} post may be private or unavailable.`,
    );
  }

  let image;

  try {
    image = new URL(imageUrl);
  } catch {
    throw new Error("The page returned an invalid image URL.");
  }

  if (
    image.protocol !== "https:" ||
    !isAllowedImageHost(image.hostname, platform) ||
    image.username ||
    image.password
  ) {
    throw new Error("The image URL uses an unsupported host.");
  }

  return {
    imageUrl: image.toString(),
    webpageUrl: finalUrl.toString(),
  };
}

async function downloadImage(imageUrl, platform, res) {
  const image = new URL(imageUrl);

  if (
    image.protocol !== "https:" ||
    !isAllowedImageHost(image.hostname, platform)
  ) {
    throw new Error("Unsupported image URL.");
  }

  const response = await fetch(image, {
    redirect: "follow",
    signal: AbortSignal.timeout(20000),
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "image/*",
    },
  });

  if (!response.ok) {
    throw new Error("The image could not be downloaded.");
  }

  const finalUrl = new URL(response.url);

  if (
    finalUrl.protocol !== "https:" ||
    !isAllowedImageHost(finalUrl.hostname, platform)
  ) {
    throw new Error("The image redirected to an unsupported host.");
  }

  const contentType = (response.headers.get("content-type") || "")
    .split(";")[0]
    .trim()
    .toLowerCase();

  const extensions = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/avif": "avif",
  };

  const extension = extensions[contentType];

  if (!extension) {
    throw new Error("The server did not return a supported image.");
  }

  const contentLength = Number(response.headers.get("content-length") || 0);

  if (contentLength > MAX_IMAGE_SIZE) {
    throw new Error("The image is too large (maximum 25 MB).");
  }

  if (!response.body) {
    throw new Error("The image response was empty.");
  }

  const chunks = [];
  let total = 0;

  for await (const chunk of response.body) {
    total += chunk.length;

    if (total > MAX_IMAGE_SIZE) {
      await response.body.cancel().catch(() => {});
      throw new Error("The image is too large (maximum 25 MB).");
    }

    chunks.push(Buffer.from(chunk));
  }

  const buffer = Buffer.concat(chunks);
  const filename = `${platform}-image.${extension}`;

  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Content-Length", buffer.length);

  res.end(buffer);
}

async function getYtDlpInfo(url) {
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

  try {
    return JSON.parse(output);
  } catch {
    throw new Error("Could not read media information from this link.");
  }
}

function getDownloadFormat(info, platform) {
  const formats = Array.isArray(info.formats) ? info.formats : [];

  if (platform === "pinterest") {
    const videos = formats
      .filter(
        (format) =>
          format.format_id &&
          format.vcodec &&
          format.vcodec !== "none" &&
          format.ext === "mp4",
      )
      .sort(
        (a, b) =>
          (b.height || 0) - (a.height || 0) || (b.tbr || 0) - (a.tbr || 0),
      );

    const audios = formats
      .filter(
        (format) =>
          format.format_id &&
          format.acodec &&
          format.acodec !== "none" &&
          (!format.vcodec || format.vcodec === "none"),
      )
      .sort((a, b) => (b.abr || 0) - (a.abr || 0));

    if (videos.length && audios.length) {
      return `${videos[0].format_id}+${audios[0].format_id}`;
    }

    if (videos.length) {
      return videos[0].format_id;
    }
  }

  return "bestvideo*+bestaudio/best";
}

function getMediaType(info) {
  const extension = (info.ext || "").toLowerCase();

  if (["jpg", "jpeg", "png", "webp", "gif", "avif"].includes(extension)) {
    return "image";
  }

  return "video";
}

export async function inspectSocialMedia(rawUrl, platform) {
  const url = validateUrl(rawUrl, platform);

  try {
    const info = await getYtDlpInfo(url);

    return {
      success: true,
      platform,
      title: info.title || "Media preview",
      thumbnail: info.thumbnail || info.thumbnails?.at(-1)?.url || null,
      duration: Number.isFinite(info.duration) ? info.duration : null,
      mediaType: getMediaType(info),
      webpageUrl: info.webpage_url || url,
    };
  } catch (ytError) {
    try {
      const { imageUrl, webpageUrl } = await getPageImage(url, platform);

      return {
        success: true,
        platform,
        title: `${platform} image`,
        thumbnail: imageUrl,
        duration: null,
        mediaType: "image",
        webpageUrl,
      };
    } catch (imageError) {
      throw new Error(
        `Could not inspect this post. ${imageError.message || ytError.message}`,
      );
    }
  }
}

export async function downloadSocialMedia(rawUrl, platform, res) {
  const url = validateUrl(rawUrl, platform);
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "snapload-"));

  try {
    let info = null;

    try {
      info = await getYtDlpInfo(url);
    } catch {
      // Image-only posts may not have video formats.
    }

    if (info && getMediaType(info) !== "image") {
      const format = getDownloadFormat(info, platform);

      await runYtDlp(
        [
          "--no-warnings",
          "--no-playlist",
          "--restrict-filenames",
          "--max-filesize",
          String(MAX_VIDEO_SIZE),
          "-f",
          format,
          "--merge-output-format",
          "mp4",
          "-o",
          path.join(tempDir, "%(title).80s.%(ext)s"),
          url,
        ],
        180000,
      );

      const files = await fs.readdir(tempDir);

      const mediaFiles = files.filter((name) =>
        /\.(mp4|webm|mkv|mov|m4v|jpg|jpeg|png|webp|gif|avif)$/i.test(name),
      );

      if (!mediaFiles.length) {
        throw new Error("No downloadable media was found.");
      }

      const filename = mediaFiles[0];

      return res.download(
        path.join(tempDir, filename),
        filename,
        async (error) => {
          await fs
            .rm(tempDir, { recursive: true, force: true })
            .catch(() => {});

          if (error && !res.headersSent) {
            res.status(500).json({
              success: false,
              message: "The download could not be completed.",
            });
          }
        },
      );
    }

    const { imageUrl } = await getPageImage(url, platform);

    await downloadImage(imageUrl, platform, res);
  } catch (error) {
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});

    if (!res.headersSent) {
      throw error;
    }
  }
}
