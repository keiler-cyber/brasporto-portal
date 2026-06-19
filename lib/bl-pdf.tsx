import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import path from "path";
import fs from "fs";

const styles = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 7.5, padding: 20, backgroundColor: "#fff", flexDirection: "column" },
  row: { flexDirection: "row" },
  cell: { border: "0.5pt solid #000", padding: "3pt 4pt", flexDirection: "column" },
  label: { fontSize: 6.5, fontFamily: "Helvetica-Bold", color: "#000", marginBottom: 2 },
  val: { fontSize: 7.5, color: "#000", minHeight: 10 },
  bold: { fontFamily: "Helvetica-Bold" },
  center: { textAlign: "center" },
  shade: { backgroundColor: "#e8e8e8" },
});

const nTop    = { borderTop:    "none" } as const;
const nRight  = { borderRight:  "none" } as const;
const nBottom = { borderBottom: "none" } as const;

interface Shipment {
  bookingNumber?: string | null;
  shipperName?: string | null;
  shipperAddress?: string | null;
  shipperCity?: string | null;
  shipperCountry?: string | null;
  shipperContact?: string | null;
  consigneeName?: string | null;
  consigneeAddress?: string | null;
  consigneeCity?: string | null;
  consigneeCountry?: string | null;
  consigneeContact?: string | null;
  notifyName?: string | null;
  notifyAddress?: string | null;
  notifyContact?: string | null;
  portOrigin?: string | null;
  portDestination?: string | null;
  deliveryPlace?: string | null;
  vessel?: string | null;
  voyage?: string | null;
  volumeCount?: string | null;
  packageType?: string | null;
  grossWeight?: string | null;
  measurement?: string | null;
  containerNumbers?: string | null;
  sealNumbers?: string | null;
  incoterm?: string | null;
  freightTerms?: string | null;
  goodsDescription?: string | null;
  ncm?: string | null;
  marksNumbers?: string | null;
  dueNumber?: string | null;
}

const v    = (x?: string | null) => x ?? "";
const join = (...parts: (string | null | undefined)[]) => parts.filter(Boolean).join("\n");

function getLogoSrc(): string | null {
  try {
    const logoPath = path.join(process.cwd(), "public", "brasporto-logo.png");
    if (fs.existsSync(logoPath)) {
      const buf = fs.readFileSync(logoPath);
      return `data:image/png;base64,${buf.toString("base64")}`;
    }
  } catch { /* ignorado */ }
  return null;
}

export function DraftBLDocument({ shipment, blNumber }: { shipment: Shipment; blNumber?: string }) {
  const logoSrc = getLogoSrc();
  const cntrs = (shipment.containerNumbers ?? "").split(/[,;\n]/).map((s) => s.trim()).filter(Boolean);
  const seals = (shipment.sealNumbers ?? "").split(/[,;\n]/).map((s) => s.trim()).filter(Boolean);

  const cntrBlock = cntrs.map((cntr, i) => {
    const seal = seals[i];
    return [cntr ? `CNTR: ${cntr}` : null, seal ? `SEAL: ${seal}` : null]
      .filter(Boolean).join("\n");
  }).join("\n");

  return (
    <Document title={`Draft BL – ${v(shipment.bookingNumber)}`} author="Brasporto Logística">
      <Page size="A4" style={styles.page}>

        {/* ═══════════════════════════════════════════════════════════
            LINHA 1 — Shipper | Booking No. | Bill of Lading No.
                                | Export References
            Separador externo em 17/29 = 58,6%
            ═══════════════════════════════════════════════════════════ */}
        <View style={styles.row}>
          <View style={[styles.cell, nRight, { flex: 17, minHeight: 68 }]}>
            <Text style={styles.label}>Shipper / Exporter (Complete Name and Address)</Text>
            <Text style={styles.val}>
              {join(shipment.shipperName, shipment.shipperAddress, shipment.shipperCity, shipment.shipperCountry)}
            </Text>
          </View>
          <View style={{ flex: 12, flexDirection: "column" }}>
            <View style={{ flexDirection: "row" }}>
              <View style={[styles.cell, nRight, nBottom, { flex: 1 }]}>
                <Text style={styles.label}>Booking No.</Text>
                <Text style={[styles.val, styles.bold]}>{v(shipment.bookingNumber)}</Text>
              </View>
              <View style={[styles.cell, nBottom, { flex: 1 }]}>
                <Text style={styles.label}>Bill of Lading No.</Text>
                <Text style={[styles.val, styles.bold]}>{blNumber ?? ""}</Text>
              </View>
            </View>
            <View style={[styles.cell, nTop, { flex: 1 }]}>
              <Text style={styles.label}>Export References</Text>
              <Text style={styles.val}> </Text>
            </View>
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════════════
            LINHA 2 — Consignee | Logo
            Separador em 17/29 = 58,6%
            ═══════════════════════════════════════════════════════════ */}
        <View style={styles.row}>
          <View style={[styles.cell, nTop, nRight, { flex: 17, minHeight: 48 }]}>
            <Text style={styles.label}>Consignee (Complete Name and Address)</Text>
            <Text style={styles.val}>
              {join(shipment.consigneeName, shipment.consigneeAddress, shipment.consigneeCity, shipment.consigneeCountry, shipment.consigneeContact)}
            </Text>
          </View>
          <View style={[styles.cell, nTop, { flex: 12, alignItems: "center", justifyContent: "center", minHeight: 48 }]}>
            {logoSrc
              ? <Image src={logoSrc} style={{ width: 130, objectFit: "contain" }} />
              : <Text style={[styles.bold, { fontSize: 12, color: "#2d7a8a" }]}>BRASPORTO</Text>}
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════════════
            LINHA 3 — Notify Party | Forwarding Agent
            Separador em 17/29 = 58,6%
            ═══════════════════════════════════════════════════════════ */}
        <View style={styles.row}>
          <View style={[styles.cell, nTop, nRight, { flex: 17, minHeight: 36 }]}>
            <Text style={styles.label}>Notify Party (Complete Name and Address)</Text>
            <Text style={styles.val}>{join(shipment.notifyName, shipment.notifyAddress, shipment.notifyContact)}</Text>
          </View>
          <View style={[styles.cell, nTop, { flex: 12, minHeight: 36 }]}>
            <Text style={styles.label}>Forwarding Agent Reference</Text>
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════════════
            LINHA 4 — Pre Carriage (estreito) | Place of Receipt (largo)
            Total 9+20=29 → separador em 9/29 ≈ 31%
            ═══════════════════════════════════════════════════════════ */}
        <View style={styles.row}>
          <View style={[styles.cell, nTop, nRight, { flex: 9 }]}>
            <Text style={styles.label}>Pre Carriage By</Text>
            <Text style={styles.val}> </Text>
          </View>
          <View style={[styles.cell, nTop, { flex: 20 }]}>
            <Text style={styles.label}>Place of Receipt by participating carrier</Text>
            <Text style={styles.val}>{v(shipment.portOrigin)}</Text>
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════════════
            LINHA 5 — Vessel | Port of Loading | ETD | Originals
            Total 9+9+7+4=29 → separador em 9/29 ≈ 31%
            ═══════════════════════════════════════════════════════════ */}
        <View style={styles.row}>
          <View style={[styles.cell, nTop, nRight, { flex: 9 }]}>
            <Text style={styles.label}>Vessel/Voyage/Flag</Text>
            <Text style={styles.val}>{[shipment.vessel, shipment.voyage].filter(Boolean).join(" / ")}</Text>
          </View>
          <View style={[styles.cell, nTop, nRight, { flex: 9 }]}>
            <Text style={styles.label}>Port of Loading</Text>
            <Text style={styles.val}>{v(shipment.portOrigin)}</Text>
          </View>
          <View style={[styles.cell, nTop, nRight, { flex: 7 }]}>
            <Text style={styles.label}>ETD at Loading Port</Text>
            <Text style={styles.val}> </Text>
          </View>
          <View style={[styles.cell, nTop, { flex: 4 }]}>
            <Text style={styles.label}>Originals to be released at</Text>
            <Text style={styles.val}> </Text>
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════════════
            LINHA 6 — Port of Discharge | Place of Delivery | Type of Movement
            Total 9+9+11=29 → separador em 9/29 ≈ 31%
            ═══════════════════════════════════════════════════════════ */}
        <View style={styles.row}>
          <View style={[styles.cell, nTop, nRight, { flex: 9 }]}>
            <Text style={styles.label}>Port of Discharge</Text>
            <Text style={styles.val}>{v(shipment.portDestination)}</Text>
          </View>
          <View style={[styles.cell, nTop, nRight, { flex: 9 }]}>
            <Text style={styles.label}>Place of Delivery by participating carrier</Text>
            <Text style={styles.val}>{v(shipment.deliveryPlace)}</Text>
          </View>
          <View style={[styles.cell, nTop, { flex: 11 }]}>
            <Text style={styles.label}>Type of Movement (If mixed, use description of packages and goods)</Text>
            <Text style={styles.val}> </Text>
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════════════
            TABELA DE CARGA
            ═══════════════════════════════════════════════════════════ */}
        <View style={[styles.cell, nTop, styles.shade, { alignItems: "center" }]}>
          <Text style={[styles.label, styles.center, { fontSize: 7.5 }]}>Particulars Furnished by Shipper</Text>
        </View>

        {/* Cabeçalho das colunas */}
        <View style={styles.row}>
          {[
            { label: "Container nos with seal nos.\nMarks and Numbers", flex: 6 },
            { label: "Quantity\nPackages",                               flex: 3 },
            { label: "Description of Packages and Goods",               flex: 15 },
            { label: "Gross Weight",                                     flex: 4 },
            { label: "Measurement",                                      flex: 3 },
          ].map((h, i, arr) => (
            <View
              key={i}
              style={[styles.cell, nTop, i < arr.length - 1 ? nRight : {}, styles.shade, { flex: h.flex, alignItems: "center" }]}
            >
              <Text style={[styles.label, styles.center]}>{h.label}</Text>
            </View>
          ))}
        </View>

        {/* Área de carga — ocupa todo o espaço restante da página */}
        <View style={[styles.row, { flex: 1 }]}>
          <View style={[styles.cell, nTop, nRight, { flex: 6 }]}>
            <Text style={{ fontSize: 7, lineHeight: 1.7 }}>{cntrBlock}</Text>
          </View>
          <View style={[styles.cell, nTop, nRight, { flex: 3 }]}>
            <Text style={{ fontSize: 7.5 }}>{`${v(shipment.volumeCount)} ${v(shipment.packageType)}`.trim()}</Text>
          </View>
          <View style={[styles.cell, nTop, nRight, { flex: 15 }]}>
            <Text style={{ fontSize: 7.5, lineHeight: 1.5 }}>{v(shipment.goodsDescription)}</Text>
          </View>
          <View style={[styles.cell, nTop, nRight, { flex: 4 }]}>
            <Text style={{ fontSize: 7.5 }}>{v(shipment.grossWeight)}</Text>
          </View>
          <View style={[styles.cell, nTop, { flex: 3 }]}>
            <Text style={{ fontSize: 7.5 }}>{v(shipment.measurement)}</Text>
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════════════
            Other Instructions
            ═══════════════════════════════════════════════════════════ */}
        <View style={[styles.cell, nTop, { minHeight: 22 }]}>
          <Text style={styles.label}>Other Instructions :</Text>
          <Text style={{ fontSize: 7.5 }}>{v(shipment.freightTerms)}</Text>
        </View>

        {/* ═══════════════════════════════════════════════════════════
            Freight & Charges + Texto Legal
            ═══════════════════════════════════════════════════════════ */}
        <View style={styles.row}>
          <View style={[styles.cell, nTop, nRight, { flex: 10, minHeight: 90 }]}>
            <Text style={styles.label}>Freight and Charges</Text>
          </View>
          <View style={[styles.cell, nTop, { flex: 19, paddingTop: 4 }]}>
            <Text style={{ fontSize: 6.5, lineHeight: 1.6, color: "#000", marginBottom: 6 }}>
              {"RECEIVED the goods or the containers, vans, trailers, pallets units or others packages said to contain goods herein mentioned, in apparent goods order and condition, except as otherwise indicated, to be transported, delivered or transshipped as provid herein. All of the provisions written, printed or stamped on either side hereof are part of this bill of lading contract."}
            </Text>
            <Text style={{ fontSize: 6.5, lineHeight: 1.6, color: "#000", marginBottom: 8 }}>
              {"IN WITNESS WHEREOF, the carrier or agent of said vessel has signed EXPRESS RELEASE bills of lading, all of the same tenor and dat, one which being accomplished, the others to stand void"}
            </Text>
            <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "flex-start", gap: 6, marginBottom: 8 }}>
              <Text style={[styles.bold, { fontSize: 7.5 }]}>BY</Text>
              <View style={{ alignItems: "center" }}>
                <Text style={[styles.bold, { fontSize: 7.5 }]}>BRASPORTO ASSESSORIA ADUANEIRA LTDA-EPP</Text>
                <Text style={{ fontSize: 7.5 }}>ON BE HALF OF</Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "center", gap: 40, borderTop: "0.5pt solid #666", paddingTop: 4 }}>
              <Text style={[styles.bold, { fontSize: 7.5 }]}>DATED BY</Text>
              <Text style={[styles.bold, { fontSize: 7.5 }]}>BL No   {blNumber ?? ""}</Text>
            </View>
          </View>
        </View>

      </Page>
    </Document>
  );
}
