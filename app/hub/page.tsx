"use client";

import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const VERSION = "26.06.19";

const OPERACOES = [
  {
    icon: "🧠",
    color: "#4A9BAA",
    glow: "rgba(74,155,170,0.20)",
    name: "Conferente Pre-Alert",
    desc: "Validação automática de documentos de embarque contra o pré-alerta.",
    href: "/conferente",
    external: false,
    tag: "IA",
  },
  {
    icon: "📋",
    color: "#5b6fd4",
    glow: "rgba(91,111,212,0.20)",
    name: "Verificador CE Mercante",
    desc: "Conferência completa de CE Mercante contra o Bill of Lading.",
    href: "https://ce-mercante-verifier.vercel.app",
    external: true,
    tag: "IA",
  },
  {
    icon: "🚢",
    color: "#0891b2",
    glow: "rgba(8,145,178,0.20)",
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
    glow: "rgba(5,150,105,0.20)",
    name: "Comparador de Fretes",
    desc: "Análise e ranking automático de cotações de frete internacional.",
    href: "https://brasporto-fretes.vercel.app",
    external: true,
    tag: null,
  },
  {
    icon: "🔗",
    color: "#7c3aed",
    glow: "rgba(124,58,237,0.20)",
    name: "Portal do Exportador",
    desc: "Acesso ao portal do cliente via link de embarque.",
    href: "/cliente",
    external: false,
    tag: null,
  },
];

function Card({ icon, color, glow, name, desc, href, external, tag }: {
  icon: string; color: string; glow: string; name: string;
  desc: string; href: string; external: boolean; tag: string | null;
}) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
      style={{
        background: "rgba(255,255,255,0.88)",
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
      <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />

      <div className="p-5 flex flex-col h-full gap-3">
        <div className="flex items-start justify-between">
          <div className="text-2xl">{icon}</div>
          {tag && (
            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full border"
              style={{ borderColor: color, color }}>
              {tag}
            </span>
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-gray-800 font-semibold text-sm mb-1 leading-snug">{name}</h3>
          <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
        </div>
        {external ? (
          <a href={href} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-medium transition-all border"
            style={{ borderColor: color, color }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = glow; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
            Acessar ↗
          </a>
        ) : (
          <Link href={href}
            className="flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-medium transition-all border"
            style={{ borderColor: color, color }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = glow; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
            Acessar →
          </Link>
        )}
      </div>
    </div>
  );
}

function SectionLabel({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-sm">{icon}</span>
      <span className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: "#2085a1" }}>{label}</span>
      <div className="flex-1 h-px" style={{ background: "rgba(0,43,56,0.12)" }} />
    </div>
  );
}

export default function HubPage() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">

      {/* Fundo Athena — opacidade 30%, fixo */}
      <div className="fixed inset-0 z-0 pointer-events-none" style={{
        backgroundImage: "url('/athena-brasporto.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        opacity: 0.30,
      }} />

      {/* Header */}
      <header className="relative z-20 shrink-0 border-b"
        style={{ background: "rgba(0,28,38,0.92)", backdropFilter: "blur(20px)", borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="max-w-7xl mx-auto px-8 py-3 flex items-center gap-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brasporto-logo.png" alt="Brasporto"
            className="h-12 w-auto object-contain flex-shrink-0"
            style={{ filter: "brightness(0) invert(1)", maxWidth: "160px", opacity: 0.9 }} />
          <div className="w-px h-7 flex-shrink-0" style={{ background: "rgba(255,255,255,0.1)" }} />
          <div className="flex-shrink-0">
            <p className="text-sm font-semibold text-white leading-tight">Portal Athena</p>
            <p className="text-[11px] tracking-wider" style={{ color: "#4A9BAA" }}>Central de Aplicações</p>
          </div>
          <div className="ml-auto flex items-center gap-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/oea-logo.png" alt="OEA" className="h-12 w-auto object-contain opacity-80" />
            <span className="text-[11px] font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>v{VERSION}</span>
            <button
              onClick={async () => { if (auth) await signOut(auth); await fetch("/api/auth", { method: "DELETE" }); window.location.href = "/login"; }}
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

      {/* Conteúdo — tudo visível sem scroll */}
      <div className="relative z-10 flex-1 overflow-hidden flex flex-col max-w-7xl mx-auto w-full px-8 py-6 gap-6">

        {/* Operações */}
        <section className="flex-1 flex flex-col min-h-0">
          <SectionLabel icon="⚙️" label="Operações" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 min-h-0">
            {OPERACOES.map(s => <Card key={s.name} {...s} />)}
          </div>
        </section>

        {/* Comercial */}
        <section className="flex-1 flex flex-col min-h-0">
          <SectionLabel icon="💼" label="Comercial & Clientes" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 min-h-0">
            {COMERCIAL.map(s => <Card key={s.name} {...s} />)}
          </div>
        </section>

      </div>

      {/* Footer */}
      <footer className="relative z-10 shrink-0 text-center py-3 border-t" style={{ borderColor: "rgba(0,43,56,0.08)" }}>
        <p className="text-[10px] font-mono tracking-widest uppercase" style={{ color: "rgba(0,43,56,0.30)" }}>
          Brasporto International Logistics · Portal Athena v{VERSION} · {new Date().getFullYear()}
        </p>
      </footer>

    </div>
  );
}
