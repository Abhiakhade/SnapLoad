const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "https://snapload-api-s3xf.onrender.com/api"
).replace(/\/$/, "");

export async function inspectSocialMedia(platform, url) {
  if (!["instagram", "pinterest"].includes(platform)) {
    throw new Error("Unsupported platform.");
  }

  const response = await fetch(`${API_BASE_URL}/${platform}/info`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Could not check this link.");
  }

  return data.media;
}

export function getSocialMediaDownloadUrl(platform, url) {
  if (!["instagram", "pinterest"].includes(platform)) {
    throw new Error("Unsupported platform.");
  }

  return `${API_BASE_URL}/${platform}/download?url=${encodeURIComponent(url)}`;
}
