"use client";

import Link from "next/link";

const VERSION = "26.06.19";

const OPERACOES = [
  {
    icon: "🧠",
    color: "#4A9BAA",
    bg: "#f0f9fb",
    name: "Conferente Pre-Alert",
    desc: "Validação automática de documentos de embarque contra o pré-alerta.",
    href: "https://conferente-prealert-fm8verbpwcnnn4eyhhrsbe.streamlit.app",
    external: true,
  },
  {
    icon: "📋",
    color: "#6366f1",
    bg: "#f0f0ff",
    name: "Verificador CE Mercante",
    desc: "Conferência completa de CE Mercante contra o Bill of Lading.",
    href: "https://ce-mercante-verifier.vercel.app",
    external: true,
  },
  {
    icon: "🚢",
    color: "#0891b2",
    bg: "#e0f7fa",
    name: "Gerador de Instruções de Embarque",
    desc: "Preenchimento inteligente de conhecimento de embarque via IA.",
    href: "/admin",
    external: false,
  },
];

const COMERCIAL = [
  {
    icon: "💰",
    color: "#059669",
    bg: "#ecfdf5",
    name: "Comparador de Fretes",
    desc: "Análise e ranking automático de cotações de frete internacional.",
    href: "https://brasporto-fretes.vercel.app",
    external: true,
  },
  {
    icon: "🔗",
    color: "#7c3aed",
    bg: "#f5f3ff",
    name: "Portal do Exportador",
    desc: "Acesso ao portal do cliente via link de embarque.",
    href: "/cliente",
    external: false,
  },
];

const FUTURO = [
  { icon: "📡", name: "Athena Tracking", desc: "Rastreamento inteligente de embarques em tempo real." },
  { icon: "⚖️", name: "Athena Compliance", desc: "Monitoramento de conformidade aduaneira e regulatória." },
  { icon: "🏅", name: "Athena OEA", desc: "Gestão e monitoramento da certificação OEA." },
  { icon: "📊", name: "Athena Analytics", desc: "Dashboards e insights operacionais consolidados." },
];

const INSIGHTS = [
  { label: "Pre-Alerts Conferidos", value: "—" },
  { label: "CEs Analisados", value: "—" },
  { label: "BLs Gerados", value: "—" },
  { label: "Cotações Comparadas", value: "—" },
];

function SystemCard({ icon, color, bg, name, desc, href, external }: {
  icon: string; color: string; bg: string; name: string;
  desc: string; href: string; external: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4
                    hover:border-[#4A9BAA] hover:shadow-md transition-all group">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: bg }}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900 leading-snug">{name}</p>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">{desc}</p>
        </div>
      </div>
      {external ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto text-xs font-medium px-4 py-2 rounded-xl text-white text-center transition-colors"
          style={{ background: color }}
        >
          Acessar ↗
        </a>
      ) : (
        <Link
          href={href}
          className="mt-auto text-xs font-medium px-4 py-2 rounded-xl text-white text-center transition-colors"
          style={{ background: color }}
        >
          Acessar →
        </Link>
      )}
    </div>
  );
}

export default function HubPage() {
  return (
    <div className="min-h-screen bg-[#f4f6f9]">

      {/* Header */}
      <header className="sticky top-0 z-20 shadow-lg" style={{ background: "#002b38" }}>
        <div className="max-w-7xl mx-auto px-8 py-3.5 flex items-center gap-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brasporto-logo.png" alt="Brasporto"
            className="h-16 w-auto object-contain flex-shrink-0"
            style={{ filter: "brightness(0) invert(1)", maxWidth: "200px" }} />
          <div className="w-px h-8 flex-shrink-0" style={{ background: "rgba(255,255,255,0.2)" }} />
          <div className="flex-shrink-0">
            <p className="text-sm font-semibold text-white leading-tight">Portal Athena</p>
            <p className="text-[11px]" style={{ color: "#7dd3e8" }}>Central de Aplicações Brasporto</p>
          </div>
          <div className="ml-auto flex items-center gap-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/oea-logo.png" alt="OEA" className="h-16 w-auto object-contain" />
            <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.4)" }}>v{VERSION}</span>
          </div>
        </div>
        <div className="h-0.5" style={{ background: "linear-gradient(90deg,rgba(74,155,170,0.3),#4A9BAA,rgba(74,155,170,0.3))" }} />
      </header>

      <div className="max-w-7xl mx-auto px-8 py-10 space-y-10">

        {/* Athena Insights */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-lg">✨</span>
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Athena Insights</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#4A9BAA]/10 text-[#4A9BAA] font-medium">Em breve</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {INSIGHTS.map(({ label, value }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
                <p className="text-3xl font-semibold text-gray-300 mb-1">{value}</p>
                <p className="text-xs text-gray-400">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Operações */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-lg">⚙️</span>
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Operações</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {OPERACOES.map((s) => <SystemCard key={s.name} {...s} />)}
          </div>
        </section>

        {/* Comercial */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-lg">💼</span>
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Comercial & Clientes</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {COMERCIAL.map((s) => <SystemCard key={s.name} {...s} />)}
          </div>
        </section>

        {/* Em Breve */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-lg">🔭</span>
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Em Desenvolvimento</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FUTURO.map(({ icon, name, desc }) => (
              <div key={name} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 opacity-60">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-xl mb-3">
                  {icon}
                </div>
                <p className="text-sm font-semibold text-gray-400 mb-1">{name}</p>
                <p className="text-xs text-gray-300 leading-relaxed">{desc}</p>
                <span className="mt-3 inline-block text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 font-medium">
                  Em breve
                </span>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* Footer */}
      <footer className="text-center py-8 text-xs text-gray-400">
        Brasporto International Logistics · Portal Athena v{VERSION} · {new Date().getFullYear()}
      </footer>
    </div>
  );
}
