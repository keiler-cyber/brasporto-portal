"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import type { ConferenteResult, FieldStatus, OverallStatus } from "@/lib/types-conferente";

const VERSION = "26.06.23";

// ── Helpers ──────────────────────────────────────────────────────────────────

function statusColor(s: FieldStatus | "OK" | "DISCREPANTE" | "NÃO LOCALIZADO"): string {
  if (s === "OK") return "#16a34a";
  if (s === "DISCREPANTE") return "#dc2626";
  if (s === "DIVERGÊNCIA ESPERADA") return "#0891b2";
  if (s === "ILEGÍVEL") return "#9333ea";
  return "#d97706";
}

function statusBg(s: FieldStatus | "OK" | "DISCREPANTE" | "NÃO LOCALIZADO"): string {
  if (s === "OK") return "rgba(22,163,74,0.08)";
  if (s === "DISCREPANTE") return "rgba(220,38,38,0.08)";
  if (s === "DIVERGÊNCIA ESPERADA") return "rgba(8,145,178,0.08)";
  if (s === "ILEGÍVEL") return "rgba(147,51,234,0.08)";
  return "rgba(217,119,6,0.08)";
}

function overallColors(s: OverallStatus) {
  if (s === "APROVADO") return { bg: "#dcfce7", border: "#16a34a", text: "#15803d", icon: "✓" };
  if (s === "REPROVADO") return { bg: "#fee2e2", border: "#dc2626", text: "#b91c1c", icon: "✗" };
  return { bg: "#fef9c3", border: "#ca8a04", text: "#a16207", icon: "⚠" };
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── Sub-components ────────────────────────────────────────────────────────────

function DocBadge({ type, reference, legibility }: { type: string; reference: string; legibility: string }) {
  const colors: Record<string, string> = {
    MBL: "#0891b2", HBL: "#4A9BAA", MAWB: "#7c3aed", HAWB: "#a855f7",
    INVOICE: "#059669", PACKING_LIST: "#16a34a", DESCONHECIDO: "#6b7280",
  };
  const color = colors[type] ?? "#6b7280";
  const legOk = legibility === "LEGÍVEL";
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "10px",
      padding: "10px 14px", borderRadius: "10px",
      border: `1px solid ${color}22`, background: `${color}11`,
    }}>
      <span style={{ fontFamily: "monospace", fontSize: "11px", fontWeight: 700,
        background: color, color: "white", padding: "2px 8px", borderRadius: "5px" }}>
        {type}
      </span>
      <span style={{ fontSize: "13px", color: "#1e293b", fontWeight: 500 }}>{reference}</span>
      <span style={{ marginLeft: "auto", fontSize: "11px",
        color: legOk ? "#16a34a" : "#d97706" }}>
        {legibility}
      </span>
    </div>
  );
}

function PairTable({ pair, fields }: { pair: string; fields: ConferenteResult["comparisons"][0]["fields"] }) {
  const [open, setOpen] = useState(true);
  const disc = fields.filter(f => f.status === "DISCREPANTE").length;
  return (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden", marginBottom: "16px" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px",
          padding: "12px 16px", background: disc > 0 ? "#fff5f5" : "#f8fafc",
          border: "none", cursor: "pointer", textAlign: "left" }}>
        <span style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{pair}</span>
        {disc > 0 && (
          <span style={{ fontSize: "11px", fontWeight: 600, color: "#dc2626",
            background: "#fee2e2", padding: "2px 8px", borderRadius: "999px" }}>
            {disc} discrepância{disc > 1 ? "s" : ""}
          </span>
        )}
        <span style={{ marginLeft: "auto", fontSize: "18px", color: "#94a3b8", lineHeight: 1 }}>
          {open ? "−" : "+"}
        </span>
      </button>

      {open && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
            <thead>
              <tr style={{ background: "#f1f5f9" }}>
                {["Campo", "Documento 1", "Documento 2", "Status", "Observação"].map(h => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600,
                    color: "#64748b", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fields.map((f, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "white" : "#fafafa",
                  borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "8px 12px", fontWeight: 500, color: "#374151",
                    whiteSpace: "nowrap" }}>{f.field}</td>
                  <td style={{ padding: "8px 12px", color: "#1e293b", maxWidth: "220px" }}>{f.doc1Value}</td>
                  <td style={{ padding: "8px 12px", color: "#1e293b", maxWidth: "220px" }}>{f.doc2Value}</td>
                  <td style={{ padding: "8px 12px", whiteSpace: "nowrap" }}>
                    <span style={{
                      fontSize: "11px", fontWeight: 600, padding: "3px 8px", borderRadius: "999px",
                      color: statusColor(f.status), background: statusBg(f.status),
                    }}>
                      {f.status}
                    </span>
                  </td>
                  <td style={{ padding: "8px 12px", color: "#64748b", maxWidth: "240px" }}>
                    {f.observation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ConsolidationTable({ consolidation }: { consolidation: NonNullable<ConferenteResult["consolidation"]> }) {
  return (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden", marginBottom: "16px" }}>
      <div style={{ padding: "12px 16px", background: "#f8fafc",
        display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>
          Consolidação (Master x Soma dos Houses)
        </span>
        <span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "999px",
          color: statusColor(consolidation.status as FieldStatus),
          background: statusBg(consolidation.status as FieldStatus) }}>
          {consolidation.status}
        </span>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
          <thead>
            <tr style={{ background: "#f1f5f9" }}>
              {["Campo", "Master", "Total Houses", "Status", "Observação"].map(h => (
                <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600,
                  color: "#64748b", borderBottom: "1px solid #e2e8f0" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {consolidation.fields.map((f, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "white" : "#fafafa",
                borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "8px 12px", fontWeight: 500, color: "#374151" }}>{f.field}</td>
                <td style={{ padding: "8px 12px", color: "#1e293b" }}>{f.masterValue}</td>
                <td style={{ padding: "8px 12px", color: "#1e293b" }}>{f.housesTotal}</td>
                <td style={{ padding: "8px 12px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 8px",
                    borderRadius: "999px", color: statusColor(f.status as FieldStatus),
                    background: statusBg(f.status as FieldStatus) }}>
                    {f.status}
                  </span>
                </td>
                <td style={{ padding: "8px 12px", color: "#64748b" }}>{f.observation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ConferentePage() {
  const [modal, setModal] = useState<"MARITIMO" | "AEREO">("MARITIMO");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ConferenteResult | null>(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(newFiles: FileList | null) {
    if (!newFiles) return;
    const pdfs = Array.from(newFiles).filter(f => f.type === "application/pdf");
    setFiles(prev => {
      const existing = new Set(prev.map(f => f.name));
      return [...prev, ...pdfs.filter(f => !existing.has(f.name))];
    });
  }

  function removeFile(name: string) {
    setFiles(prev => prev.filter(f => f.name !== name));
  }

  async function analyze() {
    if (!files.length) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const encoded = await Promise.all(
        files.map(async f => ({
          name: f.name,
          data: await fileToBase64(f),
          mediaType: "application/pdf",
        }))
      );

      const res = await fetch("/api/conferente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: encoded, modal }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erro na análise");
      setResult(json);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  const overall = result ? overallColors(result.overallStatus) : null;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>

      {/* Header */}
      <header style={{ background: "rgba(0,28,38,0.96)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "12px 32px",
          display: "flex", alignItems: "center", gap: "16px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brasporto-logo.png" alt="Brasporto"
            style={{ height: "44px", width: "auto", objectFit: "contain",
              filter: "brightness(0) invert(1)", maxWidth: "140px", opacity: 0.9 }} />
          <div style={{ width: "1px", height: "28px", background: "rgba(255,255,255,0.1)" }} />
          <div>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "white", margin: 0 }}>
              Conferente de Pré-Alerta
            </p>
            <p style={{ fontSize: "11px", color: "#4A9BAA", margin: 0, letterSpacing: "0.05em" }}>
              Validação Inteligente de Documentos
            </p>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "16px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/oea-logo.png" alt="OEA" style={{ height: "40px", width: "auto", opacity: 0.8 }} />
            <span style={{ fontSize: "10px", fontFamily: "monospace", color: "rgba(255,255,255,0.25)" }}>
              v{VERSION}
            </span>
            <Link href="/hub" style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)",
              textDecoration: "none", padding: "6px 12px", borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.12)" }}>
              ← Hub
            </Link>
          </div>
        </div>
        <div style={{ height: "1px", background: "linear-gradient(90deg,transparent,#4A9BAA,transparent)" }} />
      </header>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px" }}>

        {/* ── Upload panel ── */}
        {!result && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>

            {/* Left: modal + upload */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

              {/* Modal selector */}
              <div style={{ background: "white", borderRadius: "16px", padding: "24px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #e2e8f0" }}>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "#374151", margin: "0 0 12px" }}>
                  Modal de Transporte
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  {(["MARITIMO", "AEREO"] as const).map(m => (
                    <button key={m} onClick={() => setModal(m)}
                      style={{
                        padding: "14px", borderRadius: "12px", border: "2px solid",
                        borderColor: modal === m ? "#4A9BAA" : "#e2e8f0",
                        background: modal === m ? "rgba(74,155,170,0.08)" : "white",
                        cursor: "pointer", display: "flex", flexDirection: "column",
                        alignItems: "center", gap: "6px",
                      }}>
                      <span style={{ fontSize: "22px" }}>{m === "MARITIMO" ? "🚢" : "✈️"}</span>
                      <span style={{ fontSize: "12px", fontWeight: 600,
                        color: modal === m ? "#4A9BAA" : "#64748b" }}>
                        {m === "MARITIMO" ? "Marítimo" : "Aéreo"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Docs expected */}
              <div style={{ background: "white", borderRadius: "16px", padding: "20px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #e2e8f0" }}>
                <p style={{ fontSize: "12px", fontWeight: 600, color: "#64748b",
                  margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Documentos esperados — {modal === "MARITIMO" ? "Marítimo" : "Aéreo"}
                </p>
                {(modal === "MARITIMO"
                  ? [["MBL", "Master Bill of Lading"], ["HBL", "House Bill of Lading"],
                     ["INVOICE", "Fatura Comercial"], ["PACKING LIST", "Romaneio (opcional)"]]
                  : [["MAWB", "Master Air Waybill"], ["HAWB", "House Air Waybill"],
                     ["INVOICE", "Fatura Comercial"], ["PACKING LIST", "Romaneio (opcional)"]]
                ).map(([code, label]) => (
                  <div key={code} style={{ display: "flex", gap: "10px", alignItems: "center",
                    padding: "6px 0", borderBottom: "1px solid #f1f5f9" }}>
                    <span style={{ fontFamily: "monospace", fontSize: "10px", fontWeight: 700,
                      background: "#4A9BAA", color: "white", padding: "1px 6px",
                      borderRadius: "4px", whiteSpace: "nowrap" }}>{code}</span>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: file upload */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ background: "white", borderRadius: "16px", padding: "24px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #e2e8f0",
                flex: 1, display: "flex", flexDirection: "column" }}>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "#374151", margin: "0 0 14px" }}>
                  Documentos PDF
                </p>

                {/* Drop zone */}
                <div
                  onClick={() => inputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
                  style={{
                    border: `2px dashed ${dragging ? "#4A9BAA" : "#cbd5e1"}`,
                    borderRadius: "12px", padding: "32px 20px",
                    textAlign: "center", cursor: "pointer",
                    background: dragging ? "rgba(74,155,170,0.05)" : "#f8fafc",
                    transition: "all .2s",
                    marginBottom: "16px",
                  }}>
                  <div style={{ fontSize: "28px", marginBottom: "8px" }}>📄</div>
                  <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 4px" }}>
                    Arraste os PDFs aqui ou clique para selecionar
                  </p>
                  <p style={{ fontSize: "11px", color: "#94a3b8", margin: 0 }}>
                    Aceita múltiplos arquivos PDF
                  </p>
                  <input ref={inputRef} type="file" accept=".pdf,application/pdf"
                    multiple style={{ display: "none" }}
                    onChange={e => addFiles(e.target.files)} />
                </div>

                {/* File list */}
                {files.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" }}>
                    {files.map(f => (
                      <div key={f.name} style={{ display: "flex", alignItems: "center", gap: "8px",
                        padding: "8px 10px", background: "#f8fafc", borderRadius: "8px",
                        border: "1px solid #e2e8f0" }}>
                        <span style={{ fontSize: "14px" }}>📄</span>
                        <span style={{ fontSize: "12px", color: "#374151", flex: 1,
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {f.name}
                        </span>
                        <span style={{ fontSize: "11px", color: "#94a3b8", whiteSpace: "nowrap" }}>
                          {(f.size / 1024).toFixed(0)} KB
                        </span>
                        <button onClick={() => removeFile(f.name)}
                          style={{ background: "none", border: "none", cursor: "pointer",
                            color: "#94a3b8", fontSize: "16px", padding: "0 2px", lineHeight: 1 }}>
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {error && (
                  <div style={{ padding: "12px", background: "#fee2e2", borderRadius: "8px",
                    marginBottom: "12px", fontSize: "13px", color: "#b91c1c" }}>
                    {error}
                  </div>
                )}

                <button
                  onClick={analyze}
                  disabled={loading || files.length === 0}
                  style={{
                    padding: "14px", borderRadius: "12px", border: "none", cursor: "pointer",
                    background: files.length === 0
                      ? "#e2e8f0"
                      : "linear-gradient(135deg, #4A9BAA 0%, #3d8594 100%)",
                    color: files.length === 0 ? "#94a3b8" : "white",
                    fontSize: "14px", fontWeight: 600,
                    boxShadow: files.length > 0 ? "0 4px 16px rgba(74,155,170,0.35)" : "none",
                    transition: "all .2s",
                  }}>
                  {loading ? "Analisando documentos…" : `🔍 Analisar ${files.length > 0 ? `(${files.length} arquivo${files.length > 1 ? "s" : ""})` : ""}`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%",
              border: "3px solid #e2e8f0", borderTopColor: "#4A9BAA",
              animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
            <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
              Claude está analisando os documentos…
            </p>
            <p style={{ color: "#94a3b8", fontSize: "12px", margin: "4px 0 0" }}>
              Isso pode levar entre 30 e 90 segundos
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* ── Results ── */}
        {result && !loading && (
          <div>
            {/* Overall status */}
            <div style={{ padding: "20px 24px", borderRadius: "16px", marginBottom: "24px",
              background: overall!.bg, border: `2px solid ${overall!.border}`,
              display: "flex", alignItems: "center", gap: "16px" }}>
              <span style={{ fontSize: "28px", fontWeight: 900, color: overall!.border,
                lineHeight: 1 }}>{overall!.icon}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "18px", fontWeight: 700, color: overall!.text, margin: 0 }}>
                  {result.overallStatus}
                </p>
                <p style={{ fontSize: "12px", color: overall!.text, opacity: 0.8, margin: "2px 0 0" }}>
                  Modal: {result.modal} · {result.documents.length} documento{result.documents.length > 1 ? "s" : ""} analisado{result.documents.length > 1 ? "s" : ""}
                </p>
              </div>
              {/* Counters */}
              <div style={{ display: "flex", gap: "20px" }}>
                {[
                  { label: "OK", value: result.summary.okCount, color: "#16a34a" },
                  { label: "Discrepante", value: result.summary.discrepantCount, color: "#dc2626" },
                  { label: "Não localizado", value: result.summary.notFoundCount, color: "#d97706" },
                  { label: "Div. Esperada", value: result.summary.divergenceCount, color: "#0891b2" },
                ].map(c => (
                  <div key={c.label} style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "22px", fontWeight: 700, color: c.color, margin: 0, lineHeight: 1 }}>
                      {c.value}
                    </p>
                    <p style={{ fontSize: "10px", color: "#64748b", margin: "2px 0 0" }}>{c.label}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => { setResult(null); setFiles([]); setError(""); }}
                style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid",
                  borderColor: overall!.border, background: "white", color: overall!.text,
                  fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
                Nova Análise
              </button>
            </div>

            {/* Documents */}
            <div style={{ background: "white", borderRadius: "16px", padding: "20px",
              marginBottom: "20px", border: "1px solid #e2e8f0" }}>
              <p style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", margin: "0 0 12px",
                textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Documentos Identificados
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {result.documents.map((d, i) => (
                  <DocBadge key={i} type={d.type} reference={d.reference} legibility={d.legibility} />
                ))}
              </div>
            </div>

            {/* Comparison pairs */}
            <div style={{ background: "white", borderRadius: "16px", padding: "20px",
              marginBottom: "20px", border: "1px solid #e2e8f0" }}>
              <p style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", margin: "0 0 16px",
                textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Comparações por Par
              </p>
              {result.comparisons.map((p, i) => (
                <PairTable key={i} pair={p.pair} fields={p.fields} />
              ))}
            </div>

            {/* Consolidation */}
            {result.consolidation && (
              <div style={{ background: "white", borderRadius: "16px", padding: "20px",
                border: "1px solid #e2e8f0" }}>
                <p style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", margin: "0 0 16px",
                  textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Consolidação
                </p>
                <ConsolidationTable consolidation={result.consolidation} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
