import { Router } from "express";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const router = Router();
const execFileAsync = promisify(execFile);

const MAX_FILE_SIZE = 500 * 1024 * 1024;
const DOWNLOAD_TIMEOUT = 5 * 60 * 1000;

const QUALITY_HEIGHTS = {
  "144p": 144,
  "240p": 240,
  "360p": 360,
  "480p": 480,
  "720p": 720,
  "1080p": 1080,
  "1440p": 1440,
  "2160p": 2160,
};

function validateYouTubeUrl(rawUrl) {
  let parsed;

  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error("Enter a valid YouTube video URL.");
  }

  const hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");

  const allowedHosts = [
    "youtube.com",
    "m.youtube.com",
    "music.youtube.com",
    "youtu.be",
  ];

  if (parsed.protocol !== "https:" || !allowedHosts.includes(hostname)) {
    throw new Error("Enter a valid HTTPS YouTube video URL.");
  }

  let videoId;

  if (hostname === "youtu.be") {
    videoId = parsed.pathname.split("/").filter(Boolean)[0];
  } else {
    videoId = parsed.searchParams.get("v");

    if (!videoId) {
      const parts = parsed.pathname.split("/").filter(Boolean);

      if (["shorts", "embed", "live"].includes(parts[0])) {
        videoId = parts[1];
      }
    }
  }

  if (!videoId || !/^[A-Za-z0-9_-]{11}$/.test(videoId)) {
    throw new Error("Could not find a valid YouTube video ID.");
  }

  return `https://www.youtube.com/watch?v=${videoId}`;
}

function getFormatSelector(quality) {
  if (quality === "best") {
    return "bestvideo+bestaudio/best";
  }

  const height = QUALITY_HEIGHTS[quality];

  if (!height) {
    throw new Error("Unsupported quality selection.");
  }

  // Prefer MP4 video + M4A audio, then fall back to another
  // available format at or below the requested resolution.
  return (
    `bestvideo[height<=${height}][ext=mp4]+bestaudio[ext=m4a]` +
    `/best[height<=${height}][ext=mp4]` +
    `/best[height<=${height}]`
  );
}

router.get("/download", async (req, res) => {
  let workDirectory;

  try {
    const videoUrl = validateYouTubeUrl(req.query.url);
    const quality =
      typeof req.query.quality === "string" ? req.query.quality : "720p";

    const formatSelector = getFormatSelector(quality);

    const pythonCommand = process.platform === "win32" ? "py" : "python3";

    workDirectory = await mkdtemp(path.join(tmpdir(), "snapload-"));

    const outputTemplate = path.join(workDirectory, "video.%(ext)s");

    await execFileAsync(
      pythonCommand,
      [
        "-m",
        "yt_dlp",
        "--js-runtimes",
        "node",
        "--no-playlist",
        "--no-warnings",
        "--no-progress",
        "--max-filesize",
        String(MAX_FILE_SIZE),
        "-f",
        formatSelector,
        "--merge-output-format",
        "mp4",
        "-o",
        outputTemplate,
        videoUrl,
      ],
      {
        timeout: DOWNLOAD_TIMEOUT,
        maxBuffer: 5 * 1024 * 1024,
        windowsHide: true,
      },
    );

    const files = await readdir(workDirectory);

    const downloadedFile = files.find((file) =>
      /^video\.(mp4|webm|mkv|mov)$/i.test(file),
    );

    if (!downloadedFile) {
      throw new Error("No supported video file was produced.");
    }

    const filePath = path.join(workDirectory, downloadedFile);
    const extension = path.extname(downloadedFile).toLowerCase();

    const contentTypes = {
      ".mp4": "video/mp4",
      ".webm": "video/webm",
      ".mkv": "video/x-matroska",
      ".mov": "video/quicktime",
    };

    res.setHeader(
      "Content-Type",
      contentTypes[extension] || "application/octet-stream",
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="snapload-${quality}${extension}"`,
    );

    res.download(filePath, `snapload-${quality}${extension}`, async (error) => {
      await rm(workDirectory, {
        recursive: true,
        force: true,
      }).catch(() => {});

      if (error && !res.headersSent) {
        res.status(500).json({
          success: false,
          message: "Unable to send the video file.",
        });
      }
    });
  } catch (error) {
    if (workDirectory) {
      await rm(workDirectory, {
        recursive: true,
        force: true,
      }).catch(() => {});
    }

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message:
          error.stderr?.trim() || error.message || "YouTube download failed.",
      });
    }
  }
});

export default router;
