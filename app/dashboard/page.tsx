"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ShipmentSummary {
  id: string;
  token: string;
  status: string;
  clientName: string | null;
  clientEmail: string | null;
  bookingNumber: string | null;
  shipperName: string | null;
  portOrigin: string | null;
  portDestination: string | null;
  createdAt: string;
  updatedAt: string;
  documents: { id: string; fileType: string }[];
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Aguardando Docs",
  DOCS_UPLOADED: "Docs Recebidos",
  EXTRACTING: "Extraindo...",
  REVIEW: "Em Revisão",
  CLIENT_APPROVED: "Aprovado pelo Cliente",
  BRASPORTO_REVIEW: "Em Análise",
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

const VERSION = "26.06.18";

export default function DashboardPage() {
  const [shipments, setShipments] = useState<ShipmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/shipments")
      .then((r) => r.json())
      .then((data) => { setShipments(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = filter === "ALL" ? shipments : shipments.filter((s) => s.status === filter);

  const stats = {
    total: shipments.length,
    pending: shipments.filter((s) => ["PENDING", "DOCS_UPLOADED"].includes(s.status)).length,
    review: shipments.filter((s) => s.status === "CLIENT_APPROVED").length,
    approved: shipments.filter((s) => s.status === "APPROVED").length,
  };

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
            <img
              src="/brasporto-logo.png"
              alt="Brasporto"
              className="h-16 w-auto object-contain flex-shrink-0"
              style={{ filter: "brightness(0) invert(1)", maxWidth: "240px" }}
            />
            <div className="w-px h-8 flex-shrink-0" style={{ background: "rgba(255,255,255,0.2)" }} />
            <div className="flex-shrink-0">
              <p className="text-sm font-semibold text-white leading-tight">Portal de Embarques</p>
              <p className="text-[11px]" style={{ color: "#7dd3e8" }}>Instruções de Embarque · Bill of Lading</p>
            </div>
            <div className="ml-auto flex items-center gap-4">
              <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.4)" }}>v{VERSION}</span>
              <button
                onClick={async () => { await fetch("/api/auth", { method: "DELETE" }); window.location.href = "/"; }}
                className="text-sm transition-colors"
                style={{ color: "rgba(255,255,255,0.45)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#f87171"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.45)"; }}
                title="Sair"
              >
                Sair
              </button>
              <Link
                href="/admin"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white transition-all"
                style={{ background: "rgba(74,155,170,0.35)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(74,155,170,0.55)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(74,155,170,0.35)"; }}
              >
                + Novo Embarque
              </Link>
            </div>
          </div>
          <div className="h-0.5" style={{ background: "linear-gradient(90deg,rgba(74,155,170,0.3),#4A9BAA,rgba(74,155,170,0.3))" }} />
        </header>

        <div className="max-w-7xl mx-auto px-8 py-8 space-y-6">

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Total", value: stats.total, color: "text-gray-800" },
              { label: "Aguardando Ação", value: stats.pending, color: "text-[#4A9BAA]" },
              { label: "Aprovados pelo Cliente", value: stats.review, color: "text-indigo-700" },
              { label: "Finalizados", value: stats.approved, color: "text-green-700" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
                <div className={`text-3xl font-semibold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            {["ALL", "PENDING", "CLIENT_APPROVED", "REVIEW", "APPROVED", "REJECTED"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                style={filter === f
                  ? { background: "#002b38", color: "white" }
                  : { background: "white", color: "#4b5563", border: "1px solid #e5e7eb" }
                }
              >
                {f === "ALL" ? "Todos" : STATUS_LABELS[f] ?? f}
              </button>
            ))}
          </div>

          {/* Table */}
          {loading ? (
            <div className="text-center py-16 text-gray-400 animate-pulse">Carregando embarques...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-4xl mb-3">📭</div>
              <p>Nenhum embarque encontrado.</p>
              <Link href="/admin" className="mt-3 inline-block text-sm" style={{ color: "#4A9BAA" }}>
                Criar novo embarque
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Cliente / Exportador</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Booking</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Rota</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Docs</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="font-medium text-gray-800">{s.clientName ?? "—"}</div>
                        <div className="text-xs text-gray-400">{s.shipperName ?? s.clientEmail ?? s.id.slice(0, 8)}</div>
                      </td>
                      <td className="px-5 py-3 text-gray-600 hidden sm:table-cell">{s.bookingNumber ?? "—"}</td>
                      <td className="px-5 py-3 text-gray-500 text-xs hidden md:table-cell">
                        {s.portOrigin && s.portDestination ? `${s.portOrigin} → ${s.portDestination}` : "—"}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[s.status] ?? "bg-gray-100 text-gray-600"}`}>
                          {STATUS_LABELS[s.status] ?? s.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-500 hidden sm:table-cell">{s.documents.length}</td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <Link
                            href={`/dashboard/${s.id}`}
                            className="text-xs text-white px-3 py-1.5 rounded-lg transition-colors"
                            style={{ background: "#4A9BAA" }}
                          >
                            Abrir
                          </Link>
                          <button
                            onClick={() => navigator.clipboard.writeText(`${window.location.origin}/portal/${s.token}`)}
                            className="text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:border-gray-300 transition-colors"
                            title="Copiar link do portal"
                          >
                            🔗
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
