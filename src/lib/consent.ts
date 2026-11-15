export const CONSENT_COOKIE = "wolfmain-cookie-consent";

export type ConsentValue = "accepted" | "rejected";

export function readConsent(): ConsentValue | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp("(?:^|; )" + CONSENT_COOKIE + "=([^;]*)"));
  const v = m ? decodeURIComponent(m[1]) : null;
  return v === "accepted" || v === "rejected" ? v : null;
}

export function hasConsent(): boolean {
  return readConsent() === "accepted";
}

export function setConsent(value: ConsentValue) {
  if (typeof document === "undefined") return;
  document.cookie = `${CONSENT_COOKIE}=${value}; path=/; max-age=31536000; samesite=lax`;
}
