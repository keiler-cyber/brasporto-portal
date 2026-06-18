"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";

interface AuditLog {
  id: string;
  action: string;
  field: string | null;
  oldValue: string | null;
  newValue: string | null;
  actor: string;
  actorName: string | null;
  createdAt: string;
}

interface Document {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  processedAt: string | null;
}

interface Shipment {
  id: string;
  token: string;
  status: string;
  clientName: string | null;
  clientEmail: string | null;
  bookingNumber: string | null;
  shipperName: string | null;
  consigneeName: string | null;
  portOrigin: string | null;
  portDestination: string | null;
  vessel: string | null;
  voyage: string | null;
  grossWeight: string | null;
  netWeight: string | null;
  measurement: string | null;
  goodsDescription: string | null;
  ncm: string | null;
  incoterm: string | null;
  currency: string | null;
  commercialValue: string | null;
  freightTerms: string | null;
  dueNumber: string | null;
  validationIssues: string | null;
  aiNotes: string | null;
  brasportoNotes: string | null;
  documents: Document[];
  auditLogs: AuditLog[];
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Aguardando Documentos",
  DOCS_UPLOADED: "Documentos Recebidos",
  EXTRACTING: "Extraindo com IA",
  REVIEW: "Em Revisão pelo Cliente",
  CLIENT_APPROVED: "Aprovado pelo Cliente",
  BRASPORTO_REVIEW: "Em Análise Brasporto",
  APPROVED: "Aprovado",
  REJECTED: "Rejeitado",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-600",
  DOCS_UPLOADED: "bg-blue-100 text-blue-700",
  EXTRACTING: "bg-yellow-100 text-yellow-700",
  REVIEW: "bg-purple-100 text-purple-700",
  CLIENT_APPROVED: "bg-indigo-100 text-indigo-700",
  BRASPORTO_REVIEW: "bg-orange-100 text-orange-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default function ShipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [actorName, setActorName] = useState("");
  const [acting, setActing] = useState(false);

  useEffect(() => {
    fetch(`/api/shipments/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setShipment(data);
        setNotes(data.brasportoNotes ?? "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleApprove = async () => {
    if (!shipment) return;
    setActing(true);
    const res = await fetch(`/api/shipments/${shipment.id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "brasporto", actorName: actorName || "Operador Brasporto", notes }),
    });
    if (res.ok) {
      const data = await res.json();
      setShipment((s) => s ? { ...s, status: data.status } : s);
    }
    setActing(false);
  };

  const handleRequestCorrection = async () => {
    if (!shipment || !notes.trim()) {
      alert("Descreva o que precisa ser corrigido antes de solicitar ajuste.");
      return;
    }
    setActing(true);
    const res = await fetch(`/api/shipments/${shipment.id}/approve`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actorName: actorName || "Operador Brasporto", notes }),
    });
    if (res.ok) {
      const data = await res.json();
      setShipment((s) => s ? { ...s, status: data.status, brasportoNotes: notes } : s);
    }
    setActing(false);
  };

  const copyPortalLink = () => {
    if (!shipment) return;
    navigator.clipboard.writeText(`${window.location.origin}/portal/${shipment.token}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "rgba(240,248,251,0.93)" }}>
        <div className="animate-pulse font-medium" style={{ color: "#4A9BAA" }}>Carregando...</div>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Embarque não encontrado.</div>
      </div>
    );
  }

  const issues = shipment.validationIssues ? JSON.parse(shipment.validationIssues) : [];
  const canApprove = shipment.status === "CLIENT_APPROVED";

  const Field = ({ label, value }: { label: string; value: string | null }) =>
    value ? (
      <div>
        <dt className="text-xs text-gray-500">{label}</dt>
        <dd className="text-sm font-medium text-gray-800 mt-0.5">{value}</dd>
      </div>
    ) : null;

  return (
    <div className="min-h-screen" style={{
      backgroundImage: "url(/port-bg.png)",
      backgroundSize: "cover",
      backgroundAttachment: "fixed",
      backgroundPosition: "center",
    }}>
      <div className="min-h-screen" style={{ background: "rgba(240,248,251,0.93)" }}>

        {/* ── HEADER ─────────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-20 shadow-lg" style={{ background: "#002b38" }}>
          <div className="max-w-7xl mx-auto px-8 py-3.5 flex items-center gap-5">
            <Link
              href="/dashboard"
              className="text-sm flex-shrink-0 transition"
              style={{ color: "rgba(255,255,255,0.6)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "white"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)"; }}
            >
              ← Dashboard
            </Link>
            <img
              src="/brasporto-logo.png"
              alt="Brasporto"
              className="h-16 w-auto object-contain flex-shrink-0"
              style={{ filter: "brightness(0) invert(1)", maxWidth: "240px" }}
            />
            <div className="w-px h-8 flex-shrink-0" style={{ background: "rgba(255,255,255,0.2)" }} />
            <div className="flex-shrink-0 min-w-0">
              <p className="text-sm font-semibold text-white leading-tight truncate">
                {shipment.clientName ?? "Embarque"}
              </p>
              <p className="text-[11px]" style={{ color: "#7dd3e8" }}>
                {shipment.bookingNumber ?? shipment.id.slice(0, 8)}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-3 flex-shrink-0">
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[shipment.status] ?? "bg-gray-100 text-gray-600"}`}>
                {STATUS_LABELS[shipment.status] ?? shipment.status}
              </span>
              <a
                href={`/api/generate-bl/${shipment.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-white px-3 py-1.5 rounded-lg transition-colors font-medium"
                style={{ background: "rgba(22,163,74,0.8)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(22,163,74,1)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(22,163,74,0.8)"; }}
              >
                📄 Draft BL (PDF)
              </a>
              <a
                href={`/api/generate-bl/${shipment.id}/excel`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-white px-3 py-1.5 rounded-lg transition-colors font-medium"
                style={{ background: "rgba(5,150,105,0.8)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(5,150,105,1)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(5,150,105,0.8)"; }}
              >
                📊 Excel
              </a>
              <button
                onClick={copyPortalLink}
                className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                style={{ background: "rgba(255,255,255,0.1)", color: "white" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.2)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)"; }}
              >
                🔗 Link Cliente
              </button>
            </div>
          </div>
          <div className="h-0.5" style={{ background: "linear-gradient(90deg,rgba(74,155,170,0.3),#4A9BAA,rgba(74,155,170,0.3))" }} />
        </header>

        <div className="max-w-7xl mx-auto px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Validation issues */}
            {issues.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 space-y-2">
                <h3 className="font-semibold text-yellow-800 text-sm">⚠️ Alertas ({issues.length})</h3>
                {issues.map((issue: { type: string; message: string; value1?: string; doc2?: string; value2?: string }, i: number) => (
                  <div key={i} className={`text-sm px-3 py-2 rounded-lg ${issue.type === "mismatch" ? "bg-orange-100 text-orange-800" : "bg-red-100 text-red-800"}`}>
                    {issue.type === "missing" ? "❌" : "⚠️"} {issue.message}
                    {issue.value1 && <span className="ml-1 font-mono text-xs">{issue.value1} ≠ {issue.value2}</span>}
                  </div>
                ))}
              </div>
            )}

            {/* AI Notes */}
            {shipment.aiNotes && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-blue-800 mb-2">🤖 Notas da IA:</p>
                <ol className="space-y-2 list-none">
                  {shipment.aiNotes.split(/(?=\d+\.\s)/).map(s => s.trim()).filter(Boolean).map((note, i) => (
                    <li key={i} className="text-sm text-blue-700 flex gap-2 bg-blue-100/60 rounded-lg px-3 py-2">
                      <span className="font-semibold text-blue-900 shrink-0">{note.match(/^(\d+\.)/)?.[1]}</span>
                      <span>{note.replace(/^\d+\.\s*/, "")}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Shipment data */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Dados do Embarque</h2>
              <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <Field label="Exportador" value={shipment.shipperName} />
                <Field label="Importador" value={shipment.consigneeName} />
                <Field label="Booking" value={shipment.bookingNumber} />
                <Field label="Porto Origem" value={shipment.portOrigin} />
                <Field label="Porto Destino" value={shipment.portDestination} />
                <Field label="Navio / Viagem" value={shipment.vessel && shipment.voyage ? `${shipment.vessel} / ${shipment.voyage}` : (shipment.vessel ?? shipment.voyage)} />
                <Field label="Peso Bruto" value={shipment.grossWeight} />
                <Field label="Peso Líquido" value={shipment.netWeight} />
                <Field label="Cubagem" value={shipment.measurement} />
                <Field label="Incoterm" value={shipment.incoterm} />
                <Field label="Moeda" value={shipment.currency} />
                <Field label="Valor Comercial" value={shipment.commercialValue} />
                <Field label="DUE" value={shipment.dueNumber} />
                <Field label="NCM" value={shipment.ncm} />
                <Field label="Freight Terms" value={shipment.freightTerms} />
              </dl>
              {shipment.goodsDescription && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <dt className="text-xs text-gray-500 mb-1">Descrição da Mercadoria</dt>
                  <dd className="text-sm text-gray-800">{shipment.goodsDescription}</dd>
                </div>
              )}
            </div>

            {/* Documents */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Documentos ({shipment.documents.length})</h2>
              {shipment.documents.length === 0 ? (
                <p className="text-gray-400 text-sm">Nenhum documento enviado.</p>
              ) : (
                <div className="space-y-2">
                  {shipment.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
                      <span className="text-lg">{doc.fileType === "invoice" ? "🧾" : doc.fileType === "packing_list" ? "📦" : doc.fileType === "due" ? "📜" : "📄"}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 truncate">{doc.fileName}</p>
                        <p className="text-xs text-gray-400">{doc.fileType} • {(doc.fileSize / 1024).toFixed(0)} KB</p>
                      </div>
                      {doc.processedAt ? <span className="text-green-500 text-xs">✓ lido</span> : <span className="text-gray-300 text-xs">pendente</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Audit log */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Histórico de Ações</h2>
              <div className="space-y-2">
                {shipment.auditLogs.map((log) => (
                  <div key={log.id} className="flex gap-3 text-sm">
                    <div className="text-gray-300 text-xs mt-0.5 w-32 shrink-0">{new Date(log.createdAt).toLocaleString("pt-BR")}</div>
                    <div>
                      <span className={`font-medium ${log.actor === "system" ? "text-blue-600" : log.actor === "client" ? "text-purple-600" : "text-green-600"}`}>
                        {log.actorName ?? log.actor}
                      </span>
                      {" — "}{log.action}
                      {log.field && <span className="text-gray-400 text-xs ml-1">({log.field})</span>}
                      {log.newValue && <span className="text-gray-500 ml-1 text-xs truncate max-w-xs block">{log.newValue}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar – Actions */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4">Ações Brasporto</h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Operador</label>
                  <input
                    type="text"
                    value={actorName}
                    onChange={(e) => setActorName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                    style={{ "--tw-ring-color": "#4A9BAA" } as React.CSSProperties}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Observações / Ajustes Necessários</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    placeholder="Descreva aqui os ajustes solicitados ao cliente..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  />
                </div>

                <button
                  onClick={handleApprove}
                  disabled={!canApprove || acting}
                  className="w-full text-white py-2.5 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  style={{ background: "#16a34a" }}
                  onMouseEnter={e => { if (!(!canApprove || acting)) (e.currentTarget as HTMLElement).style.background = "#15803d"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#16a34a"; }}
                >
                  {acting ? "Processando..." : "✅ Aprovar Embarque"}
                </button>

                <button
                  onClick={handleRequestCorrection}
                  disabled={acting || shipment.status === "APPROVED"}
                  className="w-full bg-orange-500 text-white py-2.5 rounded-xl font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  ⚠️ Solicitar Ajuste ao Cliente
                </button>

                <div className="pt-2 border-t border-gray-100">
                  <a
                    href={`/portal/${shipment.token}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center text-xs py-2 transition"
                    style={{ color: "#4A9BAA" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#3d8594"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#4A9BAA"; }}
                  >
                    Ver Portal do Cliente ↗
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-5 text-sm text-gray-500 space-y-2 shadow-sm">
              <div><span className="font-medium text-gray-700">Email:</span> {shipment.clientEmail ?? "—"}</div>
              <div><span className="font-medium text-gray-700">Criado:</span> {new Date(shipment.auditLogs[shipment.auditLogs.length - 1]?.createdAt ?? Date.now()).toLocaleDateString("pt-BR")}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
