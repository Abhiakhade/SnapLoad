function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`;
}

export default function DownloadLoader({
  progress = null,
  downloadedBytes = 0,
  totalBytes = null,
  isDownloading = false,
}) {
  if (!isDownloading) return null;

  const hasKnownTotal =
    Number.isFinite(totalBytes) && totalBytes > 0 && Number.isFinite(progress);

  const safeProgress = hasKnownTotal
    ? Math.min(100, Math.max(0, progress))
    : null;

  return (
    <div
      className="mt-5 rounded-2xl border border-red-100 bg-red-50/70 p-4"
      role="status"
      aria-live="polite"
      aria-label={
        hasKnownTotal
          ? `Downloading video: ${Math.round(safeProgress)} percent`
          : "Downloading video"
      }
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-red-600 shadow-sm">
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

          <div>
            <p className="text-sm font-bold text-slate-900">
              Downloading your video
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {hasKnownTotal
                ? `${formatBytes(downloadedBytes)} of ${formatBytes(totalBytes)}`
                : `${formatBytes(downloadedBytes)} downloaded`}
            </p>
          </div>
        </div>

        <span className="shrink-0 text-sm font-bold tabular-nums text-red-600">
          {hasKnownTotal ? `${Math.round(safeProgress)}%` : "In progress"}
        </span>
      </div>

      <div
        className="h-2.5 w-full overflow-hidden rounded-full bg-red-100"
        role="progressbar"
        aria-label="Video download progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={hasKnownTotal ? Math.round(safeProgress) : undefined}
      >
        {hasKnownTotal ? (
          <div
            className="h-full rounded-full bg-gradient-to-r from-red-500 to-rose-600 transition-[width] duration-200 ease-out"
            style={{ width: `${safeProgress}%` }}
          />
        ) : (
          <div className="h-full w-1/3 animate-[download-slide_1.2s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-red-500 to-rose-600" />
        )}
      </div>

      <p className="mt-3 text-xs text-slate-500">
        Keep this tab open until the download finishes.
      </p>

      <style>{`
        @keyframes download-slide {
          0% { transform: translateX(-110%); }
          100% { transform: translateX(310%); }
        }
      `}</style>
    </div>
  );
}
