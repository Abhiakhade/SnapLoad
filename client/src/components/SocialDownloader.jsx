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
    <section className="mx-auto w-full max-w-3xl rounded-3xl border border-white/10 bg-slate-950/80 p-5 shadow-2xl shadow-black/20 sm:p-8">
      <div className="mb-6 flex items-center gap-4">
        <div
          className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${config.accent} text-3xl font-black text-white shadow-lg`}
        >
          {config.icon}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">
            {config.name} Downloader
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Preview supported public media and save it to your device.
          </p>
        </div>
      </div>

      <form onSubmit={handleCheck} className="space-y-3">
        <label
          htmlFor={`${platform}-url`}
          className="block text-sm font-semibold text-slate-200"
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
          className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-4 text-white outline-none transition placeholder:text-slate-500 focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-400/20"
        />
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className={`w-full rounded-xl bg-gradient-to-r ${config.accent} px-5 py-4 font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {loading ? "Checking link…" : "Check link →"}
        </button>
      </form>

      {error && (
        <div
          role="alert"
          className="mt-5 rounded-xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-200"
        >
          {error}
        </div>
      )}

      {media && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
          {media.thumbnail && (
            <img
              src={media.thumbnail}
              alt="Media preview"
              className="max-h-80 w-full object-contain bg-black"
            />
          )}
          <div className="p-4 sm:p-5">
            <p className="font-semibold text-white">{media.title}</p>
            <p className="mt-1 text-sm capitalize text-slate-400">
              {media.mediaType || "media"}
              {media.duration ? ` · ${Math.round(media.duration)} seconds` : ""}
            </p>
            <a
              href={getSocialMediaDownloadUrl(platform, url.trim())}
              className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-white px-5 py-3 font-bold text-slate-950 transition hover:bg-slate-200"
            >
              Download media ↓
            </a>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              Only download content you own or have permission to save. Public
              access and supported formats vary by platform.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
