export async function GET() {
  const blob = process.env.BLOB_READ_WRITE_TOKEN;
  const db = process.env.DATABASE_URL;
  const ai = process.env.ANTHROPIC_API_KEY;

  return Response.json({
    BLOB_READ_WRITE_TOKEN: blob ? `set (${blob.length} chars, starts: ${blob.slice(0, 8)}...)` : "MISSING",
    DATABASE_URL: db ? `set (${db.length} chars)` : "MISSING",
    ANTHROPIC_API_KEY: ai ? `set (${ai.length} chars)` : "MISSING",
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_REGION: process.env.VERCEL_REGION,
  });
}
