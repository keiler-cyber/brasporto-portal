import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractBookingFields } from "@/lib/ai";
import { put } from "@vercel/blob";

export async function POST(req: NextRequest) {

  const formData = await req.formData();
  const shipmentId = formData.get("shipmentId") as string;
  const file = formData.get("file") as File | null;

  if (!shipmentId || !file) {
    return Response.json({ error: "shipmentId e arquivo são obrigatórios" }, { status: 400 });
  }

  const shipment = await prisma.shipment.findUnique({ where: { id: shipmentId } });
  if (!shipment) return Response.json({ error: "Embarque não encontrado" }, { status: 404 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const safeName = `booking_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const blobPath = `shipments/${shipment.id}/${safeName}`;

  const blob = await put(blobPath, buffer, {
    access: "private",
    contentType: file.type || "application/pdf",
  });

  await prisma.document.create({
    data: {
      shipmentId: shipment.id,
      fileName: file.name,
      fileType: "booking",
      mimeType: file.type || "application/pdf",
      filePath: blob.url,
      fileSize: buffer.length,
      processedAt: new Date(),
    },
  });

  let bookingNumber: string | null = shipment.bookingNumber;
  let bookingData: BookingExtracted = {};
  let extractionWarning: string | null = null;

  try {
    const extracted = await extractBookingFields(buffer, file.name);
    bookingNumber = extracted.bookingNumber ?? bookingNumber;
    bookingData = extracted;

    const updates: Record<string, string | null | undefined> = {
      bookingNumber: bookingNumber ?? undefined,
      bookingData: JSON.stringify(bookingData),
    };

    const overwriteIfEmpty = (field: keyof typeof shipment, value?: string | null) => {
      if (value && !(shipment as Record<string, unknown>)[field]) updates[field] = value;
    };

    overwriteIfEmpty("shipperName",      extracted.shipperName);
    overwriteIfEmpty("consigneeName",    extracted.consigneeName);
    overwriteIfEmpty("notifyName",       extracted.consigneeName);
    overwriteIfEmpty("portOrigin",       extracted.portOrigin);
    overwriteIfEmpty("portDestination",  extracted.portDestination);
    overwriteIfEmpty("vessel",           extracted.vessel);
    overwriteIfEmpty("voyage",           extracted.voyage);
    overwriteIfEmpty("grossWeight",      extracted.grossWeight);
    overwriteIfEmpty("measurement",      extracted.measurement);
    overwriteIfEmpty("volumeCount",      extracted.volumeCount);
    overwriteIfEmpty("packageType",      extracted.packageType);
    overwriteIfEmpty("incoterm",         extracted.incoterm);

    await prisma.shipment.update({
      where: { id: shipmentId },
      data: updates,
    });
  } catch (err) {
    console.error("Erro ao extrair booking:", err);
    extractionWarning =
      "Não foi possível extrair dados automaticamente do PDF. Informe o número do booking manualmente.";
  }

  return Response.json({ bookingNumber, bookingData, warning: extractionWarning });
}

interface BookingExtracted {
  bookingNumber?: string | null;
  shipperName?: string | null;
  consigneeName?: string | null;
  portOrigin?: string | null;
  portDestination?: string | null;
  vessel?: string | null;
  voyage?: string | null;
  grossWeight?: string | null;
  measurement?: string | null;
  volumeCount?: string | null;
  packageType?: string | null;
  incoterm?: string | null;
}
