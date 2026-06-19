"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const VERSION = "26.06.18";

export default function ClienteAcessoPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [error, setError] = useState("");

  function handleAcesso(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Aceita URL completa (ex: https://site.com/portal/TOKEN) ou apenas o token
    const match = token.trim().match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
    if (!match) {
      setError("Link ou código inválido. Use o link enviado pela Brasporto.");
      return;
    }
    router.push(`/portal/${match[1]}`);
  }

  return (
    <div className="min-h-screen" style={{
      backgroundImage: "url(/port-bg.png)",
      backgroundSize: "cover",
      backgroundAttachment: "fixed",
      backgroundPosition: "center",
    }}>
      <div className="min-h-screen" style={{ background: "rgba(240,248,251,0.93)" }}>

        {/* HEADER */}
        <header className="sticky top-0 z-20 shadow-lg" style={{ background: "#002b38" }}>
          <div className="max-w-5xl mx-auto px-8 py-3.5 flex items-center gap-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brasporto-logo.png" alt="Brasporto"
              className="h-16 w-auto object-contain flex-shrink-0"
              style={{ filter: "brightness(0) invert(1)", maxWidth: "240px" }} />
            <div className="w-px h-8 flex-shrink-0" style={{ background: "rgba(255,255,255,0.2)" }} />
            <div className="flex-shrink-0">
              <p className="text-sm font-semibold text-white leading-tight">Portal do Cliente</p>
              <p className="text-[11px]" style={{ color: "#7dd3e8" }}>Acesso por link de embarque</p>
            </div>
            <div className="ml-auto flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/oea-logo.png" alt="OEA" className="h-10 w-auto object-contain" />
              <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.4)" }}>v{VERSION}</span>
            </div>
          </div>
          <div className="h-0.5" style={{ background: "linear-gradient(90deg,rgba(74,155,170,0.3),#4A9BAA,rgba(74,155,170,0.3))" }} />
        </header>

        <div className="flex items-center justify-center min-h-[calc(100vh-72px)] px-6 py-12">
          <div className="max-w-md w-full">

            <div className="text-center mb-8">
              <div className="text-5xl mb-4">📋</div>
              <h1 className="text-xl font-semibold text-gray-800 mb-2">Acesso ao Portal do Cliente</h1>
              <p className="text-sm text-gray-500">Cole abaixo o link ou código enviado pela Brasporto</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              <form onSubmit={handleAcesso} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Link ou código de acesso</label>
                  <input
                    type="text"
                    value={token}
                    onChange={e => setToken(e.target.value)}
                    placeholder="https://... ou cole o código aqui"
                    autoFocus
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4A9BAA] focus:border-transparent"
                  />
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <button
                  type="submit"
                  disabled={!token.trim()}
                  className="w-full py-3 text-white rounded-xl font-medium text-sm transition-all disabled:opacity-40"
                  style={{ background: "#4A9BAA" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#3d8594"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#4A9BAA"; }}
                >
                  Acessar Meu Embarque
                </button>
              </form>
            </div>

            <div className="text-center mt-6">
              <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition">
                ← Voltar ao início
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
