"use client";

import Link from "next/link";

const VERSION = "26.06.19";

const OPERACOES = [
  {
    icon: "🧠",
    color: "#4A9BAA",
    glow: "rgba(74,155,170,0.18)",
    name: "Conferente Pre-Alert",
    desc: "Validação automática de documentos de embarque contra o pré-alerta.",
    href: "https://conferente-prealert-fm8verbpwcnnn4eyhhrsbe.streamlit.app",
    external: true,
    tag: "IA",
  },
  {
    icon: "📋",
    color: "#5b6fd4",
    glow: "rgba(91,111,212,0.18)",
    name: "Verificador CE Mercante",
    desc: "Conferência completa de CE Mercante contra o Bill of Lading.",
    href: "https://ce-mercante-verifier.vercel.app",
    external: true,
    tag: "IA",
  },
  {
    icon: "🚢",
    color: "#0891b2",
    glow: "rgba(8,145,178,0.18)",
    name: "Gerador de Instruções de Embarque",
    desc: "Preenchimento inteligente de conhecimento de embarque via IA.",
    href: "/admin",
    external: false,
    tag: "IA",
  },
];

const COMERCIAL = [
  {
    icon: "💰",
    color: "#059669",
    glow: "rgba(5,150,105,0.18)",
    name: "Comparador de Fretes",
    desc: "Análise e ranking automático de cotações de frete internacional.",
    href: "https://brasporto-fretes.vercel.app",
    external: true,
    tag: null,
  },
  {
    icon: "🔗",
    color: "#7c3aed",
    glow: "rgba(124,58,237,0.18)",
    name: "Portal do Exportador",
    desc: "Acesso ao portal do cliente via link de embarque.",
    href: "/cliente",
    external: false,
    tag: null,
  },
];

const FUTURO = [
  { icon: "📡", name: "Athena Tracking", desc: "Rastreamento inteligente de embarques em tempo real." },
  { icon: "⚖️", name: "Athena Compliance", desc: "Monitoramento de conformidade aduaneira e regulatória." },
  { icon: "🏅", name: "Athena OEA", desc: "Gestão e monitoramento da certificação OEA." },
  { icon: "📊", name: "Athena Analytics", desc: "Dashboards e insights operacionais consolidados." },
];

function Card({ icon, color, glow, name, desc, href, external, tag }: {
  icon: string; color: string; glow: string; name: string;
  desc: string; href: string; external: boolean; tag: string | null;
}) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
      style={{
        background: "rgba(255,255,255,0.93)",
        borderColor: "rgba(0,43,56,0.10)",
        backdropFilter: "blur(16px)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = color;
        (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px ${glow}, 0 2px 8px rgba(0,0,0,0.07)`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,43,56,0.10)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.07)";
      }}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />

      <div className="p-6 flex flex-col h-full gap-4">
        <div className="flex items-start justify-between">
          <div className="text-3xl">{icon}</div>
          {tag && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border"
              style={{ borderColor: color, color }}>
              {tag}
            </span>
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-gray-800 font-semibold text-sm mb-2 leading-snug">{name}</h3>
          <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
        </div>
        {external ? (
          <a href={href} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium transition-all border"
            style={{ borderColor: color, color }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = glow; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            Acessar ↗
          </a>
        ) : (
          <Link href={href}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium transition-all border"
            style={{ borderColor: color, color }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = glow; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            Acessar →
          </Link>
        )}
      </div>
    </div>
  );
}

function SectionLabel({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="text-base">{icon}</span>
      <span className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: "#2085a1" }}>{label}</span>
      <div className="flex-1 h-px" style={{ background: "rgba(0,43,56,0.12)" }} />
    </div>
  );
}

export default function HubPage() {
  return (
    <div className="relative min-h-screen" style={{
      backgroundImage: "url('/athena-brasporto.png')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      backgroundColor: "#f8fafc",
    }}>

      {/* Header */}
      <header className="sticky top-0 z-20 border-b"
        style={{ background: "rgba(0,28,38,0.92)", backdropFilter: "blur(20px)", borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="max-w-7xl mx-auto px-8 py-3.5 flex items-center gap-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brasporto-logo.png" alt="Brasporto"
            className="h-14 w-auto object-contain flex-shrink-0"
            style={{ filter: "brightness(0) invert(1)", maxWidth: "180px", opacity: 0.9 }} />
          <div className="w-px h-7 flex-shrink-0" style={{ background: "rgba(255,255,255,0.1)" }} />
          <div className="flex-shrink-0">
            <p className="text-sm font-semibold text-white leading-tight tracking-wide">Portal Athena</p>
            <p className="text-[11px] tracking-wider" style={{ color: "#4A9BAA" }}>Central de Aplicações</p>
          </div>
          <div className="ml-auto flex items-center gap-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/oea-logo.png" alt="OEA" className="h-14 w-auto object-contain opacity-80" />
            <span className="text-[11px] font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>v{VERSION}</span>
            <button
              onClick={async () => { await fetch("/api/auth", { method: "DELETE" }); window.location.href = "/"; }}
              className="text-xs px-3 py-1.5 rounded-lg border transition-colors"
              style={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.5)" }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(239,68,68,0.6)";
                (e.currentTarget as HTMLElement).style.color = "rgb(239,68,68)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.15)";
                (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)";
              }}
            >
              Sair
            </button>
          </div>
        </div>
        <div className="h-px" style={{ background: "linear-gradient(90deg,transparent,#4A9BAA,transparent)" }} />
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-8 py-10 space-y-12">

        {/* Operações */}
        <section>
          <SectionLabel icon="⚙️" label="Operações" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {OPERACOES.map(s => <Card key={s.name} {...s} />)}
          </div>
        </section>

        {/* Comercial */}
        <section>
          <SectionLabel icon="💼" label="Comercial & Clientes" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {COMERCIAL.map(s => <Card key={s.name} {...s} />)}
          </div>
        </section>

        {/* Em Desenvolvimento */}
        <section>
          <SectionLabel icon="🔭" label="Em Desenvolvimento" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FUTURO.map(({ icon, name, desc }) => (
              <div key={name} className="rounded-2xl border p-5"
                style={{
                  background: "rgba(255,255,255,0.75)",
                  borderColor: "rgba(0,43,56,0.08)",
                  backdropFilter: "blur(12px)",
                  opacity: 0.65,
                }}>
                <div className="text-2xl mb-3">{icon}</div>
                <p className="text-xs font-semibold mb-1" style={{ color: "rgba(0,43,56,0.55)" }}>{name}</p>
                <p className="text-[10px] leading-relaxed mb-3" style={{ color: "rgba(0,43,56,0.35)" }}>{desc}</p>
                <span className="text-[9px] px-2 py-0.5 rounded-full border font-mono tracking-wider"
                  style={{ borderColor: "rgba(0,43,56,0.15)", color: "rgba(0,43,56,0.35)" }}>
                  EM BREVE
                </span>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 border-t" style={{ borderColor: "rgba(0,43,56,0.08)" }}>
        <p className="text-[10px] font-mono tracking-widest uppercase" style={{ color: "rgba(0,43,56,0.30)" }}>
          Brasporto International Logistics · Portal Athena v{VERSION} · {new Date().getFullYear()}
        </p>
      </footer>

    </div>
  );
}
