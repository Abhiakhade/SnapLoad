const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "https://snapload-api-s3xf.onrender.com/api"
).replace(/\/$/, "");

// Detect YouTube links.
function isYouTubeUrl(url) {
  try {
    const host = new URL(url).hostname.toLowerCase().replace(/^www\./, "");

    return (
      host === "youtube.com" ||
      host.endsWith(".youtube.com") ||
      host === "youtu.be"
    );
  } catch {
    return false;
  }
}

// Detect Instagram and Pinterest links.
function getSocialPlatform(url) {
  try {
    const host = new URL(url).hostname.toLowerCase().replace(/^www\./, "");

    if (host === "instagram.com" || host.endsWith(".instagram.com")) {
      return "instagram";
    }

    if (
      host === "pinterest.com" ||
      host.endsWith(".pinterest.com") ||
      host === "pin.it"
    ) {
      return "pinterest";
    }

    return null;
  } catch {
    return null;
  }
}

// Parse API responses and report server errors.
async function readResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(
      data.message || `Request failed with status ${response.status}.`,
    );
  }

  return data;
}

// Retrieve media information from the correct platform endpoint.
export async function getMediaInfo(url) {
  let parsedUrl;

  try {
    parsedUrl = new URL(url.trim());
  } catch {
    throw new Error("Please enter a valid media URL.");
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("Only HTTP and HTTPS URLs are supported.");
  }

  const normalizedUrl = parsedUrl.toString();

  // YouTube metadata.
  if (isYouTubeUrl(normalizedUrl)) {
    const response = await fetch(`${API_BASE_URL}/info`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: normalizedUrl }),
    });

    const data = await readResponse(response);

    return {
      ...data,
      success: true,
      sourceUrl: normalizedUrl,
      platform: "YouTube",
      downloadable: true,
      downloadType: "youtube",
    };
  }

  // Instagram and Pinterest metadata.
  const socialPlatform = getSocialPlatform(normalizedUrl);

  if (socialPlatform) {
    const response = await fetch(`${API_BASE_URL}/${socialPlatform}/info`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: normalizedUrl }),
    });

    const data = await readResponse(response);

    return {
      ...data,
      ...(data.media || {}),
      success: true,
      sourceUrl: normalizedUrl,
      platform: socialPlatform === "instagram" ? "Instagram" : "Pinterest",
      downloadable: true,
      downloadType: socialPlatform,
    };
  }

  // Direct media URLs, such as permitted HTTPS MP4 links.
  const response = await fetch(
    `${API_BASE_URL}/direct-media/inspect?url=${encodeURIComponent(
      normalizedUrl,
    )}`,
  );

  const data = await readResponse(response);

  return {
    ...data,
    success: true,
    title: data.title || data.video?.filename || "Media file",
    sourceUrl: normalizedUrl,
    downloadable: true,
    downloadType: "direct",
  };
}

// YouTube download URL with quality selection.
export function getYouTubeDownloadUrl(url, quality = "720p") {
  return (
    `${API_BASE_URL}/youtube/download` +
    `?url=${encodeURIComponent(url)}` +
    `&quality=${encodeURIComponent(quality)}`
  );
}

// Direct media download URL.
export function getDirectVideoDownloadUrl(url) {
  return (
    `${API_BASE_URL}/direct-media/download` + `?url=${encodeURIComponent(url)}`
  );
}

// Instagram and Pinterest download URLs.
export function getSocialDownloadUrl(platform, url) {
  const normalizedPlatform = platform.toLowerCase();

  if (!["instagram", "pinterest"].includes(normalizedPlatform)) {
    throw new Error("Unsupported social platform.");
  }

  return (
    `${API_BASE_URL}/${normalizedPlatform}/download` +
    `?url=${encodeURIComponent(url)}`
  );
}
