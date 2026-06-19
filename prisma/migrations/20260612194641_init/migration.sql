-- CreateTable
CREATE TABLE "Shipment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "clientName" TEXT,
    "clientEmail" TEXT,
    "clientPhone" TEXT,
    "shipperName" TEXT,
    "shipperAddress" TEXT,
    "shipperCity" TEXT,
    "shipperCountry" TEXT,
    "shipperContact" TEXT,
    "consigneeName" TEXT,
    "consigneeAddress" TEXT,
    "consigneeCity" TEXT,
    "consigneeCountry" TEXT,
    "consigneeContact" TEXT,
    "notifyName" TEXT,
    "notifyAddress" TEXT,
    "notifyContact" TEXT,
    "portOrigin" TEXT,
    "portDestination" TEXT,
    "portTransshipment" TEXT,
    "deliveryPlace" TEXT,
    "vessel" TEXT,
    "voyage" TEXT,
    "bookingNumber" TEXT,
    "volumeCount" TEXT,
    "packageType" TEXT,
    "grossWeight" TEXT,
    "netWeight" TEXT,
    "measurement" TEXT,
    "containerNumbers" TEXT,
    "sealNumbers" TEXT,
    "incoterm" TEXT,
    "currency" TEXT,
    "commercialValue" TEXT,
    "freightTerms" TEXT,
    "goodsDescription" TEXT,
    "ncm" TEXT,
    "marksNumbers" TEXT,
    "dueNumber" TEXT,
    "validationIssues" TEXT,
    "aiNotes" TEXT,
    "brasportoNotes" TEXT
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shipmentId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "extractedText" TEXT,
    "processedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Document_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shipmentId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "field" TEXT,
    "oldValue" TEXT,
    "newValue" TEXT,
    "actor" TEXT NOT NULL,
    "actorName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Shipment_token_key" ON "Shipment"("token");
