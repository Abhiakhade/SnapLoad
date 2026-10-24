import { useState } from "react";
import {
  inspectSocialMedia,
  getSocialMediaDownloadUrl,
} from "../services/socialMediaApi.js";

const PLATFORM = {
  instagram: {
    name: "Instagram",
    hint: "Paste a public Instagram post or Reel URL",
    accent: "from-fuchsia-500 to-orange-400",
    icon: "◎",
  },
  pinterest: {
    name: "Pinterest",
    hint: "Paste a public Pinterest Pin URL",
    accent: "from-red-600 to-rose-400",
    icon: "P",
  },
};

export default function SocialDownloader({ platform = "instagram" }) {
  const config = PLATFORM[platform];

  const [url, setUrl] = useState("");
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCheck(event) {
    event.preventDefault();

    setError("");
    setMedia(null);
    setLoading(true);

    try {
      const result = await inspectSocialMedia(platform, url.trim());
      setMedia(result);
    } catch (err) {
      setError(err.message || "Could not check this link. Try a public URL.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80 p-3 shadow-2xl shadow-black/20 sm:p-4">
      {/* Compact platform header */}
      <div className="mb-4 flex min-w-0 items-center gap-3">
        <div
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${config.accent} text-xl font-black text-white shadow-lg`}
          aria-hidden="true"
        >
          {config.icon}
        </div>

        <div className="min-w-0">
          <h2 className="text-base font-bold leading-tight text-white sm:text-lg">
            {config.name} Downloader
          </h2>

          <p className="mt-1 text-xs leading-4 text-slate-400">
            Preview supported media and save it to your device.
          </p>
        </div>
      </div>

      {/* URL form */}
      <form onSubmit={handleCheck} className="space-y-2">
        <label
          htmlFor={`${platform}-url`}
          className="block text-xs font-semibold text-slate-200"
        >
          Media link
        </label>

        <input
          id={`${platform}-url`}
          type="url"
          required
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder={config.hint}
          className="block w-full min-w-0 rounded-lg border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-xs placeholder:text-slate-500 focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-400/20"
        />

        <button
          type="submit"
          disabled={loading || !url.trim()}
          className={`w-full rounded-lg bg-gradient-to-r ${config.accent} px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {loading ? "Checking link…" : "Check link →"}
        </button>
      </form>

      {/* Error message */}
      {error && (
        <div
          role="alert"
          className="mt-3 break-words rounded-lg border border-rose-400/20 bg-rose-500/10 p-3 text-xs leading-5 text-rose-200"
        >
          {error}
        </div>
      )}

      {/* Media preview */}
      {media && (
        <div className="mt-4 min-w-0 overflow-hidden rounded-xl border border-white/10 bg-slate-900">
          {media.thumbnail && (
            <img
              src={media.thumbnail}
              alt="Media preview"
              loading="lazy"
              className="max-h-64 w-full bg-black object-contain"
            />
          )}

          <div className="p-3 sm:p-4">
            <p className="break-words text-sm font-semibold text-white">
              {media.title}
            </p>

            <p className="mt-1 text-xs capitalize text-slate-400">
              {media.mediaType || "media"}
              {media.duration ? ` · ${Math.round(media.duration)} seconds` : ""}
            </p>

            <a
              href={getSocialMediaDownloadUrl(platform, url.trim())}
              className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-slate-200"
            >
              {media.mediaType === "image"
                ? "Download image ↓"
                : "Download media ↓"}
            </a>
            <p className="mt-2 text-[10px] leading-4 text-slate-500">
              Only download content you own or have permission to save.
              Availability and supported formats vary by platform.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
