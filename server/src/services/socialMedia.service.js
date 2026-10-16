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

const WINDOWS = process.platform === "win32";

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

  const allowedHosts = ALLOWED_HOSTS[platform];

  if (
    parsed.protocol !== "https:" ||
    !allowedHosts ||
    !allowedHosts.includes(parsed.hostname.toLowerCase())
  ) {
    throw new Error(`Enter a supported public ${platform} HTTPS URL.`);
  }

  if (parsed.username || parsed.password) {
    throw new Error("URLs containing credentials are not supported.");
  }

  parsed.hash = "";
  return parsed.toString();
}

/**
 * Runs yt-dlp:
 * - Windows default: py -m yt_dlp
 * - Linux default: yt-dlp
 * - Custom executable: set YTDLP_BIN
 *
 * If YTDLP_BIN is set, it is treated as an executable path,
 * not as a command plus arguments.
 */
async function runYtDlp(args, timeout = 90_000) {
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
      if (WINDOWS && !customExecutable) {
        throw new Error(
          'Python or yt-dlp was not found. Run "py -m yt_dlp --version" in PowerShell to check your installation.',
        );
      }

      throw new Error(
        "yt-dlp was not found. Install it or configure YTDLP_BIN to point to the executable.",
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

export async function inspectSocialMedia(rawUrl, platform) {
  const url = validateUrl(rawUrl, platform);

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
    90_000,
  );

  let info;

  try {
    info = JSON.parse(output);
  } catch {
    throw new Error("Could not read media information from this link.");
  }

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

    // Return the first file if the post contains multiple items.
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
