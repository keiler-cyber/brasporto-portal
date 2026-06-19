import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractTextFromFile, classifyDocument } from "@/lib/docparser";
import path from "path";
import fs from "fs";
import os from "os";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const token = formData.get("token") as string;
  const files = formData.getAll("files") as File[];

  if (!token || !files.length) {
    return Response.json({ error: "Token e arquivos são obrigatórios" }, { status: 400 });
  }

  const shipment = await prisma.shipment.findUnique({ where: { token } });
  if (!shipment) return Response.json({ error: "Embarque não encontrado" }, { status: 404 });

  const uploadDir = path.join(process.cwd(), "uploads", shipment.id);
  fs.mkdirSync(uploadDir, { recursive: true });

  const savedDocs = [];

  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = path.join(uploadDir, safeName);
    fs.writeFileSync(filePath, buffer);

    let extractedText: string | null = null;
    try {
      extractedText = await extractTextFromFile(filePath, file.type);
    } catch {
      extractedText = null;
    }

    const fileType = classifyDocument(file.name, extractedText ?? "");

    const doc = await prisma.document.create({
      data: {
        shipmentId: shipment.id,
        fileName: file.name,
        fileType,
        mimeType: file.type || "application/octet-stream",
        filePath,
        fileSize: buffer.length,
        extractedText,
        processedAt: extractedText ? new Date() : null,
      },
    });

    savedDocs.push(doc);
  }

  await prisma.shipment.update({
    where: { id: shipment.id },
    data: { status: "DOCS_UPLOADED" },
  });

  await prisma.auditLog.create({
    data: {
      shipmentId: shipment.id,
      action: "UPLOADED",
      actor: "client",
      newValue: savedDocs.map((d) => d.fileName).join(", "),
    },
  });

  return Response.json({ documents: savedDocs, shipmentId: shipment.id }, { status: 201 });
}
