import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { DraftBLDocument } from "@/lib/bl-pdf";
import React from "react";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;

  const shipment = await prisma.shipment.findUnique({ where: { id } });
  if (!shipment) {
    return Response.json({ error: "Embarque não encontrado" }, { status: 404 });
  }

  const blNumber = `BL-${shipment.bookingNumber ?? id.slice(0, 8).toUpperCase()}`;

  // @react-pdf/renderer expects its own ReactElement type — cast via unknown
  const element = React.createElement(DraftBLDocument, { shipment, blNumber }) as unknown as Parameters<typeof renderToBuffer>[0];
  const buffer = await renderToBuffer(element);

  await prisma.auditLog.create({
    data: {
      shipmentId: id,
      action: "DRAFT_BL_GENERATED",
      actor: "system",
      newValue: blNumber,
    },
  });

  return new Response(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Draft-BL-${shipment.bookingNumber ?? id}.pdf"`,
    },
  });
}
