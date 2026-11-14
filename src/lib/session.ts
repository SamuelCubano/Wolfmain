export const SESSION_COOKIE = "wolfmain_session";

type SessionPayload = { id: string; email: string };

function base64UrlToBytes(input: string): Uint8Array {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function decodeJsonSegment(segment: string): Record<string, unknown> | null {
  try {
    const json = new TextDecoder().decode(base64UrlToBytes(segment));
    const parsed: unknown = JSON.parse(json);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
}

export async function verifySessionToken(
  token: string,
  secret: string
): Promise<SessionPayload | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [header, payload, signature] = parts;
  const headerJson = decodeJsonSegment(header);
  if (!headerJson || headerJson.alg !== "HS256") return null;

  const payloadJson = decodeJsonSegment(payload);
  if (!payloadJson) return null;

  const id = payloadJson.id;
  const email = payloadJson.email;
  const exp = payloadJson.exp;

  if (typeof id !== "string" || typeof email !== "string") return null;
  if (typeof exp === "number" && exp * 1000 <= Date.now()) return null;

  try {
    const key = await importHmacKey(secret);
    const signatureBytes = base64UrlToBytes(signature);
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes as unknown as BufferSource,
      new TextEncoder().encode(`${header}.${payload}`)
    );
    if (!valid) return null;
  } catch {
    return null;
  }

  return { id, email };
}