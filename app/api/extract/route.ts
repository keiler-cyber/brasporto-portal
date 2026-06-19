import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractFieldsFromDocuments, extractFieldsFromPDFs } from "@/lib/ai";
import { validateDocuments, validateAgainstBooking } from "@/lib/validators";
import type { ExtractedFields } from "@/lib/types";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { shipmentId } = body;

  if (!shipmentId) return Response.json({ error: "shipmentId é obrigatório" }, { status: 400 });

  const shipment = await prisma.shipment.findUnique({
    where: { id: shipmentId },
    include: { documents: true },
  });

  if (!shipment) return Response.json({ error: "Embarque não encontrado" }, { status: 404 });

  if (!shipment.documents.length) {
    return Response.json({ error: "Nenhum documento encontrado para extração" }, { status: 400 });
  }

  await prisma.shipment.update({ where: { id: shipmentId }, data: { status: "EXTRACTING" } });

  // Strategy 1: Send PDF files directly to Claude (works with ANY PDF including SAP, scanned, etc.)
  const pdfDocs = shipment.documents
    .filter((d) => d.filePath && d.filePath.toLowerCase().endsWith(".pdf"))
    .map((d) => ({ filePath: d.filePath!, fileName: d.fileName, fileType: d.fileType }));

  // Strategy 2: Fallback — use extracted text if available
  const docsText = shipment.documents
    .filter((d): d is typeof d & { extractedText: string } => !!d.extractedText)
    .map((d) => `=== ${d.fileName} (${d.fileType}) ===\n${d.extractedText}`)
    .join("\n\n---\n\n");

  let extracted: ExtractedFields;
  try {
    if (pdfDocs.length > 0) {
      // Preferred: send PDFs directly — Claude reads them natively
      extracted = await extractFieldsFromPDFs(pdfDocs);
    } else if (docsText.trim()) {
      extracted = await extractFieldsFromDocuments(docsText);
    } else {
      // No PDFs and no text — open form for manual filling
      const updated = await prisma.shipment.update({
        where: { id: shipmentId },
        data: { status: "REVIEW", aiNotes: "Nenhum documento PDF encontrado. Preencha os campos manualmente." },
      });
      return Response.json({ shipment: updated, issues: [] });
    }
  } catch (err) {
    // If AI fails, still open form for manual filling
    const updated = await prisma.shipment.update({
      where: { id: shipmentId },
      data: { status: "REVIEW", aiNotes: `Extração automática falhou: ${String(err).slice(0, 300)}. Verifique e preencha os campos.` },
    });
    return Response.json({ shipment: updated, issues: [] });
  }

  const issues = validateDocuments(extracted, shipment.documents);

  if (shipment.bookingData) {
    try {
      const bookingParsed = JSON.parse(shipment.bookingData);
      const bookingIssues = validateAgainstBooking(extracted, bookingParsed);
      issues.push(...bookingIssues);
    } catch { /* booking data malformed, skip */ }
  }

  const updated = await prisma.shipment.update({
    where: { id: shipmentId },
    data: {
      ...extracted,
      status: "REVIEW",
      validationIssues: JSON.stringify(issues),
    },
  });

  await prisma.auditLog.create({
    data: {
      shipmentId,
      action: "EXTRACTED",
      actor: "system",
      newValue: `${Object.keys(extracted).length} campos extraídos, ${issues.length} alertas`,
    },
  });

  return Response.json({ shipment: updated, issues });
}
