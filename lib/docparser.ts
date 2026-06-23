import fs from "fs";
import path from "path";

export async function extractTextFromBuffer(
  buffer: Buffer,
  mimeType: string,
  filename: string
): Promise<string> {
  const ext = (filename.split(".").pop() ?? "").toLowerCase();

  if (mimeType === "application/pdf" || ext === "pdf") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse") as (buf: Buffer, opts?: { max?: number }) => Promise<{ text: string }>;
    try {
      const data = await pdfParse(buffer, { max: 0 });
      return data.text ?? "";
    } catch { return ""; }
  }

  if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || ext === "docx") {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  if (mimeType === "application/vnd.ms-excel" ||
      mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      ext === "xls" || ext === "xlsx") {
    const XLSX = await import("xlsx");
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const lines: string[] = [];
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      lines.push(`=== ${sheetName} ===\n${XLSX.utils.sheet_to_csv(sheet)}`);
    }
    return lines.join("\n\n");
  }

  if (mimeType.startsWith("text/") || ext === "txt" || ext === "csv") {
    return buffer.toString("utf-8");
  }

  return `[Arquivo ${filename} - tipo ${mimeType} - conteúdo binário não extraível como texto]`;
}

export async function extractTextFromFile(
  filePath: string,
  mimeType: string
): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();

  if (mimeType === "application/pdf" || ext === ".pdf") {
    return extractPdf(filePath);
  }

  if (
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    ext === ".docx"
  ) {
    return extractDocx(filePath);
  }

  if (
    mimeType === "application/vnd.ms-excel" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    ext === ".xls" ||
    ext === ".xlsx"
  ) {
    return extractXlsx(filePath);
  }

  if (mimeType.startsWith("text/") || ext === ".txt" || ext === ".csv") {
    return fs.readFileSync(filePath, "utf-8");
  }

  return `[Arquivo ${path.basename(filePath)} - tipo ${mimeType} - conteúdo binário não extraível como texto]`;
}

async function extractPdf(filePath: string): Promise<string> {
  const buffer = fs.readFileSync(filePath);

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse") as (buf: Buffer, opts?: { max?: number }) => Promise<{ text: string; numpages: number }>;

  try {
    const data = await pdfParse(buffer, { max: 0 }); // max:0 = all pages
    return data.text ?? "";
  } catch (err) {
    // pdf-parse failed — log and return empty so caller handles it
    console.error("[docparser] pdf-parse failed for", path.basename(filePath), String(err).slice(0, 200));
    return "";
  }
}

async function extractDocx(filePath: string): Promise<string> {
  const mammoth = await import("mammoth");
  const buffer = fs.readFileSync(filePath);
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

async function extractXlsx(filePath: string): Promise<string> {
  const XLSX = await import("xlsx");
  const workbook = XLSX.readFile(filePath);
  const lines: string[] = [];
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const csv = XLSX.utils.sheet_to_csv(sheet);
    lines.push(`=== ${sheetName} ===\n${csv}`);
  }
  return lines.join("\n\n");
}

export function classifyDocument(filename: string, text: string): string {
  const nameLower = filename.toLowerCase().replace(/\.[^.]+$/, "").trim();
  const textSnippet = text.slice(0, 800).toLowerCase();
  const combined = nameLower + " " + textSnippet;

  // DUE
  if (
    nameLower === "due" ||
    /\bdue\b/.test(nameLower) ||
    combined.includes("declaração única") ||
    combined.includes("declaracao unica") ||
    combined.includes("due registrada") ||
    /\bdue\s+\d/.test(combined)
  ) return "due";

  // Packing List — nome PL ou pl, ou texto
  if (
    nameLower === "pl" ||
    nameLower.startsWith("pl ") ||
    nameLower.startsWith("pl_") ||
    nameLower.startsWith("pl-") ||
    combined.includes("packing list") ||
    combined.includes("packing-list") ||
    combined.includes("romaneio")
  ) return "packing_list";

  // Invoice — nome CI ou inv, ou texto
  if (
    nameLower === "ci" ||
    nameLower === "inv" ||
    nameLower.startsWith("ci ") ||
    nameLower.startsWith("ci_") ||
    nameLower.startsWith("ci-") ||
    nameLower.startsWith("inv ") ||
    combined.includes("commercial invoice") ||
    combined.includes("invoice") ||
    combined.includes("fatura comercial")
  ) return "invoice";

  // Booking
  if (combined.includes("booking") || combined.includes("confirmação de reserva")) {
    return "booking";
  }

  // Draft BL
  if (combined.includes("bill of lading") || combined.includes("b/l") || combined.includes("bl draft")) {
    return "draft_bl";
  }

  // Certificado
  if (combined.includes("certificado") || combined.includes("certificate")) {
    return "certificate";
  }

  return "other";
}
