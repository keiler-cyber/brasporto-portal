import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ token: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { token } = await params;
  const shipment = await prisma.shipment.findUnique({
    where: { token },
    include: {
      documents: { select: { id: true, fileName: true, fileType: true, fileSize: true, processedAt: true } },
      auditLogs: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!shipment) return Response.json({ error: "Link inválido ou expirado" }, { status: 404 });
  return Response.json(shipment);
}
