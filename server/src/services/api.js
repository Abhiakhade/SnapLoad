const API_BASE_URL = "http://localhost:5000/api";

function isYouTubeUrl(url) {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");

    return (
      hostname === "youtube.com" ||
      hostname.endsWith(".youtube.com") ||
      hostname === "youtu.be"
    );
  } catch {
    return false;
  }
}

export async function getMediaInfo(url) {
  let parsed;

  try {
    parsed = new URL(url);
  } catch {
    throw new Error("Please enter a valid video URL.");
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Only HTTP and HTTPS URLs are supported.");
  }

  if (isYouTubeUrl(url)) {
    const response = await fetch(`${API_BASE_URL}/info`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Unable to retrieve video information.");
    }

    return {
      ...data,
      sourceUrl: url,
      downloadable: true,
      downloadType: "youtube",
    };
  }

  const response = await fetch(
    `${API_BASE_URL}/direct-media/inspect?url=${encodeURIComponent(url)}`,
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Unable to inspect this video.");
  }

  return {
    ...data,
    title: data.title || data.video?.filename || "Video file",
    sourceUrl: url,
    downloadable: true,
    downloadType: "direct",
  };
}

export function getYouTubeDownloadUrl(url, quality = "720p") {
  const params = new URLSearchParams({
    url,
    quality,
  });

  return `${API_BASE_URL}/youtube/download?${params.toString()}`;
}

export function getDirectVideoDownloadUrl(url) {
  return `${API_BASE_URL}/direct-media/download?url=${encodeURIComponent(url)}`;
}
