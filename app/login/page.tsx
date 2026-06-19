"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const VERSION = "26.06.19";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Senha incorreta.");
        return;
      }
      router.push("/admin");
    } catch {
      setError("Erro ao conectar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{
      backgroundImage: "url('/athena-bg.png')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundColor: "#001829",
    }}>

      {/* Overlay suave */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "rgba(0,24,41,0.45)" }} />

      <div className="relative z-10 w-full max-w-xs">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brasporto-logo.png" alt="Brasporto"
            className="h-14 w-auto object-contain mb-3"
            style={{ filter: "brightness(0) invert(1)" }} />
          <p className="text-xs tracking-widest uppercase text-white/60">Gerador de Instruções de Embarque</p>
          <span className="text-[10px] font-mono mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>v{VERSION}</span>
        </div>

        {/* Card */}
        <div className="rounded-2xl shadow-2xl p-8" style={{
          background: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(20px)",
        }}>
          <h2 className="text-base font-semibold text-gray-800 mb-5 text-center">Acesso restrito</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Senha</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoFocus
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ "--tw-ring-color": "#4A9BAA" } as React.CSSProperties}
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-3 text-white rounded-xl font-medium text-sm transition-all disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, #4A9BAA 0%, #3d8594 100%)" }}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-gray-100 text-center">
            <Link href="/hub" className="text-xs text-gray-400 hover:text-gray-600 transition">
              ← Voltar ao Portal
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
