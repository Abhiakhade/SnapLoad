export const platforms = [
  {
    name: "Instagram",
    symbol: "◎",
    description: "Reels, posts & videos",
    active: "border-fuchsia-400/60 bg-fuchsia-500/10 ring-2 ring-fuchsia-500/10",
    icon: "bg-gradient-to-br from-amber-400 via-pink-500 to-purple-600",
  },
  {
    name: "YouTube",
    symbol: "▶",
    description: "Videos & Shorts",
    active: "border-red-400/60 bg-red-500/10 ring-2 ring-red-500/10",
    icon: "bg-gradient-to-br from-red-500 to-red-700",
  },
  {
    name: "Pinterest",
    symbol: "P",
    description: "Pins & visual ideas",
    active: "border-rose-400/60 bg-rose-500/10 ring-2 ring-rose-500/10",
    icon: "bg-gradient-to-br from-rose-500 to-red-700",
  },
];

export const steps = [
  {
    number: "01",
    title: "Copy a link",
    description: "Copy the URL of a post or video you own or have permission to use.",
    icon: "↗",
  },
  {
    number: "02",
    title: "Check the link",
    description: "Paste it into SnapLoad. We'll check the URL and identify its platform.",
    icon: "⌕",
  },
  {
    number: "03",
    title: "Review options",
    description: "See the current status and use a download option only when one is supported and permitted.",
    icon: "↓",
  },
];

export const features = [
  {
    icon: "⚡",
    title: "Simple and fast",
    description: "A streamlined workflow with clear feedback at every step.",
  },
  {
    icon: "🔐",
    title: "Privacy-minded",
    description: "No account is needed to validate a link in this prototype.",
  },
  {
    icon: "📱",
    title: "Responsive by design",
    description: "Designed to adapt to mobile, tablet, laptop and desktop screens.",
  },
  {
    icon: "✓",
    title: "Transparent status",
    description: "We clearly show when a platform integration is not available yet.",
  },
];

export const faqs = [
  {
    question: "Which platforms can I check?",
    answer:
      "SnapLoad currently recognizes Instagram, YouTube and Pinterest URLs. Recognition does not guarantee that media metadata or downloads are available.",
  },
  {
    question: "Does checking a link download the video?",
    answer:
      "No. The current version validates the link and reports integration status. Actual media access requires a platform-approved or otherwise authorized integration.",
  },
  {
    question: "Do I need an account?",
    answer:
      "No account is required for the link-checking prototype. Optional accounts may be considered later if they provide a clear user benefit.",
  },
  {
    question: "Can I download any public video?",
    answer:
      "Not necessarily. Public visibility does not automatically grant download permission. Follow platform terms and respect copyright and creator rights.",
  },
];
