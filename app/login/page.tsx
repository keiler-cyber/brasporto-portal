"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const VERSION = "26.06.18";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
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
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Credenciais inválidas.");
        return;
      }
      router.push("/dashboard");
    } catch {
      setError("Erro ao conectar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-8 overflow-hidden">

      {/* Fundo porto */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/port-bg.png')" }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(0,31,43,.93) 0%, rgba(0,61,77,.85) 55%, rgba(0,31,43,.75) 100%)" }} />

      <div className="relative z-10 max-w-sm w-full">

        {/* Logo */}
        <div className="mb-8 flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brasporto-logo.png"
            alt="Brasporto"
            className="h-20 w-auto object-contain mb-4"
            style={{ filter: "brightness(0) invert(1)" }}
          />
          <p className="text-base font-medium" style={{ color: "#7dd3e8", letterSpacing: "0.04em" }}>
            Portal Inteligente de Instruções de Embarque
          </p>
          <span className="mt-1 text-xs font-mono" style={{ color: "rgba(125,211,232,0.5)" }}>v{VERSION}</span>
        </div>

        {/* Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Acesso Brasporto</h2>
          <p className="text-sm text-gray-400 mb-6">Entre com suas credenciais para continuar</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@brasporto.com"
                autoFocus
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4A9BAA] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Senha</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4A9BAA] focus:border-transparent"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-3 text-white rounded-xl font-medium text-sm transition-all disabled:opacity-50 mt-2"
              style={{ background: "#4A9BAA" }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.background = "#3d8594"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#4A9BAA"; }}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 transition">
              ← Voltar ao início
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs" style={{ color: "rgba(125,211,232,0.6)" }}>
          © 2026 Brasporto Logística e Assessoria Aduaneira
        </p>
      </div>
    </div>
  );
}
