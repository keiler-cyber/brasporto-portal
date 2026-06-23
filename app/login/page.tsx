"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

const FIREBASE_UNAVAILABLE = "Serviço de autenticação indisponível. Contate o administrador.";

const VERSION = "26.06.19";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    if (!authLoading && user) router.push("/admin");
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#001829" }}>
        <div className="w-6 h-6 border-2 border-[#4A9BAA] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (user) return null;

  const FIREBASE_ERRORS: Record<string, string> = {
    "auth/email-already-in-use": "Este email já está registrado",
    "auth/weak-password": "A senha deve ter pelo menos 6 caracteres",
    "auth/user-not-found": "Email não encontrado",
    "auth/wrong-password": "Senha incorreta",
    "auth/invalid-credential": "Email ou senha incorretos",
    "auth/too-many-requests": "Muitas tentativas. Tente mais tarde",
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!auth) { setError(FIREBASE_UNAVAILABLE); return; }
    setLoading(true);
    try {
      if (!email.endsWith("@brasporto.com")) throw new Error("Apenas emails @brasporto.com são permitidos");
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      setError(FIREBASE_ERRORS[e.code ?? ""] || e.message || "Erro ao enviar email");
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!auth) { setError(FIREBASE_UNAVAILABLE); return; }
    if (!email.endsWith("@brasporto.com")) {
      setError("Apenas emails @brasporto.com são permitidos");
      return;
    }
    setLoading(true);
    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      // Seta cookie de sessão no servidor
      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      router.push("/admin");
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      setError(FIREBASE_ERRORS[e.code ?? ""] || e.message || "Erro ao autenticar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Lado esquerdo — imagem ── */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/athena-bg.png" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "rgba(0,24,41,0.55)" }} />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brasporto-logo.png" alt="Brasporto"
              className="h-14 w-auto object-contain"
              style={{ filter: "brightness(0) invert(1)", maxWidth: "220px" }} />
          </div>
          <div>
            <div className="w-10 h-1 rounded mb-6" style={{ background: "#4A9BAA" }} />
            <h1 className="text-4xl font-semibold text-white leading-tight mb-3">
              Gerador de<br />Instruções<br />de Embarque
            </h1>
            <p className="text-[#7dd3e8] text-base leading-relaxed max-w-xs">
              Preenchimento inteligente de conhecimento de embarque via IA generativa.
            </p>
          </div>
          <div className="flex items-center justify-between">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/oea-logo.png" alt="OEA" className="h-20 w-auto object-contain opacity-85" />
            <span className="px-2.5 py-1 text-white text-xs font-mono rounded-full tracking-widest shadow"
              style={{ background: "#4A9BAA" }}>v{VERSION}</span>
          </div>
        </div>
      </div>

      {/* ── Lado direito — formulário ── */}
      <div className="flex-1 lg:max-w-[480px] flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">

          {/* Logo mobile */}
          <div className="lg:hidden flex justify-center mb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brasporto-logo.png" alt="Brasporto" className="h-10 w-auto object-contain" />
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-1">
              {isReset ? "Recuperar Senha" : isSignup ? "Criar Acesso" : "Acesso à Plataforma"}
            </h2>
            <p className="text-gray-500 text-sm">
              {isReset
                ? "Informe seu email para receber o link de redefinição"
                : isSignup
                  ? "Crie sua senha para acessar a plataforma"
                  : "Entre com suas credenciais para continuar"}
            </p>
          </div>

          {/* Recuperar senha */}
          {isReset && (
            <div className="space-y-5">
              {resetSent ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <p className="text-green-700 font-semibold text-sm mb-1">Email enviado!</p>
                  <p className="text-green-600 text-xs">Verifique sua caixa de entrada em <strong>{email}</strong>.</p>
                  <button onClick={() => { setIsReset(false); setResetSent(false); setError(""); }}
                    className="mt-4 text-sm hover:underline" style={{ color: "#4A9BAA" }}>
                    Voltar ao login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleReset} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mail</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="seu-email@brasporto.com" required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#4A9BAA] transition" />
                  </div>
                  {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}
                  <button type="submit" disabled={loading}
                    className="w-full py-3.5 text-white font-semibold rounded-xl transition disabled:opacity-40 text-sm"
                    style={{ background: "#4A9BAA" }}>
                    {loading ? "Enviando..." : "Enviar link de recuperação"}
                  </button>
                  <button type="button" onClick={() => { setIsReset(false); setError(""); }}
                    className="w-full text-sm text-gray-500 hover:text-gray-700 transition">
                    ← Voltar ao login
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Login / Criar acesso */}
          {!isReset && (
            <form onSubmit={handleAuth} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mail</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="seu-email@brasporto.com" required autoFocus
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#4A9BAA] transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Senha</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" required
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#4A9BAA] transition" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 text-xs">
                    {showPassword ? "ocultar" : "ver"}
                  </button>
                </div>
                {isSignup && <p className="text-xs text-gray-400 mt-1">Mínimo 6 caracteres.</p>}
              </div>

              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}

              <button type="submit" disabled={loading || !email || !password}
                className="w-full py-3.5 text-white font-semibold rounded-xl transition disabled:opacity-40 text-sm"
                style={{ background: "linear-gradient(135deg, #4A9BAA 0%, #3d8594 100%)" }}>
                {loading
                  ? (isSignup ? "Criando..." : "Entrando...")
                  : (isSignup ? "Criar Senha e Entrar" : "Entrar")}
              </button>
            </form>
          )}

          {!isReset && (
            <div className="mt-5 space-y-2 text-center">
              <button onClick={() => { setIsSignup(!isSignup); setError(""); }}
                className="block w-full text-sm text-gray-500 hover:text-gray-700 transition">
                {isSignup ? "Já tem conta? Entrar" : "Não tem conta? Criar acesso"}
              </button>
              {!isSignup && (
                <button onClick={() => { setIsReset(true); setError(""); setResetSent(false); }}
                  className="block w-full text-sm text-gray-400 hover:text-gray-600 transition">
                  Esqueci minha senha
                </button>
              )}
            </div>
          )}

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400">🔒 Acesso restrito a colaboradores @brasporto.com</p>
          </div>

        </div>
      </div>
    </div>
  );
}
