"use client";

import Link from "next/link";

const VERSION = "26.06.19";

const OPERACOES = [
  {
    icon: "🧠",
    color: "#4A9BAA",
    glow: "rgba(74,155,170,0.25)",
    name: "Conferente Pre-Alert",
    desc: "Validação automática de documentos de embarque contra o pré-alerta.",
    href: "https://conferente-prealert-fm8verbpwcnnn4eyhhrsbe.streamlit.app",
    external: true,
    tag: "IA",
  },
  {
    icon: "📋",
    color: "#818cf8",
    glow: "rgba(129,140,248,0.25)",
    name: "Verificador CE Mercante",
    desc: "Conferência completa de CE Mercante contra o Bill of Lading.",
    href: "https://ce-mercante-verifier.vercel.app",
    external: true,
    tag: "IA",
  },
  {
    icon: "🚢",
    color: "#22d3ee",
    glow: "rgba(34,211,238,0.25)",
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
    color: "#34d399",
    glow: "rgba(52,211,153,0.25)",
    name: "Comparador de Fretes",
    desc: "Análise e ranking automático de cotações de frete internacional.",
    href: "https://brasporto-fretes.vercel.app",
    external: true,
    tag: null,
  },
  {
    icon: "🔗",
    color: "#a78bfa",
    glow: "rgba(167,139,250,0.25)",
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

const INSIGHTS = [
  { label: "Pre-Alerts Conferidos", icon: "🧠" },
  { label: "CEs Analisados", icon: "📋" },
  { label: "BLs Gerados", icon: "🚢" },
  { label: "Cotações Comparadas", icon: "💰" },
];

function Card({ icon, color, glow, name, desc, href, external, tag }: {
  icon: string; color: string; glow: string; name: string;
  desc: string; href: string; external: boolean; tag: string | null;
}) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl border transition-all duration-300
                 hover:scale-[1.02] hover:-translate-y-1"
      style={{
        background: "rgba(255,255,255,0.04)",
        borderColor: "rgba(255,255,255,0.08)",
        backdropFilter: "blur(16px)",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = color;
        (e.currentTarget as HTMLElement).style.boxShadow = `0 0 32px ${glow}, inset 0 0 32px ${glow.replace('0.25','0.05')}`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
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
          <h3 className="text-white font-semibold text-sm mb-2 leading-snug">{name}</h3>
          <p className="text-white/40 text-xs leading-relaxed">{desc}</p>
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
      <span className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: "#4A9BAA" }}>{label}</span>
      <div className="flex-1 h-px" style={{ background: "rgba(74,155,170,0.2)" }} />
    </div>
  );
}

export default function HubPage() {
  return (
    <div className="relative min-h-screen">

      {/* Athena como marca d'água — sem zoom, imagem completa */}
      <div className="fixed inset-0 pointer-events-none"
        style={{ background: "linear-gradient(135deg, #002436 0%, #003350 50%, #002436 100%)" }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/athena-bg.png" alt=""
        className="fixed inset-0 w-full h-full pointer-events-none select-none"
        style={{ opacity: 0.10, objectFit: "contain", objectPosition: "center" }} />

      {/* Header */}
      <header className="sticky top-0 z-20 border-b"
        style={{ background: "rgba(0,30,55,0.75)", backdropFilter: "blur(20px)", borderColor: "rgba(255,255,255,0.08)" }}>
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
              style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(239,68,68,0.5)";
                (e.currentTarget as HTMLElement).style.color = "rgb(239,68,68)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)";
                (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)";
              }}
            >
              Sair
            </button>
          </div>
        </div>
        <div className="h-px" style={{ background: "linear-gradient(90deg,transparent,#4A9BAA,transparent)" }} />
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-8 py-10 space-y-12">

        {/* Athena Insights */}
        <section>
          <SectionLabel icon="✨" label="Athena Insights" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {INSIGHTS.map(({ label, icon }) => (
              <div key={label} className="rounded-2xl border p-5 text-center"
                style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.06)", backdropFilter: "blur(12px)" }}>
                <p className="text-3xl mb-2">{icon}</p>
                <p className="text-2xl font-semibold mb-1" style={{ color: "rgba(255,255,255,0.15)" }}>—</p>
                <p className="text-[10px] tracking-wide uppercase" style={{ color: "rgba(255,255,255,0.3)" }}>{label}</p>
              </div>
            ))}
          </div>
        </section>

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
                style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.05)", backdropFilter: "blur(12px)", opacity: 0.5 }}>
                <div className="text-2xl mb-3">{icon}</div>
                <p className="text-xs font-semibold text-white/50 mb-1">{name}</p>
                <p className="text-[10px] text-white/25 leading-relaxed mb-3">{desc}</p>
                <span className="text-[9px] px-2 py-0.5 rounded-full border border-white/10 text-white/30 font-mono tracking-wider">
                  EM BREVE
                </span>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 border-t" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
        <p className="text-[10px] font-mono tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.2)" }}>
          Brasporto International Logistics · Portal Athena v{VERSION} · {new Date().getFullYear()}
        </p>
      </footer>

    </div>
  );
}
