import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { chatWithAI } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { token, message } = body;

  if (!token || !message) {
    return Response.json({ error: "Token e message são obrigatórios" }, { status: 400 });
  }

  const shipment = await prisma.shipment.findUnique({
    where: { token },
    select: {
      bookingNumber: true,
      portOrigin: true,
      portDestination: true,
      shipperName: true,
      consigneeName: true,
      validationIssues: true,
      aiNotes: true,
    },
  });

  if (!shipment) return Response.json({ error: "Embarque não encontrado" }, { status: 404 });

  const context = JSON.stringify(shipment, null, 2);
  const reply = await chatWithAI(message, context);

  return Response.json({ reply });
}
