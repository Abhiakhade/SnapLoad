export default function StatusMessage({ status, loading, onDismiss }) {
  if (!status) return null;
  const tone =
    status.type === "error"
      ? "border-rose-400/20 bg-rose-500/[0.07]"
      : status.type === "success"
        ? "border-emerald-400/20 bg-emerald-500/[0.07]"
        : "border-sky-400/20 bg-sky-500/[0.07]";
  const iconTone =
    status.type === "error"
      ? "bg-rose-500/15 text-rose-300"
      : status.type === "success"
        ? "bg-emerald-500/15 text-emerald-300"
        : "bg-sky-500/15 text-sky-300";
  return (
    <div
      role="status"
      aria-live="polite"
      className={`snap-in mt-4 flex items-start gap-3 rounded-2xl border p-4 ${tone}`}
    >
      <span
        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm ${iconTone}`}
      >
        {status.type === "error" ? "!" : status.type === "success" ? "✓" : "…"}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-white">
          {status.type === "error"
            ? "Couldn't check this link"
            : status.type === "success"
              ? "Link check complete"
              : "Checking link"}
        </p>
        <p className="mt-1 break-words text-sm leading-6 text-slate-300">
          {status.text}
        </p>
      </div>
      {!loading && (
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-lg px-2 py-1 text-slate-400 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-rose-400"
          aria-label="Dismiss message"
        >
          ×
        </button>
      )}
    </div>
  );
}
