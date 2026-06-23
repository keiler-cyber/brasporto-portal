export async function GET() {
  const blob  = process.env.BLOB_READ_WRITE_TOKEN;
  const store = process.env.BLOB_STORE_ID;
  const oidc  = process.env.VERCEL_OIDC_TOKEN;
  const db    = process.env.DATABASE_URL;
  const ai    = process.env.ANTHROPIC_API_KEY;

  // Scan all env keys that contain "BLOB" to catch alternate names
  const blobKeys = Object.keys(process.env).filter(k => k.includes("BLOB"));

  return Response.json({
    DATABASE_URL:          db    ? `set (${db.length} chars)`   : "MISSING",
    ANTHROPIC_API_KEY:     ai    ? `length = ${ai.length}`      : "MISSING",
    BLOB_READ_WRITE_TOKEN: blob  ? `set (${blob.length} chars, starts: ${blob.slice(0, 16)}...)` : "MISSING",
    BLOB_STORE_ID:         store ? store                        : "MISSING",
    VERCEL_OIDC_TOKEN:     oidc  ? `set (${oidc.length} chars)` : "MISSING",
    BLOB_KEYS_FOUND:       blobKeys.length > 0 ? blobKeys : ["none"],
    VERCEL_ENV:            process.env.VERCEL_ENV  ?? "MISSING",
    VERCEL_REGION:         process.env.VERCEL_REGION ?? "MISSING",
  });
}
