"use client";

import { useState, useRef } from "react";
import Link from "next/link";

const VERSION = "26.06.18";

export default function AdminPage() {
  const [form, setForm] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    operatorName: "",
    bookingNumber: "",
  });
  const [bookingFile, setBookingFile] = useState<File | null>(null);
  const [result, setResult] = useState<{ portalUrl: string; token: string; shipmentId: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [extractingPreview, setExtractingPreview] = useState(false);
  const [preview, setPreview] = useState<{ bookingNumber?: string | null; shipperName?: string | null } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (!bookingFile) {
      setError("Selecione o PDF do Booking antes de gerar o link.");
      return;
    }
    setLoading(true);
    setError("");

    setLoadingStep("Criando embarque...");
    const res = await fetch("/api/shipments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, bookingNumber: form.bookingNumber || undefined }),
    });

    if (!res.ok) {
      setError("Erro ao criar embarque.");
      setLoading(false);
      return;
    }

    const data = await res.json();
    const { shipment, portalUrl } = data;

    setLoadingStep("Extraindo dados do Booking com IA...");
    const fd = new FormData();
    fd.append("shipmentId", shipment.id);
    fd.append("file", bookingFile);

    const uploadRes = await fetch("/api/booking-upload", { method: "POST", body: fd });
    const uploadData = await uploadRes.json();

    if (!uploadRes.ok) {
      setError(`Erro ao processar booking: ${uploadData.error ?? "Falha desconhecida"}`);
      setLoading(false);
      return;
    }

    setResult({ portalUrl, token: shipment.token, shipmentId: shipment.id });
    setLoading(false);
    setLoadingStep("");
  };

  const fullUrl = result ? `${typeof window !== "undefined" ? window.location.origin : ""}${result.portalUrl}` : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputClass = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A9BAA]";

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
            <div className="flex-shrink-0">
              <p className="text-sm font-semibold text-white leading-tight">Novo Embarque</p>
              <p className="text-[11px]" style={{ color: "#7dd3e8" }}>Gerar link de portal para o exportador</p>
            </div>
            <div className="ml-auto">
              <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.4)" }}>v{VERSION}</span>
            </div>
          </div>
          <div className="h-0.5" style={{ background: "linear-gradient(90deg,rgba(74,155,170,0.3),#4A9BAA,rgba(74,155,170,0.3))" }} />
        </header>

        <div className="flex items-start justify-center px-8 py-10">
          <div className="w-full max-w-xl">

            {!result ? (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">Dados do Embarque</h2>
                  <p className="text-sm text-gray-500">Preencha os dados e anexe o Booking para gerar o link do portal do exportador.</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nome do Cliente / Exportador</label>
                  <input type="text" value={form.clientName} onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))}
                    placeholder="Ex: Indústria XYZ Ltda" className={inputClass} />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Email do Cliente</label>
                  <input type="email" value={form.clientEmail} onChange={(e) => setForm((f) => ({ ...f, clientEmail: e.target.value }))}
                    placeholder="exportador@empresa.com" className={inputClass} />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Telefone / WhatsApp</label>
                  <input type="text" value={form.clientPhone} onChange={(e) => setForm((f) => ({ ...f, clientPhone: e.target.value }))}
                    placeholder="+55 11 99999-9999" className={inputClass} />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Operador Brasporto</label>
                  <input type="text" value={form.operatorName} onChange={(e) => setForm((f) => ({ ...f, operatorName: e.target.value }))}
                    placeholder="Seu nome" className={inputClass} />
                </div>

                {/* Booking PDF */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Booking PDF <span className="text-red-500">*</span>
                    <span className="text-gray-400 font-normal ml-1">(IA extrai os dados automaticamente)</span>
                  </label>
                  <div
                    className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all select-none ${
                    bookingFile
                      ? "border-[#4A9BAA] bg-[#f0f9fb]"
                      : "border-gray-200 bg-gray-50 hover:border-[#4A9BAA] hover:bg-[#f0f9fb]"
                  }`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0] ?? null;
                        setBookingFile(file);
                        setError("");
                        setPreview(null);
                        if (file) {
                          setExtractingPreview(true);
                          try {
                            const fd = new FormData();
                            fd.append("file", file);
                            const res = await fetch("/api/booking-preview", { method: "POST", body: fd });
                            if (res.ok) {
                              const data = await res.json() as { bookingNumber?: string | null; shipperName?: string | null };
                              setPreview(data);
                              if (data.bookingNumber) setForm((f) => ({ ...f, bookingNumber: data.bookingNumber! }));
                              if (data.shipperName && !form.clientName) setForm((f) => ({ ...f, clientName: data.shipperName! }));
                            }
                          } catch { /* preview falhou */ }
                          finally { setExtractingPreview(false); }
                        }
                      }}
                    />
                    {bookingFile ? (
                      <div className="flex items-center justify-center gap-2">
                        <span style={{ color: "#4A9BAA" }} className="text-lg">✓</span>
                        <span className="text-sm font-medium" style={{ color: "#4A9BAA" }}>{bookingFile.name}</span>
                        <button
                          type="button"
                          onClick={(ev) => {
                            ev.stopPropagation();
                            setBookingFile(null);
                            setPreview(null);
                            setForm((f) => ({ ...f, bookingNumber: "", clientName: "" }));
                            if (fileInputRef.current) fileInputRef.current.value = "";
                          }}
                          className="text-gray-400 hover:text-red-500 text-xs ml-1"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(74,155,170,0.1)" }}>
                          <span className="text-lg">📋</span>
                        </div>
                        <p className="text-sm font-medium text-gray-700">Booking PDF</p>
                        <p className="text-[10px] text-gray-400">Clique ou arraste o arquivo</p>
                        <span className="mt-0.5 px-3 py-1 text-white rounded-lg text-[10px] font-medium" style={{ background: "#4A9BAA" }}>
                          Selecionar PDF
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Nº Booking */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Nº do Booking
                    {extractingPreview && <span className="ml-1 font-normal animate-pulse" style={{ color: "#4A9BAA" }}>— extraindo com IA...</span>}
                    {!extractingPreview && form.bookingNumber && <span className="ml-1 font-normal text-green-600">✓ extraído</span>}
                  </label>
                  <input
                    type="text"
                    value={form.bookingNumber}
                    onChange={(e) => setForm((f) => ({ ...f, bookingNumber: e.target.value }))}
                    placeholder={extractingPreview ? "Aguardando extração..." : "SS0626SP04311"}
                    disabled={extractingPreview}
                    className={`${inputClass} disabled:bg-gray-50 disabled:text-gray-400`}
                  />
                </div>

                {preview && (
                  <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 text-sm" style={{ color: "#003d4d" }}>
                    🤖 Extraído: <strong>{preview.bookingNumber}</strong>
                    {preview.shipperName && <> · {preview.shipperName}</>}
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !bookingFile}
                  className="w-full text-white py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  style={{ background: "#4A9BAA" }}
                  onMouseEnter={e => { if (!loading && bookingFile) (e.currentTarget as HTMLElement).style.background = "#3d8594"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#4A9BAA"; }}
                >
                  {loading ? <span className="animate-pulse">{loadingStep || "Processando..."}</span> : "🔗 Gerar Link de Portal"}
                </button>
              </form>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-6">
                <div className="text-center">
                  <div className="text-4xl mb-3">✅</div>
                  <h2 className="text-xl font-semibold text-gray-800">Link Gerado com Sucesso!</h2>
                  <p className="text-gray-500 text-sm mt-1">Copie e envie para o exportador.</p>
                </div>

                <div className="rounded-xl p-4" style={{ background: "rgba(240,248,251,0.8)", border: "1px solid #d1e9ed" }}>
                  <p className="text-xs text-gray-500 mb-2">Link do Portal do Cliente:</p>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={fullUrl}
                      className="flex-1 text-sm bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-700 font-mono"
                    />
                    <button
                      onClick={handleCopy}
                      className="text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                      style={{ background: "#4A9BAA" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#3d8594"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#4A9BAA"; }}
                    >
                      {copied ? "✓" : "Copiar"}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Link
                    href={result.portalUrl}
                    target="_blank"
                    className="flex-1 text-center bg-gray-100 text-gray-700 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-200 transition-colors"
                  >
                    Testar Portal ↗
                  </Link>
                  <button
                    onClick={() => {
                      setResult(null);
                      setForm({ clientName: "", clientEmail: "", clientPhone: "", operatorName: "", bookingNumber: "" });
                      setPreview(null);
                      setBookingFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="flex-1 text-white py-2.5 rounded-xl font-medium text-sm transition-colors"
                    style={{ background: "#4A9BAA" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#3d8594"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#4A9BAA"; }}
                  >
                    Novo Embarque
                  </button>
                </div>

                <Link href="/dashboard" className="block text-center text-sm transition" style={{ color: "#4A9BAA" }}>
                  Ver todos os embarques →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
