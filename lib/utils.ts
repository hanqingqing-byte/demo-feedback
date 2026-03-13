export function createId(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
}

export function createShareToken() {
  return crypto.randomUUID().replace(/-/g, "");
}

export function detectDeviceType(userAgent: string | null) {
  if (!userAgent) {
    return "unknown";
  }

  return /mobile|android|iphone|ipad/i.test(userAgent) ? "mobile" : "desktop";
}

export function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(dateString));
}

export function getBaseUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://127.0.0.1:3000";
}

export function sanitizeFileName(fileName: string) {
  const normalized = fileName.toLowerCase().replace(/\.[^.]+$/, "");
  const safe = normalized.replace(/[^a-z0-9-_]+/g, "-").replace(/-+/g, "-").slice(0, 48);
  return safe || "image";
}
