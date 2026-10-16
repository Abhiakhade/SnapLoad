const platformDomains = {
  Instagram: ["instagram.com"],
  YouTube: ["youtube.com", "youtu.be"],
  Pinterest: ["pinterest.com", "pin.it"],
};

export function getPlatformFromUrl(value) {
  try {
    const parsed = new URL(value.trim());

    if (!["https:", "http:"].includes(parsed.protocol)) {
      return null;
    }

    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");

    for (const [name, domains] of Object.entries(platformDomains)) {
      if (
        domains.some((domain) => host === domain || host.endsWith(`.${domain}`))
      ) {
        return name;
      }
    }

    return null;
  } catch {
    return null;
  }
}
