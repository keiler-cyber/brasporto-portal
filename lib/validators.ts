import type { ValidationIssue, ExtractedFields } from "./types";

interface BookingData {
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

export function validateAgainstBooking(
  shipment: ExtractedFields,
  booking: BookingData
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const parseNum = (s: string | null | undefined) =>
    parseFloat((s ?? "").replace(/[^0-9.,]/g, "").replace(",", "."));

  // Peso bruto
  if (booking.grossWeight && shipment.grossWeight) {
    const bw = parseNum(booking.grossWeight);
    const sw = parseNum(shipment.grossWeight);
    if (!isNaN(bw) && !isNaN(sw) && Math.abs(bw - sw) / Math.max(bw, sw) > 0.01) {
      issues.push({
        field: "grossWeight",
        type: "mismatch",
        message: `Peso bruto diverge do Booking`,
        doc1: "Booking",
        doc2: "Documentos do cliente",
        value1: booking.grossWeight ?? "",
        value2: shipment.grossWeight,
      });
    }
  }

  // Cubagem
  if (booking.measurement && shipment.measurement) {
    const bm = parseNum(booking.measurement);
    const sm = parseNum(shipment.measurement);
    if (!isNaN(bm) && !isNaN(sm) && Math.abs(bm - sm) / Math.max(bm, sm) > 0.02) {
      issues.push({
        field: "measurement",
        type: "mismatch",
        message: `Cubagem diverge do Booking`,
        doc1: "Booking",
        doc2: "Documentos do cliente",
        value1: booking.measurement ?? "",
        value2: shipment.measurement,
      });
    }
  }

  // Quantidade de volumes
  if (booking.volumeCount && shipment.volumeCount) {
    const bv = parseInt(booking.volumeCount);
    const sv = parseInt(shipment.volumeCount);
    if (!isNaN(bv) && !isNaN(sv) && bv !== sv) {
      issues.push({
        field: "volumeCount",
        type: "mismatch",
        message: `Quantidade de volumes diverge do Booking`,
        doc1: "Booking",
        doc2: "Documentos do cliente",
        value1: `${booking.volumeCount} ${booking.packageType ?? ""}`.trim(),
        value2: `${shipment.volumeCount} ${shipment.packageType ?? ""}`.trim(),
      });
    }
  }

  // Porto de destino
  if (booking.portDestination && shipment.portDestination) {
    const bd = booking.portDestination.toUpperCase().trim();
    const sd = shipment.portDestination.toUpperCase().trim();
    if (!bd.includes(sd) && !sd.includes(bd)) {
      issues.push({
        field: "portDestination",
        type: "mismatch",
        message: `Porto de destino diverge do Booking`,
        doc1: "Booking",
        doc2: "Documentos do cliente",
        value1: booking.portDestination ?? "",
        value2: shipment.portDestination,
      });
    }
  }

  // Incoterm
  if (booking.incoterm && shipment.incoterm) {
    if (booking.incoterm.toUpperCase() !== shipment.incoterm.toUpperCase()) {
      issues.push({
        field: "incoterm",
        type: "mismatch",
        message: `Incoterm diverge do Booking`,
        doc1: "Booking",
        doc2: "Documentos do cliente",
        value1: booking.incoterm ?? "",
        value2: shipment.incoterm,
      });
    }
  }

  return issues;
}

export function validateDocuments(
  shipment: ExtractedFields,
  documents: { fileType: string; extractedText: string | null }[]
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const requiredFields: Array<{ key: keyof ExtractedFields; label: string }> = [
    { key: "shipperName", label: "Nome do Exportador (Shipper)" },
    { key: "consigneeName", label: "Nome do Importador (Consignee)" },
    { key: "portOrigin", label: "Porto de Origem" },
    { key: "portDestination", label: "Porto de Destino" },
    { key: "bookingNumber", label: "Booking Number" },
    { key: "grossWeight", label: "Peso Bruto" },
    { key: "goodsDescription", label: "Descrição da Mercadoria" },
    { key: "incoterm", label: "Incoterm" },
    { key: "currency", label: "Moeda" },
    { key: "commercialValue", label: "Valor Comercial" },
  ];

  for (const { key, label } of requiredFields) {
    if (!shipment[key]) {
      issues.push({
        field: key,
        type: "missing",
        message: `Campo obrigatório não encontrado: ${label}`,
      });
    }
  }

  const invoice = documents.find((d) => d.fileType === "invoice");
  const packingList = documents.find((d) => d.fileType === "packing_list");
  const due = documents.find((d) => d.fileType === "due");

  if (invoice && packingList && invoice.extractedText && packingList.extractedText) {
    // Check gross weight consistency
    const invoiceWeight = extractWeight(invoice.extractedText);
    const plWeight = extractWeight(packingList.extractedText);
    if (invoiceWeight && plWeight && !weightsMatch(invoiceWeight, plWeight)) {
      issues.push({
        field: "grossWeight",
        type: "mismatch",
        message: "Peso bruto divergente entre Invoice e Packing List",
        doc1: "Invoice",
        doc2: "Packing List",
        value1: invoiceWeight,
        value2: plWeight,
      });
    }
  }

  if (invoice && due && invoice.extractedText && due.extractedText) {
    // Check NCM consistency
    const invoiceNcm = extractNcm(invoice.extractedText);
    const dueNcm = extractNcm(due.extractedText);
    if (invoiceNcm && dueNcm && invoiceNcm !== dueNcm) {
      issues.push({
        field: "ncm",
        type: "mismatch",
        message: "NCM informado na Invoice é diferente da DUE",
        doc1: "Invoice",
        doc2: "DUE",
        value1: invoiceNcm,
        value2: dueNcm,
      });
    }
  }

  return issues;
}

function extractWeight(text: string): string | null {
  const match = text.match(/(?:gross\s*weight|peso\s*bruto)[:\s]+([0-9.,]+\s*(?:kg|kgs|kilos?)?)/i);
  return match ? match[1].trim() : null;
}

function weightsMatch(w1: string, w2: string): boolean {
  const normalize = (w: string) =>
    parseFloat(w.replace(/[^0-9.,]/g, "").replace(",", "."));
  const v1 = normalize(w1);
  const v2 = normalize(w2);
  if (isNaN(v1) || isNaN(v2)) return true; // Can't compare
  return Math.abs(v1 - v2) / Math.max(v1, v2) < 0.01; // 1% tolerance
}

function extractNcm(text: string): string | null {
  const match = text.match(/(?:NCM|SH\s*code)[:\s]+([0-9.]{8,10})/i);
  return match ? match[1].replace(/\./g, "") : null;
}
