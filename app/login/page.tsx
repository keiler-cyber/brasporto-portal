"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

const VERSION = "26.06.23";

const ERRORS: Record<string, string> = {
  "auth/email-already-in-use": "Este email já está registrado",
  "auth/weak-password": "A senha deve ter pelo menos 6 caracteres",
  "auth/user-not-found": "Email não encontrado",
  "auth/wrong-password": "Senha incorreta",
  "auth/invalid-credential": "Email ou senha incorretos",
  "auth/too-many-requests": "Muitas tentativas. Tente mais tarde",
  "auth/invalid-api-key": "Configuração Firebase inválida — contate o administrador.",
};

const Spinner = () => (
  <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#001829" }}>
    <div style={{ width: 28, height: 28, border: "3px solid #4A9BAA", borderTopColor: "transparent", borderRadius: "50%", animation: "spin .8s linear infinite" }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

// ── Conteúdo real — dentro de Suspense (obrigatório para useSearchParams) ──
function LoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get("redirect") || "/hub";

  const [ready, setReady] = useState(false);   // Firebase verificou sessão atual
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [resetSent, setResetSent] = useState(false);

  // Se já estiver logado → redireciona
  useEffect(() => {
    if (!auth) { setReady(true); return; }
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u && u.email?.endsWith("@brasporto.com")) {
        router.replace(redirectTo);
      } else {
        setReady(true);
      }
    });
    return unsub;
  }, [router, redirectTo]);

  if (!ready) return <Spinner />;

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!auth) { setError("Firebase não configurado — contate o administrador."); return; }
    if (!email.endsWith("@brasporto.com")) { setError("Apenas emails @brasporto.com são permitidos."); return; }
    setLoading(true);
    try {
      if (mode === "signup") {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      router.replace(redirectTo);
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      setError(ERRORS[e.code ?? ""] || e.message || "Erro ao autenticar");
    } finally { setLoading(false); }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!auth) { setError("Firebase não configurado."); return; }
    if (!email.endsWith("@brasporto.com")) { setError("Apenas emails @brasporto.com são permitidos."); return; }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      setError(ERRORS[e.code ?? ""] || e.message || "Erro ao enviar email");
    } finally { setLoading(false); }
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
            <div style={{ width: 40, height: 4, borderRadius: 2, background: "#4A9BAA", marginBottom: 24 }} />
            <h1 style={{ fontSize: 36, fontWeight: 600, color: "white", lineHeight: 1.25, margin: "0 0 12px" }}>Portal Athena</h1>
            <p style={{ color: "#7dd3e8", fontSize: 15, lineHeight: 1.6, maxWidth: 280, margin: 0 }}>
              Acesso restrito a colaboradores Brasporto.
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
              {mode === "reset" ? "Recuperar Senha" : mode === "signup" ? "Criar Acesso" : "Acesso à Plataforma"}
            </h2>
            <p style={{ color: "#6b7280", fontSize: 13, margin: 0 }}>
              {mode === "reset" ? "Informe seu email para receber o link"
                : mode === "signup" ? "Crie sua senha para acessar"
                : "Entre com suas credenciais @brasporto.com"}
            </p>
          </div>

          {/* Recuperar senha */}
          {mode === "reset" && (
            <div>
              {resetSent ? (
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: 20, textAlign: "center" }}>
                  <p style={{ color: "#15803d", fontWeight: 600, fontSize: 14, margin: "0 0 4px" }}>Email enviado!</p>
                  <p style={{ color: "#166534", fontSize: 12, margin: "0 0 16px" }}>Verifique sua caixa em <strong>{email}</strong>.</p>
                  <button onClick={() => { setMode("login"); setResetSent(false); setError(""); }}
                    style={{ color: "#4A9BAA", background: "none", border: "none", cursor: "pointer", fontSize: 13 }}>
                    ← Voltar ao login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleReset} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <Field label="E-mail" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu-email@brasporto.com" />
                  {error && <ErrBox msg={error} />}
                  <Btn loading={loading} label="Enviar link de recuperação" />
                  <button type="button" onClick={() => { setMode("login"); setError(""); }}
                    style={{ color: "#9ca3af", background: "none", border: "none", cursor: "pointer", fontSize: 13 }}>
                    ← Voltar ao login
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Login / Criar acesso */}
          {mode !== "reset" && (
            <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Field label="E-mail" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu-email@brasporto.com" autoFocus />
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>Senha</label>
                <div style={{ position: "relative" }}>
                  <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" required
                    style={{ width: "100%", padding: "11px 44px 11px 14px", border: "2px solid #e5e7eb", borderRadius: 10, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 11 }}>
                    {showPw ? "ocultar" : "ver"}
                  </button>
                </div>
                {mode === "signup" && <p style={{ fontSize: 11, color: "#9ca3af", margin: "4px 0 0" }}>Mínimo 6 caracteres.</p>}
              </div>
              {error && <ErrBox msg={error} />}
              <Btn loading={loading} label={loading ? (mode === "signup" ? "Criando…" : "Entrando…") : (mode === "signup" ? "Criar Senha e Entrar" : "Entrar")} disabled={!email || !password} />
            </form>
          )}

          {mode !== "reset" && (
            <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8, textAlign: "center" }}>
              <button onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setError(""); }}
                style={{ color: "#6b7280", background: "none", border: "none", cursor: "pointer", fontSize: 13 }}>
                {mode === "signup" ? "Já tem conta? Entrar" : "Não tem conta? Criar acesso"}
              </button>
              {mode === "login" && (
                <button onClick={() => { setMode("reset"); setError(""); setResetSent(false); }}
                  style={{ color: "#9ca3af", background: "none", border: "none", cursor: "pointer", fontSize: 12 }}>
                  Esqueci minha senha
                </button>
              )}
            </div>
          )}

          <p style={{ marginTop: 32, textAlign: "center", fontSize: 11, color: "#9ca3af" }}>
            🔒 Acesso restrito a colaboradores @brasporto.com
          </p>
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) { .lg-panel { display: flex !important; } }
      `}</style>
    </div>
  );
}

// helpers
function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>{label}</label>
      <input {...props} style={{ width: "100%", padding: "11px 14px", border: "2px solid #e5e7eb", borderRadius: 10, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
    </div>
  );
}
function ErrBox({ msg }: { msg: string }) {
  return <p style={{ fontSize: 13, color: "#b91c1c", background: "#fee2e2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", margin: 0 }}>{msg}</p>;
}
function Btn({ loading, label, disabled }: { loading: boolean; label: string; disabled?: boolean }) {
  return (
    <button type="submit" disabled={loading || disabled}
      style={{ width: "100%", padding: "13px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "white", background: "linear-gradient(135deg,#4A9BAA,#3d8594)", opacity: disabled ? 0.45 : 1 }}>
      {label}
    </button>
  );
}

// ── Export ── Suspense obrigatório para useSearchParams no App Router
export default function LoginPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <LoginContent />
    </Suspense>
  );
}
