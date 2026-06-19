import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  const shipments = await prisma.shipment.findMany({
    orderBy: { createdAt: "desc" },
    include: { documents: { select: { id: true, fileType: true, fileName: true } } },
  });
  return Response.json(shipments);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const token = uuidv4();

  const shipment = await prisma.shipment.create({
    data: {
      token,
      clientName: body.clientName ?? null,
      clientEmail: body.clientEmail ?? null,
      clientPhone: body.clientPhone ?? null,
      bookingNumber: body.bookingNumber ?? null,
    },
  });

  await prisma.auditLog.create({
    data: {
      shipmentId: shipment.id,
      action: "CREATED",
      actor: "brasporto",
      actorName: body.operatorName ?? "Sistema",
    },
  });

  return Response.json({ shipment, portalUrl: `/portal/${token}` }, { status: 201 });
}
