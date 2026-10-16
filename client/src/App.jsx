import { useEffect, useRef, useState } from "react";

import { getMediaInfo } from "./services/api";
import { getPlatformFromUrl } from "./utils/platform";

import CustomCursor from "./components/CustomCursor";
import BackgroundEffects from "./components/BackgroundEffects";
import Header from "./components/Header";
import DownloaderPanel from "./components/DownloaderPanel";
import MediaResultCard from "./components/MediaResultCard";
import HowItWorks from "./components/HowItWorks";
import Features from "./components/Features";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";
import PageLoader from "./components/PageLoader";
import SocialDownloader from "./components/SocialDownloader.jsx";

export default function App() {
  const [platform, setPlatform] = useState("YouTube");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [mediaInfo, setMediaInfo] = useState(null);
  const [openFaq, setOpenFaq] = useState(0);

  const requestId = useRef(0);

  useEffect(() => {
    document.documentElement.classList.add("scroll-smooth");

    return () => {
      document.documentElement.classList.remove("scroll-smooth");
    };
  }, []);

  function cancelPending() {
    requestId.current += 1;
    setLoading(false);
  }

  function applyUrl(value) {
    cancelPending();
    setUrl(value);
    setMediaInfo(null);
    setStatus(null);

    const detected = getPlatformFromUrl(value);

    if (detected) {
      setPlatform(detected);
    }
  }

  function handleUrlChange(event) {
    applyUrl(event.target.value);
  }

  async function pasteFromClipboard() {
    try {
      const clipboardText = (await navigator.clipboard.readText()).trim();

      if (!clipboardText) {
        setStatus({
          type: "error",
          text: "Your clipboard is empty.",
        });
        return;
      }

      applyUrl(clipboardText);
    } catch {
      setStatus({
        type: "error",
        text: "Clipboard access is unavailable. Paste your link into the field instead.",
      });
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) return;

    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      setMediaInfo(null);
      setStatus({
        type: "error",
        text: "Paste a link before continuing.",
      });
      return;
    }

    const detected = getPlatformFromUrl(trimmedUrl);

    if (!detected) {
      setMediaInfo(null);
      setStatus({
        type: "error",
        text: "Enter a supported Instagram, YouTube, or Pinterest URL.",
      });
      return;
    }

    const id = ++requestId.current;

    setPlatform(detected);
    setLoading(true);
    setMediaInfo(null);

    setStatus({
      type: "loading",
      text: "Checking your link with SnapLoad...",
    });

    try {
      const result = await getMediaInfo(trimmedUrl);

      if (id !== requestId.current) return;

      if (!result?.success) {
        setMediaInfo(null);
        setStatus({
          type: "error",
          text: result?.message || "Unable to process this link.",
        });
        return;
      }

      setMediaInfo({
        ...result,
        sourceUrl: trimmedUrl,
        platform: result.platform || detected,
      });

      setStatus({
        type: "success",
        text: result.message || "Media information retrieved successfully.",
      });
    } catch (error) {
      if (id !== requestId.current) return;

      setMediaInfo(null);

      setStatus({
        type: "error",
        text:
          error.message ||
          "Could not reach SnapLoad. Check your backend connection.",
      });
    } finally {
      if (id === requestId.current) {
        setLoading(false);
      }
    }
  }

  function clearForm() {
    cancelPending();
    setUrl("");
    setMediaInfo(null);
    setStatus(null);
    setPlatform("YouTube");
  }

  function selectPlatform(name) {
    cancelPending();
    setPlatform(name);
    setUrl("");
    setMediaInfo(null);
    setStatus(null);
  }

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#070914] text-white selection:bg-rose-500/30 motion-reduce:[&_*]:!animate-none motion-reduce:[&_*]:!transition-none">
      <PageLoader />

      <CustomCursor />

      <a
        href="#home"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[10000] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:text-slate-900"
      >
        Skip to content
      </a>

      <BackgroundEffects />

      <Header />

      <main id="home" className="relative z-10">
        {/* Hero and primary downloader */}
        <section className="relative px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-20 lg:pt-24">
          <div className="pointer-events-none absolute left-1/2 top-10 -z-10 h-72 w-[min(90vw,760px)] -translate-x-1/2 rounded-full bg-rose-600/10 blur-[100px]" />

          <div className="mx-auto max-w-4xl text-center">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-slate-300 shadow-lg shadow-black/10">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              One workspace. Three platforms.
            </div>

            <h1 className="mx-auto mt-7 max-w-4xl text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Your links.
              <span className="mt-2 block bg-gradient-to-r from-rose-400 via-orange-300 to-amber-200 bg-clip-text text-transparent">
                One simple workflow.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
              Paste a supported link, preview available media, and download it
              with a simple workflow.
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-400">
              <span className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                Simple workflow
              </span>

              <span className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                Mobile-friendly
              </span>

              <span className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                Supported public media
              </span>
            </div>
          </div>

          <div className="mx-auto mt-10 w-full max-w-3xl sm:mt-12">
            <DownloaderPanel
              platform={platform}
              onPlatformSelect={selectPlatform}
              url={url}
              onUrlChange={handleUrlChange}
              onPaste={pasteFromClipboard}
              onSubmit={handleSubmit}
              loading={loading}
              status={status}
              onDismissStatus={() => setStatus(null)}
              mediaInfo={mediaInfo}
              onClear={clearForm}
            />

            {mediaInfo?.success && (
              <MediaResultCard
                key={`${mediaInfo.platform || platform}:${mediaInfo.sourceUrl}`}
                mediaInfo={mediaInfo}
              />
            )}

            <p className="mx-auto mt-4 max-w-xl text-center text-xs leading-5 text-slate-500">
              Only download content you own or have permission to save.
              Availability depends on the platform.
            </p>
          </div>
        </section>

        {/* Separate Instagram and Pinterest downloaders */}
        <section
          id="social-downloaders"
          className="relative scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20"
        >
          <div className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-80 w-[min(90vw,900px)] -translate-x-1/2 rounded-full bg-fuchsia-600/[0.07] blur-[110px]" />

          <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-14">
            <span className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-rose-300">
              Social media tools
            </span>

            <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
              Your favorite content.
              <span className="mt-2 block bg-gradient-to-r from-fuchsia-400 via-rose-300 to-orange-200 bg-clip-text text-transparent">
                One place to save it.
              </span>
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
              Use the dedicated tools below to check supported Instagram posts,
              Reels, and Pinterest Pins.
            </p>
          </div>

          <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-6 lg:grid-cols-2 lg:gap-8">
            <SocialDownloader platform="instagram" />

            <SocialDownloader platform="pinterest" />
          </div>

          <p className="mx-auto mt-7 max-w-2xl text-center text-xs leading-6 text-slate-500">
            Private posts, login-restricted content, and unsupported media
            formats may not be available. Download only media you have
            permission to save.
          </p>
        </section>

        {/* Existing sections */}
        <HowItWorks />

        <Features />

        <FAQ openFaq={openFaq} onToggle={setOpenFaq} />
      </main>

      <Footer />
    </div>
  );
}
