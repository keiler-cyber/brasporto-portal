"use client";

import { useEffect, useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface Document {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  processedAt: string | null;
}

interface ValidationIssue {
  field: string;
  type: "mismatch" | "missing" | "warning";
  message: string;
  doc1?: string;
  doc2?: string;
  value1?: string;
  value2?: string;
}

interface Shipment {
  id: string;
  token: string;
  status: string;
  clientName: string | null;
  bookingNumber: string | null;
  shipperName: string | null;
  shipperAddress: string | null;
  shipperCity: string | null;
  shipperCountry: string | null;
  shipperContact: string | null;
  consigneeName: string | null;
  consigneeAddress: string | null;
  consigneeCity: string | null;
  consigneeCountry: string | null;
  consigneeContact: string | null;
  notifyName: string | null;
  notifyAddress: string | null;
  notifyContact: string | null;
  portOrigin: string | null;
  portDestination: string | null;
  portTransshipment: string | null;
  deliveryPlace: string | null;
  vessel: string | null;
  voyage: string | null;
  volumeCount: string | null;
  packageType: string | null;
  grossWeight: string | null;
  netWeight: string | null;
  measurement: string | null;
  containerNumbers: string | null;
  sealNumbers: string | null;
  incoterm: string | null;
  currency: string | null;
  commercialValue: string | null;
  freightTerms: string | null;
  goodsDescription: string | null;
  ncm: string | null;
  marksNumbers: string | null;
  dueNumber: string | null;
  validationIssues: string | null;
  aiNotes: string | null;
  brasportoNotes: string | null;
  documents: Document[];
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Aguardando Documentos",
  DOCS_UPLOADED: "Documentos Recebidos",
  EXTRACTING: "Extraindo Dados com IA...",
  REVIEW: "Em Revisão",
  CLIENT_APPROVED: "Aprovado — Aguardando Brasporto",
  BRASPORTO_REVIEW: "Em Análise Brasporto",
  APPROVED: "Aprovado pela Brasporto",
  REJECTED: "Rejeitado",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-700",
  DOCS_UPLOADED: "bg-blue-100 text-blue-700",
  EXTRACTING: "bg-yellow-100 text-yellow-700",
  REVIEW: "bg-purple-100 text-purple-700",
  CLIENT_APPROVED: "bg-indigo-100 text-indigo-700",
  BRASPORTO_REVIEW: "bg-orange-100 text-orange-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

function FieldInput({
  label,
  value,
  onChange,
  multiline = false,
  required = false,
  highlight = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  required?: boolean;
  highlight?: boolean;
}) {
  const baseClass = `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
    highlight ? "border-orange-400 bg-orange-50" : "border-gray-200 bg-white"
  }`;
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {multiline ? (
        <textarea
          className={baseClass}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
        />
      ) : (
        <input
          type="text"
          className={baseClass}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
      <h3 className="font-semibold text-gray-800 text-base border-b border-gray-100 pb-2">{title}</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

export default function PortalPage({ params }: { params: Promise<{ token: string }> }) {
  const [token, setToken] = useState<string>("");
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [chatMsg, setChatMsg] = useState("");
  const [chatReply, setChatReply] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [form, setForm] = useState<Partial<Shipment>>({});
  const [issues, setIssues] = useState<ValidationIssue[]>([]);

  useEffect(() => {
    params.then(({ token }) => {
      setToken(token);
    });
  }, [params]);

  const fetchShipment = useCallback(async (tok: string) => {
    const res = await fetch(`/api/portal/${tok}`);
    if (!res.ok) {
      setError("Link inválido ou expirado.");
      setLoading(false);
      return;
    }
    const data = await res.json();
    if (!data.documents) data.documents = [];
    setShipment(data);
    setForm(data);
    if (data.validationIssues) {
      try {
        const parsed = JSON.parse(data.validationIssues);
        setIssues(Array.isArray(parsed) ? parsed : []);
      } catch { setIssues([]); }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (token) fetchShipment(token);
  }, [token, fetchShipment]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!shipment) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("token", token);
    acceptedFiles.forEach((f) => fd.append("files", f));
    const res = await fetch("/api/documents/upload", { method: "POST", body: fd });
    if (res.ok) {
      await fetchShipment(token);
    }
    setUploading(false);
  }, [shipment, token, fetchShipment]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "application/zip": [".zip"],
    },
  });

  const handleExtract = async () => {
    if (!shipment) return;
    setExtracting(true);
    setExtractError("");
    setForm((f) => ({
      ...f,
      shipperName: "", shipperAddress: "", shipperCity: "", shipperCountry: "", shipperContact: "",
      consigneeName: "", consigneeAddress: "", consigneeCity: "", consigneeCountry: "", consigneeContact: "",
      notifyName: "", notifyAddress: "", notifyContact: "",
      portOrigin: "", portDestination: "", portTransshipment: "", deliveryPlace: "",
      vessel: "", voyage: "", volumeCount: "", packageType: "",
      grossWeight: "", netWeight: "", measurement: "",
      containerNumbers: "", sealNumbers: "",
      incoterm: "", currency: "", commercialValue: "", freightTerms: "",
      goodsDescription: "", ncm: "", marksNumbers: "", dueNumber: "",
    }));
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shipmentId: shipment.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setShipment(data.shipment);
        setForm(data.shipment);
        setIssues(data.issues ?? []);
      } else {
        setExtractError(`${data.error ?? "Falha na extração"}${data.detail ? `: ${data.detail}` : ""}`);
      }
    } catch (e) {
      setExtractError(`Erro de conexão: ${String(e)}`);
    }
    setExtracting(false);
  };

  const handleSave = async () => {
    if (!shipment) return;
    setSaving(true);
    setSaveSuccess(null);
    await fetch(`/api/shipments/${shipment.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, actor: "client", actorName: shipment.clientName ?? "Cliente" }),
    });
    const savedName = (form.shipperName as string | undefined) || shipment.clientName || "Rascunho";
    setSaveSuccess(savedName);
    setSaving(false);
    setTimeout(() => setSaveSuccess(null), 6000);
  };

  const handleApprove = async () => {
    if (!shipment) return;
    await handleSave();
    const res = await fetch(`/api/shipments/${shipment.id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "client", actorName: shipment.clientName ?? "Cliente" }),
    });
    if (res.ok) {
      const data = await res.json();
      setShipment((s) => s ? { ...s, status: data.status } : s);
    }
  };

  const handleChat = async () => {
    if (!chatMsg.trim()) return;
    setChatLoading(true);
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, message: chatMsg }),
    });
    if (res.ok) {
      const data = await res.json();
      setChatReply(data.reply);
    }
    setChatLoading(false);
  };

  const field = (key: keyof Shipment) => String(form[key] ?? "");
  const setField = (key: keyof Shipment) => (v: string) => setForm((f) => ({ ...f, [key]: v }));
  const hasIssue = (key: string) => safeIssues.some((i) => i.field === key);

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-blue-700 font-medium animate-pulse">Carregando embarque...</div>
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 shadow text-center max-w-sm">
          <div className="text-4xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Link Inválido</h2>
          <p className="text-gray-500 text-sm">{error || "Este link não é válido ou já expirou."}</p>
        </div>
      </div>
    );
  }

  const docs = shipment.documents ?? [];
  const safeIssues = Array.isArray(issues) ? issues : [];
  const isApproved = ["CLIENT_APPROVED", "APPROVED"].includes(shipment.status);
  const canEdit = ["REVIEW", "DOCS_UPLOADED"].includes(shipment.status);

  return (
    <div className="min-h-screen" style={{ background: "rgba(240,248,251,0.97)" }}>
      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 shadow-lg" style={{ background: "#002b38" }}>
        <div className="max-w-5xl mx-auto px-8 py-3.5 flex items-center gap-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brasporto-logo.png"
            alt="Brasporto"
            className="h-16 w-auto object-contain flex-shrink-0"
            style={{ filter: "brightness(0) invert(1)", maxWidth: "240px" }}
          />
          <div className="w-px h-8 flex-shrink-0" style={{ background: "rgba(255,255,255,0.2)" }} />
          <div className="flex-shrink-0 min-w-0">
            <p className="text-sm font-semibold text-white leading-tight">Portal de Instruções de Embarque</p>
            <p className="text-[11px] truncate" style={{ color: "#7dd3e8" }}>
              {shipment.clientName ? `Embarque: ${shipment.clientName}` : "Portal do Exportador"}
              {shipment.bookingNumber ? ` · Booking: ${shipment.bookingNumber}` : ""}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-3 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/oea-logo.png" alt="OEA" className="h-10 w-auto object-contain hidden sm:block" />
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[shipment.status] ?? "bg-gray-100 text-gray-700"}`}>
              {STATUS_LABELS[shipment.status] ?? shipment.status}
            </span>
          </div>
        </div>
        <div className="h-0.5" style={{ background: "linear-gradient(90deg,rgba(74,155,170,0.3),#4A9BAA,rgba(74,155,170,0.3))" }} />
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* Brasporto notes (if correction requested) */}
        {shipment.brasportoNotes && shipment.status === "REVIEW" && (
          <div className="bg-orange-50 border border-orange-300 rounded-xl p-4">
            <p className="text-sm font-semibold text-orange-800 mb-1">⚠️ Ajuste solicitado pela Brasporto:</p>
            <p className="text-sm text-orange-700">{shipment.brasportoNotes}</p>
          </div>
        )}

        {/* Step 1: Upload */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">1. Envie seus Documentos</h2>

          {/* Document checklist */}
          {!isApproved && (
            <div className="mb-5 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-blue-800 mb-3 uppercase tracking-wide">Documentos necessários:</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { icon: "🧾", title: "Commercial Invoice", desc: "Fatura comercial da exportação. Se houver mais de uma, anexe todas.", required: true },
                  { icon: "📦", title: "Packing List", desc: "Romaneio de embalagem. Se houver mais de um, anexe todos.", required: true },
                  { icon: "📜", title: "DUE", desc: "Declaração Única de Exportação (extrato do Siscomex).", required: true },
                ].map((doc) => {
                  const uploaded = docs.some((d) =>
                    (doc.title.toLowerCase().includes("invoice") && d.fileType === "invoice") ||
                    (doc.title.toLowerCase().includes("packing") && d.fileType === "packing_list") ||
                    (doc.title.toLowerCase().includes("due") && d.fileType === "due")
                  );
                  return (
                    <div key={doc.title} className={`rounded-lg p-3 border ${uploaded ? "bg-green-50 border-green-300" : "bg-white border-blue-200"}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{doc.icon}</span>
                        <span className={`text-xs font-semibold ${uploaded ? "text-green-700" : "text-blue-800"}`}>
                          {doc.title} {uploaded && "✓"}
                        </span>
                        {doc.required && !uploaded && <span className="text-red-500 text-xs">*</span>}
                      </div>
                      <p className="text-xs text-gray-500">{doc.desc}</p>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                <span className="text-red-500">*</span> Obrigatório — <strong>se tiver múltiplas Invoices ou Packing Lists, envie todas</strong>; os valores serão somados automaticamente.
              </p>
            </div>
          )}

          {docs.length > 0 && (
            <div className="mb-4 space-y-2">
              {docs.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
                  <span className="text-lg">{doc.fileType === "invoice" ? "🧾" : doc.fileType === "packing_list" ? "📦" : doc.fileType === "due" ? "📜" : "📄"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{doc.fileName}</p>
                    <p className="text-xs text-gray-400">{doc.fileType} • {(doc.fileSize / 1024).toFixed(0)} KB</p>
                  </div>
                  {doc.processedAt && <span className="text-green-500 text-xs">✓ lido</span>}
                </div>
              ))}
            </div>
          )}

          {!isApproved && (
            <>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  isDragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-blue-300 hover:bg-gray-50"
                }`}
              >
                <input {...getInputProps()} />
                <div className="text-3xl mb-2">📎</div>
                {uploading ? (
                  <p className="text-blue-600 font-medium animate-pulse">Enviando...</p>
                ) : (
                  <>
                    <p className="text-gray-600 font-medium">Arraste arquivos aqui ou clique para selecionar</p>
                    <p className="text-gray-400 text-xs mt-1">PDF, Excel, Word, JPG, PNG, ZIP</p>
                  </>
                )}
              </div>

              {docs.length > 0 && ["DOCS_UPLOADED", "REVIEW"].includes(shipment.status) && (
                <>
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={handleExtract}
                      disabled={extracting}
                      className="flex-1 text-white py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      style={{ background: "#4A9BAA" }}
                    >
                      {extracting ? "🤖 Extraindo..." : "🤖 Extrair por IA"}
                    </button>
                    {shipment.status === "DOCS_UPLOADED" && (
                      <button
                        onClick={async () => {
                          const res = await fetch(`/api/shipments/${shipment.id}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ status: "REVIEW", actor: "client" }),
                          });
                          if (res.ok) {
                            const updated = await res.json();
                            setShipment({ ...shipment, status: "REVIEW", ...updated });
                            setForm({ ...shipment, status: "REVIEW", ...updated });
                          }
                        }}
                        className="px-4 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors text-sm"
                      >
                        ✏️ Preencher Manualmente
                      </button>
                    )}
                  </div>
                  {extractError && (
                    <div className="mt-3 bg-red-50 border border-red-300 rounded-lg px-4 py-3 text-sm text-red-800">
                      ❌ {extractError}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* Validation issues */}
        {safeIssues.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 space-y-2">
            <h3 className="font-semibold text-yellow-800 text-sm">⚠️ Alertas de Validação ({safeIssues.length})</h3>
            {safeIssues.map((issue, i) => (
              <div key={i} className={`text-sm px-3 py-2 rounded-lg ${issue.type === "mismatch" ? "bg-orange-100 text-orange-800" : issue.type === "missing" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}>
                {issue.type === "missing" ? "❌" : "⚠️"} {issue.message}
                {issue.value1 && ` (Invoice: ${issue.value1} / ${issue.doc2}: ${issue.value2})`}
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

        {/* Step 2: Form */}
        {(shipment.status === "REVIEW" || isApproved) && (
          <>
            <div className="flex items-center gap-3">
              <h2 className="font-semibold text-gray-800">2. Revise as Informações Extraídas</h2>
              {isApproved && <span className="text-green-600 text-sm font-medium">✓ Aprovado</span>}
            </div>

            <Section title="Exportador (Shipper)">
              <FieldInput label="Razão Social" value={field("shipperName")} onChange={setField("shipperName")} required highlight={hasIssue("shipperName")} />
              <FieldInput label="Endereço" value={field("shipperAddress")} onChange={setField("shipperAddress")} highlight={hasIssue("shipperAddress")} />
              <FieldInput label="Cidade" value={field("shipperCity")} onChange={setField("shipperCity")} />
              <FieldInput label="País" value={field("shipperCountry")} onChange={setField("shipperCountry")} />
              <FieldInput label="Contato" value={field("shipperContact")} onChange={setField("shipperContact")} />
            </Section>

            <Section title="Importador (Consignee)">
              <FieldInput label="Razão Social" value={field("consigneeName")} onChange={setField("consigneeName")} required highlight={hasIssue("consigneeName")} />
              <FieldInput label="Endereço" value={field("consigneeAddress")} onChange={setField("consigneeAddress")} />
              <FieldInput label="Cidade" value={field("consigneeCity")} onChange={setField("consigneeCity")} />
              <FieldInput label="País" value={field("consigneeCountry")} onChange={setField("consigneeCountry")} />
              <FieldInput label="Contato" value={field("consigneeContact")} onChange={setField("consigneeContact")} />
            </Section>

            <Section title="Notify Party">
              <FieldInput label="Nome" value={field("notifyName")} onChange={setField("notifyName")} />
              <FieldInput label="Endereço" value={field("notifyAddress")} onChange={setField("notifyAddress")} />
              <FieldInput label="Contato" value={field("notifyContact")} onChange={setField("notifyContact")} />
            </Section>

            <Section title="Transporte">
              <FieldInput label="Porto de Origem" value={field("portOrigin")} onChange={setField("portOrigin")} required highlight={hasIssue("portOrigin")} />
              <FieldInput label="Porto de Destino" value={field("portDestination")} onChange={setField("portDestination")} required highlight={hasIssue("portDestination")} />
              <FieldInput label="Porto de Transbordo" value={field("portTransshipment")} onChange={setField("portTransshipment")} />
              <FieldInput label="Local de Entrega" value={field("deliveryPlace")} onChange={setField("deliveryPlace")} />
              <FieldInput label="Navio" value={field("vessel")} onChange={setField("vessel")} />
              <FieldInput label="Viagem" value={field("voyage")} onChange={setField("voyage")} />
              <FieldInput label="Booking Number" value={field("bookingNumber")} onChange={setField("bookingNumber")} required highlight={hasIssue("bookingNumber")} />
            </Section>

            <Section title="Carga">
              <FieldInput label="Qtd. Volumes" value={field("volumeCount")} onChange={setField("volumeCount")} />
              <FieldInput label="Tipo de Embalagem" value={field("packageType")} onChange={setField("packageType")} />
              <FieldInput label="Peso Bruto (kg)" value={field("grossWeight")} onChange={setField("grossWeight")} required highlight={hasIssue("grossWeight")} />
              <FieldInput label="Peso Líquido (kg)" value={field("netWeight")} onChange={setField("netWeight")} />
              <FieldInput label="Cubagem (m³)" value={field("measurement")} onChange={setField("measurement")} />
              <FieldInput label="Contêineres" value={field("containerNumbers")} onChange={setField("containerNumbers")} />
              <FieldInput label="Lacres" value={field("sealNumbers")} onChange={setField("sealNumbers")} />
            </Section>

            <Section title="Comercial">
              <FieldInput label="Incoterm" value={field("incoterm")} onChange={setField("incoterm")} required highlight={hasIssue("incoterm")} />
              <FieldInput label="Moeda" value={field("currency")} onChange={setField("currency")} required highlight={hasIssue("currency")} />
              <FieldInput label="Valor Comercial" value={field("commercialValue")} onChange={setField("commercialValue")} required highlight={hasIssue("commercialValue")} />
              <FieldInput label="Freight Terms" value={field("freightTerms")} onChange={setField("freightTerms")} />
            </Section>

            <Section title="Mercadoria">
              <div className="sm:col-span-2">
                <FieldInput label="Descrição da Mercadoria" value={field("goodsDescription")} onChange={setField("goodsDescription")} multiline required highlight={hasIssue("goodsDescription")} />
              </div>
              <FieldInput label="NCM" value={field("ncm")} onChange={setField("ncm")} highlight={hasIssue("ncm")} />
              <FieldInput label="Marcas e Numeração" value={field("marksNumbers")} onChange={setField("marksNumbers")} />
              <FieldInput label="Número da DUE" value={field("dueNumber")} onChange={setField("dueNumber")} />
            </Section>

            {/* Save success banner */}
            {saveSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 flex items-center gap-2">
                <span className="text-green-500 text-lg">✓</span>
                <span>Rascunho salvo — <strong>{saveSuccess}</strong></span>
              </div>
            )}

            {/* Actions */}
            {canEdit && (
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 min-w-[140px] bg-gray-700 text-white py-3 rounded-xl font-semibold hover:bg-gray-800 disabled:opacity-50 transition-colors"
                >
                  {saving ? "Salvando..." : "💾 Salvar Rascunho"}
                </button>
                <button
                  onClick={handleApprove}
                  disabled={saving}
                  className="flex-1 min-w-[140px] bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  ✅ Aprovar e Enviar
                </button>
              </div>
            )}
          </>
        )}

        {/* AI Chat */}
        {!isApproved && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">🤖 Assistente IA</h3>
            <p className="text-sm text-gray-500 mb-3">Tem dúvidas sobre algum campo? Pergunte ao assistente.</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={chatMsg}
                onChange={(e) => setChatMsg(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleChat()}
                placeholder="Ex: O que devo colocar no campo Notify Party?"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={handleChat}
                disabled={chatLoading}
                className="text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
              style={{ background: "#4A9BAA" }}
              >
                {chatLoading ? "..." : "Enviar"}
              </button>
            </div>
            {chatReply && (
              <div className="mt-3 bg-blue-50 rounded-lg p-3 text-sm text-blue-800">
                {chatReply}
              </div>
            )}
          </div>
        )}

        {isApproved && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <div className="text-4xl mb-3">✅</div>
            <h3 className="font-semibold text-green-800 text-lg">Instrução de Embarque Enviada!</h3>
            <p className="text-green-700 text-lg font-semibold mt-1">Conte sempre com a Brasporto, sua melhor opção sempre</p>
            <p className="text-green-700 text-sm mt-2">
              Suas informações foram aprovadas e encaminhadas para análise da Brasporto.
              Você receberá uma confirmação em breve.
            </p>
            <div className="mt-4 flex flex-wrap gap-3 justify-center">
              <a
                href={`/api/generate-bl/${shipment.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                style={{ background: "#4A9BAA" }}
              >
                📄 Baixar draft do BL
              </a>
              {shipment.status === "APPROVED" && (
                <a
                  href={`/api/generate-bl/${shipment.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-800 transition-colors"
                >
                  ✅ Draft BL Aprovado (PDF)
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
