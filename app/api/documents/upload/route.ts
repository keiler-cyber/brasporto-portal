import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractTextFromBuffer, classifyDocument } from "@/lib/docparser";
import { put } from "@vercel/blob";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

const ALLOWED_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

const ALLOWED_EXT = new Set(["pdf", "jpg", "jpeg", "png", "doc", "docx", "xls", "xlsx"]);

export async function POST(req: NextRequest) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json(
      { error: "Armazenamento de arquivos não configurado. Contate o administrador." },
      { status: 503 }
    );
  }

  const formData = await req.formData();
  const token = formData.get("token") as string;
  const files = formData.getAll("files") as File[];

  if (!token || !files.length) {
    return Response.json({ error: "Token e arquivos são obrigatórios" }, { status: 400 });
  }

  const shipment = await prisma.shipment.findUnique({ where: { token } });
  if (!shipment) return Response.json({ error: "Embarque não encontrado" }, { status: 404 });

  const savedDocs = [];

  for (const file of files) {
    const ext = (file.name.split(".").pop() ?? "").toLowerCase();

    if (file.size > MAX_BYTES) {
      return Response.json(
        { error: `Arquivo "${file.name}" excede o limite de 10 MB.` },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME.has(file.type) && !ALLOWED_EXT.has(ext)) {
      return Response.json(
        { error: `Tipo não permitido: "${file.name}". Aceitos: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX.` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const blobPath = `shipments/${shipment.id}/${safeName}`;

    const blob = await put(blobPath, buffer, {
      access: "public",
      contentType: file.type || "application/octet-stream",
    });

    let extractedText: string | null = null;
    try {
      extractedText = await extractTextFromBuffer(buffer, file.type, file.name);
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
        filePath: blob.url,
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
