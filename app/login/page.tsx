"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const VERSION = "26.06.23d";

const Spinner = () => (
  <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#001829" }}>
    <div style={{ width: 28, height: 28, border: "3px solid #4A9BAA", borderTopColor: "transparent", borderRadius: "50%", animation: "spin .8s linear infinite" }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

const TOOLS: Record<string, { title: string; subtitle: string; color: string }> = {
  "/conferente": {
    title: "Conferente de\nPré-Alerta",
    subtitle: "Verificação automatizada de documentos de embarque — campo a campo.",
    color: "#4A9BAA",
  },
  "/hub": {
    title: "Portal\nAthena",
    subtitle: "Hub central de ferramentas operacionais Brasporto.",
    color: "#4A9BAA",
  },
  "/admin": {
    title: "Administração",
    subtitle: "Painel administrativo do portal.",
    color: "#6366f1",
  },
  "/dashboard": {
    title: "Dashboard",
    subtitle: "Visão geral de operações e embarques.",
    color: "#4A9BAA",
  },
  "/bl-generator": {
    title: "Gerador de BL",
    subtitle: "Geração automatizada de Bill of Lading.",
    color: "#4A9BAA",
  },
};

function getTool(redirect: string) {
  const key = Object.keys(TOOLS).find(k => redirect.startsWith(k));
  return key ? TOOLS[key] : TOOLS["/hub"];
}

function LoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get("redirect") || "/hub";
  const tool = getTool(redirectTo);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");

  function switchMode(next: "login" | "signup" | "reset") {
    setMode(next);
    setError("");
    setSuccess("");
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!email.toLowerCase().endsWith("@brasporto.com")) {
      setError("Apenas emails @brasporto.com são permitidos.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "reset") {
        const res = await fetch("/api/auth/reset", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error || "Erro ao enviar email."); return; }
        setSuccess(`Enviamos um link de redefinição para ${email}. Confira sua caixa de entrada.`);
        return;
      }
      const res = await fetch(mode === "signup" ? "/api/auth/signup" : "/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Credenciais inválidas.");
        return;
      }
      window.location.href = redirectTo;
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>

      {/* Lado esquerdo — imagem (desktop) */}
      <div style={{ display: "none", flex: 1, position: "relative", overflow: "hidden" }}
        className="lg-panel">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/athena-bg.png" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,24,41,0.58)" }} />
        <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 48, height: "100%" }}>
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brasporto-logo.png" alt="Brasporto" style={{ height: 52, width: "auto", objectFit: "contain", filter: "brightness(0) invert(1)", maxWidth: 200 }} />
          </div>
          <div>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: tool.color, marginBottom: 24 }} />
            <h1 style={{ fontSize: 34, fontWeight: 700, color: "white", lineHeight: 1.2, margin: "0 0 12px", whiteSpace: "pre-line" }}>{tool.title}</h1>
            <p style={{ color: "#7dd3e8", fontSize: 15, lineHeight: 1.6, maxWidth: 280, margin: 0 }}>
              {tool.subtitle}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/oea-logo.png" alt="OEA" style={{ height: 72, width: "auto", objectFit: "contain", opacity: 0.85 }} />
            <span style={{ background: "#4A9BAA", color: "white", fontFamily: "monospace", fontSize: 11, padding: "3px 12px", borderRadius: 999, letterSpacing: "0.1em" }}>v{VERSION}</span>
          </div>
        </div>
      </div>

      {/* Lado direito — formulário */}
      <div style={{ flex: 1, maxWidth: 480, display: "flex", alignItems: "center", justifyContent: "center", padding: 32, background: "white" }}>
        <div style={{ width: "100%", maxWidth: 340 }}>

          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 22, fontWeight: 600, color: "#111", margin: "0 0 4px" }}>
              {mode === "signup" ? "Criar Acesso" : mode === "reset" ? "Recuperar Senha" : "Acesso à Plataforma"}
            </h2>
            <p style={{ color: "#6b7280", fontSize: 13, margin: 0 }}>
              {mode === "signup"
                ? "Crie sua senha — vale para todos os módulos Brasporto"
                : mode === "reset"
                ? "Informe seu email para receber o link de redefinição"
                : "Entre com suas credenciais @brasporto.com"}
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>E-mail</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="seu-email@brasporto.com" required autoFocus
                style={{ width: "100%", padding: "11px 14px", border: "2px solid #e5e7eb", borderRadius: 10, fontSize: 13, outline: "none", boxSizing: "border-box" }}
              />
            </div>
            {mode !== "reset" && (
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>Senha</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  style={{ width: "100%", padding: "11px 44px 11px 14px", border: "2px solid #e5e7eb", borderRadius: 10, fontSize: 13, outline: "none", boxSizing: "border-box" }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 11 }}>
                  {showPw ? "ocultar" : "ver"}
                </button>
              </div>
            </div>
            )}

            {error && (
              <p style={{ fontSize: 13, color: "#b91c1c", background: "#fee2e2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", margin: 0 }}>{error}</p>
            )}
            {success && (
              <p style={{ fontSize: 13, color: "#065f46", background: "#d1fae5", border: "1px solid #a7f3d0", borderRadius: 10, padding: "10px 14px", margin: 0 }}>{success}</p>
            )}

            <button type="submit" disabled={loading || !email || (mode !== "reset" && !password)}
              style={{ width: "100%", padding: "13px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "white", background: "linear-gradient(135deg,#4A9BAA,#3d8594)", opacity: (!email || (mode !== "reset" && !password)) ? 0.45 : 1 }}>
              {loading
                ? (mode === "signup" ? "Criando…" : mode === "reset" ? "Enviando…" : "Entrando…")
                : (mode === "signup" ? "Criar acesso e entrar" : mode === "reset" ? "Enviar link de recuperação" : "Entrar")}
            </button>
          </form>

          {mode === "reset" ? (
            <button type="button" onClick={() => switchMode("login")}
              style={{ width: "100%", marginTop: 14, background: "none", border: "none", cursor: "pointer", color: "#4A9BAA", fontSize: 13, fontWeight: 500 }}>
              ← Voltar ao login
            </button>
          ) : (
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, gap: 8 }}>
              <button type="button" onClick={() => switchMode(mode === "signup" ? "login" : "signup")}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#4A9BAA", fontSize: 13, fontWeight: 500 }}>
                {mode === "signup" ? "Já tem acesso? Entrar" : "Criar acesso"}
              </button>
              {mode === "login" && (
                <button type="button" onClick={() => switchMode("reset")}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 13, fontWeight: 500 }}>
                  Esqueci minha senha
                </button>
              )}
            </div>
          )}

          <p style={{ marginTop: 24, textAlign: "center", fontSize: 11, color: "#9ca3af" }}>
            🔒 Acesso restrito a colaboradores @brasporto.com
          </p>
          <p style={{ textAlign: "center", fontSize: 10, color: "#d1d5db", marginTop: 8 }}>v{VERSION}</p>
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) { .lg-panel { display: flex !important; } }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <LoginContent />
    </Suspense>
  );
}
