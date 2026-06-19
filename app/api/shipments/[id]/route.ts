import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const shipment = await prisma.shipment.findUnique({
    where: { id },
    include: {
      documents: true,
      auditLogs: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!shipment) return Response.json({ error: "Embarque não encontrado" }, { status: 404 });
  return Response.json(shipment);
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.shipment.findUnique({ where: { id } });
  if (!existing) return Response.json({ error: "Embarque não encontrado" }, { status: 404 });

  const { actor, actorName, ...fields } = body;

  const updated = await prisma.shipment.update({
    where: { id },
    data: fields,
  });

  const loggable = Object.entries(fields).filter(([key]) => key !== "status");
  for (const [key, newVal] of loggable) {
    const oldVal = (existing as Record<string, unknown>)[key];
    if (oldVal !== newVal) {
      await prisma.auditLog.create({
        data: {
          shipmentId: id,
          action: "FIELD_CHANGED",
          field: key,
          oldValue: String(oldVal ?? ""),
          newValue: String(newVal ?? ""),
          actor: actor ?? "system",
          actorName: actorName ?? null,
        },
      });
    }
  }

  return Response.json(updated);
}
