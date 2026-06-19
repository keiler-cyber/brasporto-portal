import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import type ExcelJS from "exceljs";
import path from "path";
import fs from "fs";

type Ctx = { params: Promise<{ id: string }> };

// Column layout mirrors the BL table exactly:
// A  = Container nos / Marks (col 1)
// B  = Quantity Packages (col 2)
// C  = Description of Packages and Goods (col 3)
// D  = Gross Weight (col 4)
// E  = Measurement (col 5)
// A–E widths are chosen to approximate the PDF proportions on A4

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;

  const shipment = await prisma.shipment.findUnique({ where: { id } });
  if (!shipment) {
    return Response.json({ error: "Embarque não encontrado" }, { status: 404 });
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ExcelJS = require("exceljs") as typeof import("exceljs");

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Draft BL");

  const v = (x: string | null | undefined) => x ?? "";
  const join = (...parts: (string | null | undefined)[]) => parts.filter(Boolean).join("\n");

  const blNumber = `BL-${shipment.bookingNumber ?? id.slice(0, 8).toUpperCase()}`;

  // Column widths (units: Excel char width, approximating A4 proportions)
  ws.columns = [
    { key: "A", width: 22 }, // Container / Marks
    { key: "B", width: 10 }, // Quantity
    { key: "C", width: 50 }, // Description
    { key: "D", width: 14 }, // Gross Weight
    { key: "E", width: 12 }, // Measurement
  ];

  // ─────────────────────────────────────────────────────
  // Helper functions
  // ─────────────────────────────────────────────────────

  type CellBorder = {
    top?: boolean; bottom?: boolean; left?: boolean; right?: boolean;
  };

  function borders(opts: CellBorder = {}): Partial<ExcelJS.Borders> {
    const thin: ExcelJS.BorderStyle = "thin";
    return {
      ...(opts.top    !== false ? { top:    { style: thin } } : {}),
      ...(opts.bottom !== false ? { bottom: { style: thin } } : {}),
      ...(opts.left   !== false ? { left:   { style: thin } } : {}),
      ...(opts.right  !== false ? { right:  { style: thin } } : {}),
    };
  }

  function setCell(
    row: number,
    col: number,
    value: string,
    opts: {
      bold?: boolean;
      size?: number;
      shade?: boolean;
      wrapText?: boolean;
      vAlign?: ExcelJS.Alignment["vertical"];
      hAlign?: ExcelJS.Alignment["horizontal"];
      border?: CellBorder;
    } = {}
  ) {
    const cell = ws.getCell(row, col);
    cell.value = value;
    cell.font = { name: "Arial", size: opts.size ?? 8, bold: opts.bold ?? false };
    cell.fill = opts.shade
      ? { type: "pattern", pattern: "solid", fgColor: { argb: "FFE8E8E8" } }
      : { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFFFF" } };
    cell.alignment = {
      wrapText: opts.wrapText ?? true,
      vertical: opts.vAlign ?? "top",
      horizontal: opts.hAlign ?? "left",
    };
    cell.border = borders(opts.border ?? {});
  }

  function labelCell(row: number, col: number, label: string, topBorder = true) {
    setCell(row, col, label, { bold: true, size: 7, border: { top: topBorder } });
  }

  function mergeAndLabel(
    r1: number, c1: number, r2: number, c2: number,
    label: string,
    value: string,
    opts: { shade?: boolean; centerContent?: boolean; topBorder?: boolean } = {}
  ) {
    ws.mergeCells(r1, c1, r2, c2);
    const cell = ws.getCell(r1, c1);
    cell.value = label ? `${label}\n${value}` : value;
    cell.font = { name: "Arial", size: 8 };
    cell.fill = opts.shade
      ? { type: "pattern", pattern: "solid", fgColor: { argb: "FFE8E8E8" } }
      : { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFFFF" } };
    cell.alignment = {
      wrapText: true,
      vertical: "top",
      horizontal: opts.centerContent ? "center" : "left",
    };
    cell.border = borders({ top: opts.topBorder !== false });
    if (label) {
      // Use rich text to make label bold
      cell.value = {
        richText: [
          { text: label + "\n", font: { name: "Arial", size: 7, bold: true } },
          { text: value, font: { name: "Arial", size: 8 } },
        ],
      };
    }
  }

  // ─────────────────────────────────────────────────────
  // Row heights (pt, approximating the PDF)
  // ─────────────────────────────────────────────────────
  // Row 1: Booking No / BL No (top of right col) — shared with Shipper
  // Row 2: Export References                      — shared with Shipper
  // Row 3: Consignee | Logo
  // Row 4: Notify Party | Forwarding Agent
  // Row 5: Pre Carriage | Place of Receipt
  // Row 6: Vessel | Port of Loading | ETD | Originals
  // Row 7: Port of Discharge | Place Delivery | Type of Movement
  // Row 8: "Particulars Furnished by Shipper" header
  // Row 9: Column headers
  // Rows 10-13: 4 cargo rows
  // Row 14: Other Instructions
  // Row 15: Freight and Charges | Legal text

  const ROW = {
    SHIPPER_TOP:    1,  // Booking No | BL No (top of right, shared height with shipper)
    SHIPPER_BOT:    2,  // Export References (bottom of right, still shipper left)
    CONSIGNEE:      3,
    NOTIFY:         4,
    PRECARRIAGE:    5,
    VESSEL:         6,
    DISCHARGE:      7,
    PARTICULARS:    8,
    COL_HEADERS:    9,
    CARGO1:         10,
    CARGO2:         11,
    CARGO3:         12,
    CARGO4:         13,
    OTHER_INST:     14,
    FREIGHT:        15,
  };

  ws.getRow(ROW.SHIPPER_TOP).height = 30;
  ws.getRow(ROW.SHIPPER_BOT).height = 45;
  ws.getRow(ROW.CONSIGNEE).height = 55;
  ws.getRow(ROW.NOTIFY).height = 45;
  ws.getRow(ROW.PRECARRIAGE).height = 22;
  ws.getRow(ROW.VESSEL).height = 22;
  ws.getRow(ROW.DISCHARGE).height = 22;
  ws.getRow(ROW.PARTICULARS).height = 16;
  ws.getRow(ROW.COL_HEADERS).height = 22;
  ws.getRow(ROW.CARGO1).height = 70;
  ws.getRow(ROW.CARGO2).height = 70;
  ws.getRow(ROW.CARGO3).height = 70;
  ws.getRow(ROW.CARGO4).height = 70;
  ws.getRow(ROW.OTHER_INST).height = 30;
  ws.getRow(ROW.FREIGHT).height = 100;

  // ─────────────────────────────────────────────────────
  // SECTION 1: Shipper (left A, spans rows 1–2) | Booking+BL+ExportRefs (right D–E)
  // Column layout for header section: A-B-C = left (Shipper), D-E = right (Booking etc.)
  // ─────────────────────────────────────────────────────

  // Shipper — merges A1:C2 (rows 1-2, cols A-C)
  mergeAndLabel(
    ROW.SHIPPER_TOP, 1, ROW.SHIPPER_BOT, 3,
    "Shipper / Exporter (Complete Name and Address)",
    join(shipment.shipperName, shipment.shipperAddress, shipment.shipperCity, shipment.shipperCountry) ?? ""
  );

  // Booking No — D1 (row 1, col D)
  mergeAndLabel(ROW.SHIPPER_TOP, 4, ROW.SHIPPER_TOP, 4, "Booking No.", v(shipment.bookingNumber));

  // BL No — E1 (row 1, col E)
  mergeAndLabel(ROW.SHIPPER_TOP, 5, ROW.SHIPPER_TOP, 5, "Bill of Lading No.", blNumber);

  // Export References — D2:E2 (row 2, cols D-E)
  mergeAndLabel(
    ROW.SHIPPER_BOT, 4, ROW.SHIPPER_BOT, 5,
    "Export References",
    [
      shipment.dueNumber ? `DUE: ${shipment.dueNumber}` : "",
      shipment.incoterm ? `Incoterm: ${shipment.incoterm}` : "",
    ].filter(Boolean).join("    "),
    { topBorder: false }
  );

  // ─────────────────────────────────────────────────────
  // SECTION 2: Consignee (A-C) | Logo placeholder (D-E)
  // ─────────────────────────────────────────────────────

  mergeAndLabel(
    ROW.CONSIGNEE, 1, ROW.CONSIGNEE, 3,
    "Consignee (Complete Name and Address)",
    join(shipment.consigneeName, shipment.consigneeAddress, shipment.consigneeCity, shipment.consigneeCountry, shipment.consigneeContact) ?? "",
    { topBorder: false }
  );

  // Logo / Brasporto cell
  ws.mergeCells(ROW.CONSIGNEE, 4, ROW.CONSIGNEE, 5);
  const logoCell = ws.getCell(ROW.CONSIGNEE, 4);
  logoCell.value = "";
  logoCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFFFF" } };
  logoCell.alignment = { horizontal: "center", vertical: "middle" };
  logoCell.border = borders({ top: false });

  {
    const logoPath = path.join(process.cwd(), "public", "brasporto-logo.png");
    if (fs.existsSync(logoPath)) {
      const imgId = wb.addImage({ filename: logoPath, extension: "png" });
      // tl/br are 0-indexed: col D = 3, col E ends at 5; CONSIGNEE row 3 = 0-indexed 2/3
      // ExcelJS Anchor types are incomplete — cast needed
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ws.addImage(imgId, {
        tl: { col: 3, row: ROW.CONSIGNEE - 1 } as any,
        br: { col: 5, row: ROW.CONSIGNEE } as any,
        editAs: "oneCell",
      });
    } else {
      logoCell.value = "BRASPORTO\nLOGÍSTICA E ASSESSORIA ADUANEIRA";
      logoCell.font = { name: "Arial", size: 14, bold: true, color: { argb: "FF2D7A8A" } };
    }
  }

  // ─────────────────────────────────────────────────────
  // SECTION 3: Notify Party (A-C) | Forwarding Agent (D-E)
  // ─────────────────────────────────────────────────────

  mergeAndLabel(
    ROW.NOTIFY, 1, ROW.NOTIFY, 3,
    "Notify Party (Complete Name and Address)",
    join(shipment.notifyName, shipment.notifyAddress, shipment.notifyContact) ?? "",
    { topBorder: false }
  );

  mergeAndLabel(
    ROW.NOTIFY, 4, ROW.NOTIFY, 5,
    "Forwarding Agent Reference",
    "",
    { topBorder: false }
  );

  // ─────────────────────────────────────────────────────
  // SECTION 4: Pre Carriage | Place of Receipt
  // ─────────────────────────────────────────────────────

  mergeAndLabel(ROW.PRECARRIAGE, 1, ROW.PRECARRIAGE, 1, "Pre Carriage By", "", { topBorder: false });
  mergeAndLabel(ROW.PRECARRIAGE, 2, ROW.PRECARRIAGE, 5, "Place of Receipt by participating carrier", v(shipment.portOrigin), { topBorder: false });

  // ─────────────────────────────────────────────────────
  // SECTION 5: Vessel | Port of Loading | ETD | Originals
  // ─────────────────────────────────────────────────────

  mergeAndLabel(ROW.VESSEL, 1, ROW.VESSEL, 1, "Vessel/Voyage/Flag", [shipment.vessel, shipment.voyage].filter(Boolean).join(" / "), { topBorder: false });
  mergeAndLabel(ROW.VESSEL, 2, ROW.VESSEL, 3, "Port of Loading", v(shipment.portOrigin), { topBorder: false });
  mergeAndLabel(ROW.VESSEL, 4, ROW.VESSEL, 4, "ETD at Loading Port", "", { topBorder: false });
  mergeAndLabel(ROW.VESSEL, 5, ROW.VESSEL, 5, "Originals to be released at", "", { topBorder: false });

  // ─────────────────────────────────────────────────────
  // SECTION 6: Port of Discharge | Place of Delivery | Type of Movement
  // ─────────────────────────────────────────────────────

  mergeAndLabel(ROW.DISCHARGE, 1, ROW.DISCHARGE, 1, "Port of Discharge", v(shipment.portDestination), { topBorder: false });
  mergeAndLabel(ROW.DISCHARGE, 2, ROW.DISCHARGE, 3, "Place of Delivery by participating carrier", v(shipment.deliveryPlace), { topBorder: false });
  mergeAndLabel(ROW.DISCHARGE, 4, ROW.DISCHARGE, 5, "Type of Movement (If mixed, use description of packages and goods)", "", { topBorder: false });

  // ─────────────────────────────────────────────────────
  // SECTION 7: "Particulars Furnished by Shipper" — shaded full-width header
  // ─────────────────────────────────────────────────────

  ws.mergeCells(ROW.PARTICULARS, 1, ROW.PARTICULARS, 5);
  const partic = ws.getCell(ROW.PARTICULARS, 1);
  partic.value = "Particulars Furnished by Shipper";
  partic.font = { name: "Arial", size: 8, bold: true };
  partic.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE8E8E8" } };
  partic.alignment = { horizontal: "center", vertical: "middle" };
  partic.border = borders({ top: false });

  // ─────────────────────────────────────────────────────
  // SECTION 8: Column headers (shaded)
  // ─────────────────────────────────────────────────────

  const colHeaders = [
    "Container nos with seal nos.\nMarks and Numbers",
    "Quantity\nPackages",
    "Description of Packages and Goods",
    "Gross Weight",
    "Measurement",
  ];
  colHeaders.forEach((label, i) => {
    const cell = ws.getCell(ROW.COL_HEADERS, i + 1);
    cell.value = label;
    cell.font = { name: "Arial", size: 7, bold: true };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE8E8E8" } };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.border = borders({ top: false });
  });

  // ─────────────────────────────────────────────────────
  // SECTION 9: Cargo area — each column merged across rows 10–13 (no internal lines)
  // ─────────────────────────────────────────────────────

  const cntrs = (shipment.containerNumbers ?? "").split(/[,;\n]/).map(s => s.trim()).filter(Boolean);
  const seals = (shipment.sealNumbers ?? "").split(/[,;\n]/).map(s => s.trim()).filter(Boolean);

  // Build container/seal block (one entry per container)
  const cntrBlock = cntrs.map((cntr, i) => {
    const seal = seals[i];
    return [
      cntr ? `CNTR: ${cntr}` : null,
      seal ? `SEAL: ${seal}` : null,
    ].filter(Boolean).join("\n");
  }).join("\n");

  const cargoData: [number, string][] = [
    [1, cntrBlock],
    [2, `${v(shipment.volumeCount)} ${v(shipment.packageType)}`.trim()],
    [3, v(shipment.goodsDescription)],
    [4, v(shipment.grossWeight)],
    [5, v(shipment.measurement)],
  ];

  // Merge CARGO1:CARGO4 for each column — removes internal horizontal lines
  for (const [col, content] of cargoData) {
    ws.mergeCells(ROW.CARGO1, col, ROW.CARGO4, col);
    const cell = ws.getCell(ROW.CARGO1, col);
    cell.value = content;
    cell.font = { name: "Arial", size: 8 };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFFFF" } };
    cell.alignment = { wrapText: true, vertical: "top" };
    cell.border = borders({ top: false });
  }

  // ─────────────────────────────────────────────────────
  // SECTION 10: Other Instructions
  // ─────────────────────────────────────────────────────

  mergeAndLabel(ROW.OTHER_INST, 1, ROW.OTHER_INST, 5, "Other Instructions :", v(shipment.freightTerms), { topBorder: false });

  // ─────────────────────────────────────────────────────
  // SECTION 11: Freight and Charges | Legal text
  // ─────────────────────────────────────────────────────

  mergeAndLabel(ROW.FREIGHT, 1, ROW.FREIGHT, 1, "Freight and Charges", "", { topBorder: false });

  ws.mergeCells(ROW.FREIGHT, 2, ROW.FREIGHT, 5);
  const legalCell = ws.getCell(ROW.FREIGHT, 2);
  legalCell.value = [
    "RECEIVED the goods or the containers, vans, trailers, pallets units or others packages said to contain goods herein mentioned, in apparent goods order and condition, except as otherwise indicated, to be transported, delivered or transshipped as provid herein. All of the provisions written, printed or stamped on either side hereof are part of this bill of lading contract.",
    "",
    "IN WITNESS WHEREOF, the carrier or agent of said vessel has signed EXPRESS RELEASE bills of lading, all of the same tenor and dat, one which being accomplished, the others to stand void",
    "",
    `BY     BRASPORTO ASSESSORIA ADUANEIRA LTDA-EPP`,
    `                    ON BE HALF OF`,
    "",
    `DATED BY                    BL No   ${blNumber}`,
  ].join("\n");
  legalCell.font = { name: "Arial", size: 7 };
  legalCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFFFF" } };
  legalCell.alignment = { wrapText: true, vertical: "top" };
  legalCell.border = borders({ top: false });

  // ─────────────────────────────────────────────────────
  // Output
  // ─────────────────────────────────────────────────────

  const buffer = await wb.xlsx.writeBuffer();

  await prisma.auditLog.create({
    data: {
      shipmentId: id,
      action: "DRAFT_BL_EXCEL_GENERATED",
      actor: "system",
      newValue: blNumber,
    },
  });

  return new Response(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="Draft-BL-${shipment.bookingNumber ?? id}.xlsx"`,
    },
  });
}
