import { useState } from "react";
import {
  getDirectVideoDownloadUrl,
  getYouTubeDownloadUrl,
  getSocialDownloadUrl,
} from "../services/api";
import DownloadLoader from "./DownloadLoader";

const QUALITY_OPTIONS = [
  { value: "144p", label: "144p", description: "Low" },
  { value: "240p", label: "240p", description: "Basic" },
  { value: "360p", label: "360p", description: "Standard" },
  { value: "480p", label: "480p", description: "SD" },
  { value: "720p", label: "720p", description: "HD" },
  { value: "1080p", label: "1080p", description: "Full HD" },
  { value: "1440p", label: "1440p", description: "2K" },
  { value: "2160p", label: "2160p", description: "4K" },
  { value: "best", label: "Best available", description: "Maximum" },
];

function getDownloadFilename(response, isYouTube, quality, platform) {
  const disposition = response.headers.get("content-disposition");
  const match = disposition?.match(/filename="?([^";]+)"?/i);

  if (match?.[1]) return match[1];
  if (isYouTube) return `snapload-${quality}.mp4`;
  if (platform === "instagram") return "snapload-instagram-media";
  if (platform === "pinterest") return "snapload-pinterest-media";
  return "snapload-media";
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export default function MediaResultCard({ mediaInfo }) {
  const [quality, setQuality] = useState("720p");
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(null);
  const [downloadedBytes, setDownloadedBytes] = useState(0);
  const [totalBytes, setTotalBytes] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (!mediaInfo) return null;

  const downloadType = String(mediaInfo.downloadType || "direct").toLowerCase();
  const isYouTube = downloadType === "youtube";
  const isSocial = ["instagram", "pinterest"].includes(downloadType);
  const isImage = mediaInfo.mediaType === "image";
  const title = mediaInfo.title || (isImage ? "Your image" : "Your media");

  async function handleDownload() {
    if (isDownloading) return;

    if (!mediaInfo.sourceUrl) {
      setError("Video URL is missing. Please submit the link again.");
      return;
    }

    setIsDownloading(true);
    setProgress(null);
    setDownloadedBytes(0);
    setTotalBytes(null);
    setMessage("");
    setError("");

    let reader;

    try {
      let downloadUrl;

      if (isYouTube) {
        downloadUrl = getYouTubeDownloadUrl(mediaInfo.sourceUrl, quality);
      } else if (isSocial) {
        downloadUrl = getSocialDownloadUrl(downloadType, mediaInfo.sourceUrl);
      } else {
        downloadUrl = getDirectVideoDownloadUrl(mediaInfo.sourceUrl);
      }

      const response = await fetch(downloadUrl);

      if (!response.ok) {
        let errorMessage = "Unable to download the video.";

        try {
          const data = await response.json();
          errorMessage = data.message || errorMessage;
        } catch {
          // Use the fallback for non-JSON responses.
        }

        throw new Error(errorMessage);
      }

      const contentLength = Number(response.headers.get("content-length"));
      const knownTotal =
        Number.isFinite(contentLength) && contentLength > 0
          ? contentLength
          : null;

      setTotalBytes(knownTotal);

      if (!response.body) {
        throw new Error(
          "Your browser cannot read the download stream. Please try another browser.",
        );
      }

      reader = response.body.getReader();

      const chunks = [];
      let received = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        received += value.byteLength;
        setDownloadedBytes(received);

        if (knownTotal) {
          setProgress(Math.min(100, (received / knownTotal) * 100));
        }
      }

      if (!received) throw new Error("The downloaded file is empty.");

      const contentType =
        response.headers.get("content-type") || "application/octet-stream";
      const blob = new Blob(chunks, { type: contentType });
      const filename = getDownloadFilename(
        response,
        isYouTube,
        quality,
        downloadType
      );
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);

      setProgress(100);
      setMessage(
        `Download ready (${formatBytes(received)}). Check your browser's downloads.`,
      );
    } catch (err) {
      if (reader) {
        try {
          await reader.cancel();
        } catch {
          // Ignore cleanup errors.
        }
      }

      setError(err.message || "Download failed. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <section className="mt-6 w-full min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-white text-slate-900 shadow-2xl shadow-black/25">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                d="M12 3v12m0 0 4-4m-4 4-4-4M5 16v4h14v-4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="min-w-0">
            <h2 className="font-bold">Your video</h2>
            <p className="text-xs text-slate-500">Preview and download</p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {isDownloading ? "Downloading" : "Ready"}
        </span>
      </div>

      <div className="grid min-w-0 gap-5 p-4 sm:p-6 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] md:gap-6">
        <div className="min-w-0">
          <div className="overflow-hidden rounded-2xl bg-slate-100">
            {mediaInfo.thumbnail ? (
              <img
                src={mediaInfo.thumbnail}
                alt={`${title} thumbnail`}
                className="aspect-video w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex aspect-video items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="h-12 w-12 text-slate-300"
                  aria-hidden="true"
                >
                  <rect x="3" y="5" width="18" height="14" rx="3" />
                  <path d="m10 9 5 3-5 3V9Z" />
                </svg>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
              {mediaInfo.platform || (isYouTube ? "YouTube" : "Direct video")}
            </span>
            <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
              Metadata retrieved
            </span>
          </div>

          <h3 className="mt-3 break-words text-base font-bold leading-snug sm:text-lg">
            {title}
          </h3>

          {mediaInfo.channelTitle && (
            <p className="mt-1 break-words text-sm text-slate-500">
              {mediaInfo.channelTitle}
            </p>
          )}
        </div>

        <div className="flex min-w-0 flex-col">
          <div>
            <label
              htmlFor="snapload-quality"
              className="text-sm font-bold text-slate-800"
            >
              Download settings
            </label>

            {isYouTube ? (
              <>
                <select
                  id="snapload-quality"
                  value={quality}
                  onChange={(event) => setQuality(event.target.value)}
                  disabled={isDownloading}
                  className="mt-3 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium outline-none transition focus:border-rose-500 focus:ring-4 focus:ring-rose-100 disabled:opacity-60"
                >
                  {QUALITY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} — {option.description}
                    </option>
                  ))}
                </select>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Actual quality depends on the formats available for this
                  video.
                </p>
              </>
            ) : (
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-sm font-semibold text-slate-700">
                  {isImage ? "Image file" : isSocial ? "Available media file" : "Original media file"}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {isSocial
                    ? "The platform route retrieves supported public media. Availability may vary."
                    : "The source file is downloaded without quality conversion."}
                </p>
              </div>
            )}
          </div>

          <div className="mt-auto pt-5">
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700 focus:outline-none focus:ring-4 focus:ring-rose-200 active:scale-[0.99] disabled:cursor-wait disabled:opacity-70"
            >
              {isDownloading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Downloading…
                </>
              ) : (
                <>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 3v12m0 0 4-4m-4 4-4-4M5 16v4h14v-4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isYouTube
                    ? `Download ${quality}`
                    : `Download ${isImage ? "image" : "media"}`}
                </>
              )}
            </button>

            <p className="mt-3 text-center text-[11px] leading-5 text-slate-400">
              Use only media you own or have permission to download.
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 sm:px-6 sm:pb-6">
        <DownloadLoader
          isDownloading={isDownloading}
          progress={progress}
          downloadedBytes={downloadedBytes}
          totalBytes={totalBytes}
        />

        {message && (
          <p
            role="status"
            className="mt-4 break-words rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800"
          >
            {message}
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="mt-4 whitespace-pre-wrap break-words rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700"
          >
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
