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

function validateUrl(rawUrl, platform) {
  if (typeof rawUrl !== "string" || !rawUrl.trim()) {
    throw new Error("A media URL is required.");
  }

  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error("Enter a valid URL.");
  }

  if (
    parsed.protocol !== "https:" ||
    !ALLOWED_HOSTS[platform]?.includes(parsed.hostname.toLowerCase())
  ) {
    throw new Error(`Enter a supported public ${platform} HTTPS URL.`);
  }

  if (parsed.username || parsed.password) {
    throw new Error("URLs containing credentials are not supported.");
  }

  return parsed.toString();
}

async function runYtDlp(args, timeout = 90_000) {
  // On Windows, set YTDLP_BIN if yt-dlp is not available on PATH.
  const executable = process.env.YTDLP_BIN || "yt-dlp";

  const { stdout } = await execFileAsync(executable, args, {
    timeout,
    maxBuffer: 4 * 1024 * 1024,
    windowsHide: true,
  });

  return stdout;
}

export async function inspectSocialMedia(rawUrl, platform) {
  const url = validateUrl(rawUrl, platform);

  const output = await runYtDlp([
    "--dump-single-json",
    "--no-warnings",
    "--no-playlist",
    "--skip-download",
    "--socket-timeout",
    "20",
    url,
  ]);

  const info = JSON.parse(output);
  const extension = (info.ext || "").toLowerCase();

  return {
    success: true,
    platform,
    title: info.title || "Media preview",
    thumbnail: info.thumbnail || info.thumbnails?.at(-1)?.url || null,
    duration: Number.isFinite(info.duration) ? info.duration : null,
    mediaType: ["jpg", "jpeg", "png", "webp", "gif"].includes(extension)
      ? "image"
      : "video",
    webpageUrl: info.webpage_url || url,
  };
}

export async function downloadSocialMedia(rawUrl, platform, res) {
  const url = validateUrl(rawUrl, platform);
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "snapload-"));

  try {
    await runYtDlp(
      [
        "--no-warnings",
        "--no-playlist",
        "--restrict-filenames",
        "--max-filesize",
        "100M",
        "-f",
        "best[ext=mp4]/best",
        "-o",
        path.join(tempDir, "%(title).80s.%(ext)s"),
        url,
      ],
      180_000,
    );

    const files = await fs.readdir(tempDir);
    const mediaFiles = files.filter((name) =>
      /\.(mp4|webm|mkv|mov|jpg|jpeg|png|webp|gif)$/i.test(name),
    );

    if (mediaFiles.length === 0) {
      throw new Error("No downloadable media was found for this link.");
    }

    // If a post contains multiple items, this endpoint returns the first file.
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
