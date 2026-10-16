import { Router } from "express";
import { getYouTubeMetadata } from "../services/youtube.service.js";

const router = Router();

const platforms = {
  Instagram: ["instagram.com"],
  YouTube: ["youtube.com", "youtu.be"],
  Pinterest: ["pinterest.com", "pin.it"],
};

function detectPlatform(url) {
  const host = url.hostname.toLowerCase().replace(/^www\./, "");

  for (const [name, domains] of Object.entries(platforms)) {
    if (
      domains.some((domain) => host === domain || host.endsWith(`.${domain}`))
    ) {
      return name;
    }
  }

  return null;
}

function validateUrl(inputUrl, res) {
  if (typeof inputUrl !== "string" || inputUrl.length > 2048) {
    res.status(400).json({
      success: false,
      message: "Please provide a valid URL.",
    });
    return null;
  }

  let parsedUrl;

  try {
    parsedUrl = new URL(inputUrl);
  } catch {
    res.status(400).json({
      success: false,
      message: "Invalid URL.",
    });
    return null;
  }

  if (parsedUrl.protocol !== "https:") {
    res.status(400).json({
      success: false,
      message: "Only HTTPS links are supported.",
    });
    return null;
  }

  const platform = detectPlatform(parsedUrl);

  if (!platform) {
    res.status(422).json({
      success: false,
      message: "This platform is not supported.",
    });
    return null;
  }

  return { parsedUrl, platform };
}

router.post("/detect", (req, res) => {
  const result = validateUrl(req.body?.url, res);

  if (!result) return;

  return res.json({
    success: true,
    platform: result.platform,
    message: "Platform detected. Media availability has not yet been checked.",
  });
});

router.post("/info", async (req, res) => {
  const result = validateUrl(req.body?.url, res);

  if (!result) return;

  const { parsedUrl, platform } = result;

  if (platform === "YouTube") {
    try {
      const metadata = await getYouTubeMetadata(parsedUrl.href);

      return res.json({
        success: true,
        platform: "YouTube",
        status: "metadata_available",
        ...metadata,
        downloadable: false,
        message: "Video metadata retrieved successfully.",
      });
    } catch (error) {
      const status = [400, 404, 429, 503].includes(error.status)
        ? error.status
        : 502;

      return res.status(status).json({
        success: false,
        platform: "YouTube",
        message: error.message || "Unable to retrieve video information.",
      });
    }
  }

  return res.json({
    success: true,
    platform,
    status: "integration_pending",
    title: null,
    thumbnail: null,
    downloadable: false,
    message:
      "The link is valid. An authorized media integration is required to retrieve content.",
  });
});

export default router;
