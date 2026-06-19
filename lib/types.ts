export type ShipmentStatus =
  | "PENDING"
  | "DOCS_UPLOADED"
  | "EXTRACTING"
  | "REVIEW"
  | "CLIENT_APPROVED"
  | "BRASPORTO_REVIEW"
  | "APPROVED"
  | "REJECTED";

export interface ValidationIssue {
  field: string;
  type: "mismatch" | "missing" | "warning";
  message: string;
  doc1?: string;
  doc2?: string;
  value1?: string;
  value2?: string;
}

export interface ExtractedFields {
  shipperName?: string;
  shipperAddress?: string;
  shipperCity?: string;
  shipperCountry?: string;
  shipperContact?: string;

  consigneeName?: string;
  consigneeAddress?: string;
  consigneeCity?: string;
  consigneeCountry?: string;
  consigneeContact?: string;

  notifyName?: string;
  notifyAddress?: string;
  notifyContact?: string;

  portOrigin?: string;
  portDestination?: string;
  portTransshipment?: string;
  deliveryPlace?: string;
  vessel?: string;
  voyage?: string;
  bookingNumber?: string;

  volumeCount?: string;
  packageType?: string;
  grossWeight?: string;
  netWeight?: string;
  measurement?: string;
  containerNumbers?: string;
  sealNumbers?: string;

  incoterm?: string;
  currency?: string;
  commercialValue?: string;
  freightTerms?: string;

  goodsDescription?: string;
  ncm?: string;
  marksNumbers?: string;

  dueNumber?: string;

  aiNotes?: string;
}

export const SHIPMENT_STATUS_LABELS: Record<ShipmentStatus, string> = {
  PENDING: "Aguardando Documentos",
  DOCS_UPLOADED: "Documentos Recebidos",
  EXTRACTING: "Extraindo Dados",
  REVIEW: "Em Revisão pelo Cliente",
  CLIENT_APPROVED: "Aprovado pelo Cliente",
  BRASPORTO_REVIEW: "Em Análise Brasporto",
  APPROVED: "Aprovado",
  REJECTED: "Rejeitado",
};

export const SHIPMENT_STATUS_COLORS: Record<ShipmentStatus, string> = {
  PENDING: "bg-gray-100 text-gray-700",
  DOCS_UPLOADED: "bg-blue-100 text-blue-700",
  EXTRACTING: "bg-yellow-100 text-yellow-700",
  REVIEW: "bg-purple-100 text-purple-700",
  CLIENT_APPROVED: "bg-indigo-100 text-indigo-700",
  BRASPORTO_REVIEW: "bg-orange-100 text-orange-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};
