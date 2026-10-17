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
  const platformLabel =
    mediaInfo.platform || (isYouTube ? "YouTube" : "Direct video");

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
        downloadType,
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
    <section className="relative mt-8 w-full min-w-0 overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-b from-slate-900/90 to-slate-950/95 text-slate-100 shadow-2xl shadow-black/40 ring-1 ring-inset ring-white/5 backdrop-blur-xl">
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-rose-500/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-24 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl"
      />

      {/* Header */}
      <header className="relative flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4 sm:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 text-white shadow-lg shadow-rose-900/40">
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
            <h2 className="truncate text-[15px] font-semibold tracking-tight text-white">
              {isImage ? "Your image" : "Your video"}
            </h2>
            <p className="text-xs text-slate-400">Preview and download</p>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${
            isDownloading
              ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
              : "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span
              className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${
                isDownloading ? "bg-amber-400" : "bg-emerald-400"
              }`}
            />
            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${
                isDownloading ? "bg-amber-400" : "bg-emerald-400"
              }`}
            />
          </span>
          {isDownloading ? "Downloading" : "Ready"}
        </span>
      </header>

      {/* Body */}
      <div className="relative grid min-w-0 gap-6 p-5 sm:p-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-10">
        {/* Preview column */}
        <div className="min-w-0">
          <div className="group relative overflow-hidden rounded-2xl bg-slate-800 ring-1 ring-white/10">
            {mediaInfo.thumbnail ? (
              <img
                src={mediaInfo.thumbnail}
                alt={`${title} thumbnail`}
                className="aspect-video w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                loading="lazy"
              />
            ) : (
              <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  className="h-14 w-14 text-slate-600"
                  aria-hidden="true"
                >
                  <rect x="3" y="5" width="18" height="14" rx="3" />
                  <path d="m10 9 5 3-5 3V9Z" />
                </svg>
              </div>
            )}

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"
            />

            <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-slate-950/60 px-3 py-1 text-[11px] font-semibold tracking-wide text-white backdrop-blur-md">
              {platformLabel}
            </span>
          </div>

          <h3 className="mt-5 break-words text-lg font-semibold leading-snug tracking-tight text-white sm:text-xl">
            {title}
          </h3>

          {mediaInfo.channelTitle && (
            <p className="mt-1.5 break-words text-sm text-slate-400">
              {mediaInfo.channelTitle}
            </p>
          )}

          <div className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-slate-300">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-3.5 w-3.5 text-emerald-400"
              aria-hidden="true"
            >
              <path
                d="m5 12 5 5L20 7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Metadata retrieved
          </div>
        </div>

        {/* Settings column */}
        <div className="flex min-w-0 flex-col">
          <div>
            <p
              id="snapload-quality-label"
              className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400"
            >
              Download settings
            </p>

            {isYouTube ? (
              <>
                <div
                  role="radiogroup"
                  aria-labelledby="snapload-quality-label"
                  className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3"
                >
                  {QUALITY_OPTIONS.map((option) => {
                    const active = quality === option.value;
                    const isBest = option.value === "best";

                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        disabled={isDownloading}
                        onClick={() => setQuality(option.value)}
                        className={`rounded-xl border px-3 py-2.5 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/60 disabled:cursor-not-allowed disabled:opacity-50 ${
                          isBest ? "col-span-2 sm:col-span-3" : ""
                        } ${
                          active
                            ? "border-rose-400/60 bg-rose-500/15 shadow-[0_0_0_1px_rgba(244,63,94,0.25)]"
                            : "border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.07]"
                        }`}
                      >
                        <span
                          className={`block text-sm font-semibold ${
                            active ? "text-white" : "text-slate-200"
                          }`}
                        >
                          {option.label}
                        </span>
                        <span
                          className={`block text-[11px] ${
                            active ? "text-rose-200" : "text-slate-500"
                          }`}
                        >
                          {option.description}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <p className="mt-3 text-xs leading-5 text-slate-500">
                  Actual quality depends on the formats available for this
                  video.
                </p>
              </>
            ) : (
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-sm font-semibold text-slate-100">
                  {isImage
                    ? "Image file"
                    : isSocial
                      ? "Available media file"
                      : "Original media file"}
                </p>
                <p className="mt-1.5 text-xs leading-5 text-slate-400">
                  {isSocial
                    ? "The platform route retrieves supported public media. Availability may vary."
                    : "The source file is downloaded without quality conversion."}
                </p>
              </div>
            )}
          </div>

          <div className="mt-auto pt-6">
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-rose-900/40 transition hover:from-rose-400 hover:to-rose-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-rose-400/30 active:scale-[0.99] disabled:cursor-wait disabled:opacity-70"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full"
              />
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

            <p className="mt-3 text-center text-[11px] leading-5 text-slate-500">
              Use only media you own or have permission to download.
            </p>
          </div>
        </div>
      </div>

      {/* Status area */}
      {(isDownloading || message || error) && (
        <div className="relative border-t border-white/10 px-5 py-5 sm:px-8">
          <DownloadLoader
            isDownloading={isDownloading}
            progress={progress}
            downloadedBytes={downloadedBytes}
            totalBytes={totalBytes}
          />

          {message && (
            <p
              role="status"
              className="mt-4 break-words rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm leading-6 text-emerald-200"
            >
              {message}
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="mt-4 whitespace-pre-wrap break-words rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm leading-6 text-rose-200"
            >
              {error}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
