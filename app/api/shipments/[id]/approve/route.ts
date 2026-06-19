import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const body = await req.json();
  const { role, actorName, notes } = body;

  const shipment = await prisma.shipment.findUnique({ where: { id } });
  if (!shipment) return Response.json({ error: "Embarque não encontrado" }, { status: 404 });

  let newStatus: string;
  let action: string;

  if (role === "client") {
    newStatus = "CLIENT_APPROVED";
    action = "CLIENT_APPROVED";
  } else if (role === "brasporto") {
    newStatus = "APPROVED";
    action = "BRASPORTO_APPROVED";
  } else {
    return Response.json({ error: "Role inválido" }, { status: 400 });
  }

  const updated = await prisma.shipment.update({
    where: { id },
    data: {
      status: newStatus,
      brasportoNotes: role === "brasporto" ? (notes ?? null) : shipment.brasportoNotes,
    },
  });

  await prisma.auditLog.create({
    data: {
      shipmentId: id,
      action,
      actor: role,
      actorName: actorName ?? null,
    },
  });

  return Response.json(updated);
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const body = await req.json();
  const { actorName, notes } = body;

  const shipment = await prisma.shipment.findUnique({ where: { id } });
  if (!shipment) return Response.json({ error: "Embarque não encontrado" }, { status: 404 });

  const updated = await prisma.shipment.update({
    where: { id },
    data: { status: "REVIEW", brasportoNotes: notes ?? null },
  });

  await prisma.auditLog.create({
    data: {
      shipmentId: id,
      action: "CORRECTION_REQUESTED",
      actor: "brasporto",
      actorName: actorName ?? null,
      newValue: notes ?? null,
    },
  });

  return Response.json(updated);
}
