import { NextRequest } from "next/server";
import { extractBookingFields } from "@/lib/ai";
import os from "os";
import path from "path";
import fs from "fs";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return Response.json({ error: "Arquivo obrigatório" }, { status: 400 });

  const tempPath = path.join(os.tmpdir(), `bp_preview_${crypto.randomBytes(8).toString("hex")}.pdf`);
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(tempPath, buffer);

  try {
    const extracted = await extractBookingFields(tempPath);
    return Response.json({
      bookingNumber: extracted.bookingNumber ?? null,
      shipperName: extracted.shipperName ?? null,
    });
  } catch {
    return Response.json({ bookingNumber: null, shipperName: null });
  } finally {
    try { fs.unlinkSync(tempPath); } catch { /* ignore */ }
  }
}
