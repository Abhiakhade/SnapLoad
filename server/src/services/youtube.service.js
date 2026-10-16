function extractYouTubeVideoId(inputUrl) {
  let url;

  try {
    url = new URL(inputUrl);
  } catch {
    return null;
  }

  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  let id = null;

  if (host === "youtu.be") {
    id = url.pathname.split("/").filter(Boolean)[0];
  } else if (
    ["youtube.com", "m.youtube.com", "music.youtube.com"].includes(host)
  ) {
    if (url.pathname === "/watch") {
      id = url.searchParams.get("v");
    } else {
      const match = url.pathname.match(/^\/(shorts|embed|live)\/([^/]+)/);
      if (match) id = match[2];
    }
  }

  return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
}

export async function getYouTubeMetadata(inputUrl) {
  const videoId = extractYouTubeVideoId(inputUrl);

  if (!videoId) {
    const error = new Error("A valid YouTube video URL is required.");
    error.status = 400;
    throw error;
  }

  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    const error = new Error("YouTube API key is not configured.");
    error.status = 503;
    throw error;
  }

  const params = new URLSearchParams({
    part: "snippet",
    id: videoId,
    key: apiKey,
  });

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?${params}`,
  );

  const data = await response.json();

  if (!response.ok) {
    const reason = data?.error?.errors?.[0]?.reason;

    const error = new Error(
      reason === "quotaExceeded"
        ? "YouTube API quota exceeded. Try again later."
        : "Unable to retrieve YouTube video information.",
    );

    error.status = reason === "quotaExceeded" ? 429 : 502;
    throw error;
  }

  const video = data.items?.[0];

  if (!video) {
    const error = new Error("Video not found or its metadata is unavailable.");
    error.status = 404;
    throw error;
  }

  return {
    videoId,
    title: video.snippet.title,
    channelTitle: video.snippet.channelTitle,
    thumbnail:
      video.snippet.thumbnails?.high?.url ||
      video.snippet.thumbnails?.medium?.url ||
      video.snippet.thumbnails?.default?.url ||
      null,
    videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
  };
}
