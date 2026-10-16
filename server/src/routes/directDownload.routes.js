import { Router } from "express";
import dns from "node:dns/promises";
import net from "node:net";

const router = Router();

const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
  "application/octet-stream",
];

function isPrivateIPv4(ip) {
  const parts = ip.split(".").map(Number);

  if (parts.length !== 4 || parts.some((n) => n < 0 || n > 255)) {
    return true;
  }

  const [a, b] = parts;

  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    a >= 224 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 198 && (b === 18 || b === 19))
  );
}

function isPublicAddress(ip) {
  const version = net.isIP(ip);

  if (version === 4) {
    return !isPrivateIPv4(ip);
  }

  if (version === 6) {
    const normalized = ip.toLowerCase();

    // Allow only globally routable IPv6 addresses.
    return normalized.startsWith("2") || normalized.startsWith("3");
  }

  return false;
}

async function validateDirectVideoUrl(rawUrl) {
  let parsed;

  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error("Enter a valid video URL.");
  }

  if (parsed.protocol !== "https:") {
    throw new Error("Only HTTPS video URLs are supported.");
  }

  if (parsed.username || parsed.password) {
    throw new Error("URLs containing credentials are not supported.");
  }

  if (parsed.port && parsed.port !== "443") {
    throw new Error("Only standard HTTPS port 443 is supported.");
  }

  const hostname = parsed.hostname.toLowerCase();

  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local")
  ) {
    throw new Error("This hostname is not allowed.");
  }

  const addresses = await dns.lookup(hostname, { all: true });

  if (
    !addresses.length ||
    addresses.some(({ address }) => !isPublicAddress(address))
  ) {
    throw new Error(
      "This hostname does not resolve to a permitted public address.",
    );
  }

  return parsed;
}

router.get("/inspect", async (req, res) => {
  let response;

  try {
    const parsedUrl = await validateDirectVideoUrl(req.query.url);

    // Some servers reject HEAD. This route therefore uses GET with
    // a one-byte range and does not download the entire video.
    response = await fetch(parsedUrl, {
      method: "GET",
      headers: { Range: "bytes=0-0" },
      redirect: "manual",
      signal: AbortSignal.timeout(10000),
    });

    if (response.status >= 300 && response.status < 400) {
      return res.status(400).json({
        success: false,
        message: "Redirected video URLs are not supported by this endpoint.",
      });
    }

    const contentType = (response.headers.get("content-type") || "")
      .split(";")[0]
      .trim()
      .toLowerCase();

    const contentRange = response.headers.get("content-range");
    const contentLength = Number(response.headers.get("content-length") || 0);

    const isVideo =
      contentType.startsWith("video/") ||
      ALLOWED_VIDEO_TYPES.includes(contentType);

    if (
      !response.ok ||
      !isVideo ||
      (response.status === 200 && !contentRange && contentLength > 10_000_000)
    ) {
      return res.status(400).json({
        success: false,
        message: "This URL does not appear to provide a direct video file.",
      });
    }

    return res.json({
      success: true,
      title: decodeURIComponent(parsedUrl.pathname.split("/").pop() || "Video"),
      contentType,
      contentLength: contentLength || null,
      sourceUrl: parsedUrl.toString(),
      downloadable: true,
      downloadType: "direct",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error.name === "TimeoutError"
          ? "The video server took too long to respond."
          : error.message || "Unable to inspect this video URL.",
    });
  } finally {
    if (response?.body) {
      await response.body.cancel().catch(() => {});
    }
  }
});

router.get("/download", async (req, res) => {
  let upstream;

  try {
    const parsedUrl = await validateDirectVideoUrl(req.query.url);

    upstream = await fetch(parsedUrl, {
      redirect: "manual",
      signal: AbortSignal.timeout(120000),
    });

    if (upstream.status >= 300 && upstream.status < 400) {
      return res.status(400).json({
        success: false,
        message: "Redirected URLs are not supported by this endpoint.",
      });
    }

    const contentType = (upstream.headers.get("content-type") || "")
      .split(";")[0]
      .trim()
      .toLowerCase();

    if (!upstream.ok || !contentType.startsWith("video/")) {
      return res.status(400).json({
        success: false,
        message: "The URL does not return a direct video file.",
      });
    }

    const length = Number(upstream.headers.get("content-length") || 0);

    if (length > 500 * 1024 * 1024) {
      await upstream.body?.cancel().catch(() => {});
      return res.status(413).json({
        success: false,
        message: "Videos larger than 500 MB are not supported.",
      });
    }

    const extensionByType = {
      "video/mp4": "mp4",
      "video/webm": "webm",
      "video/ogg": "ogv",
      "video/quicktime": "mov",
    };

    const extension = extensionByType[contentType] || "video";

    res.setHeader("Content-Type", contentType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="snapload-video.${extension}"`,
    );

    if (length) {
      res.setHeader("Content-Length", String(length));
    }

    const { Readable } = await import("node:stream");
    const { pipeline } = await import("node:stream/promises");

    await pipeline(Readable.fromWeb(upstream.body), res);
  } catch (error) {
    if (!res.headersSent) {
      res.status(400).json({
        success: false,
        message:
          error.name === "TimeoutError"
            ? "The video server took too long to respond."
            : error.message || "Unable to download this video.",
      });
    } else {
      res.destroy(error);
    }
  }
});

export default router;
