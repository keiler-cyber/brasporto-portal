import { NextRequest } from "next/server";
import { extractBookingFields } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return Response.json({ error: "Arquivo obrigatório" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const extracted = await extractBookingFields(buffer, file.name);
    return Response.json({
      bookingNumber: extracted.bookingNumber ?? null,
      shipperName: extracted.shipperName ?? null,
    });
  } catch {
    return Response.json({ bookingNumber: null, shipperName: null });
  }
}
