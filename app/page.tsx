"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
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
        setError("Senha incorreta.");
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

      {/* OEA — canto superior direito */}
      <div className="absolute top-5 right-6 z-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/oea-logo.png" alt="OEA" className="h-16 w-auto object-contain" />
      </div>

      {/* Conteúdo */}
      <div className="relative z-10 max-w-sm w-full text-center">

        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brasporto-logo.png"
            alt="Brasporto"
            className="h-20 w-auto object-contain mb-4"
            style={{ filter: "brightness(0) invert(1)" }}
          />
          <p className="text-lg font-medium" style={{ color: "#7dd3e8", letterSpacing: "0.04em" }}>
            Portal Inteligente de Instruções de Embarque
          </p>
        </div>

        {/* Card login */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Acesso Brasporto</h2>
          <p className="text-sm text-gray-400 mb-6">Insira a senha para acessar o painel</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Senha"
              autoFocus
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4A9BAA] focus:border-transparent"
            />

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-3 text-white rounded-xl font-medium text-sm transition-all disabled:opacity-50"
              style={{ background: "#4A9BAA" }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.background = "#3d8594"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#4A9BAA"; }}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Cliente? Acesse pelo link enviado pela Brasporto.
            </p>
          </div>
        </div>

        <p className="mt-6 text-xs" style={{ color: "rgba(125,211,232,0.6)" }}>
          © 2026 Brasporto Logística e Assessoria Aduaneira — Operador Econômico Autorizado
        </p>
      </div>
    </div>
  );
}
