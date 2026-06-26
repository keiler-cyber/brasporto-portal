import { NextRequest, NextResponse } from 'next/server';

// Cria conta no mesmo projeto Firebase (brasporto-fretes) compartilhado por
// todos os módulos — a conta criada aqui vale para CE, Drawback, prealert etc.
const API_KEY = process.env.FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

const ERROR_MAP: Record<string, string> = {
  EMAIL_EXISTS: 'Este email já tem acesso. Use "Entrar".',
  WEAK_PASSWORD: 'A senha deve ter pelo menos 6 caracteres.',
  'WEAK_PASSWORD : Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres.',
};

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const emailClean = (email ?? '').trim().toLowerCase();

  if (!emailClean.endsWith('@brasporto.com')) {
    return NextResponse.json({ error: 'Utilize seu email @brasporto.com.' }, { status: 401 });
  }
  if (!API_KEY) {
    return NextResponse.json({ error: 'Autenticação não configurada. Contate o administrador.' }, { status: 500 });
  }

  let data: { idToken?: string; error?: { message?: string } };
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailClean, password, returnSecureToken: true }),
      }
    );
    data = await res.json();
    if (!res.ok) {
      const code = data?.error?.message ?? 'UNKNOWN';
      const known = Object.keys(ERROR_MAP).find((k) => code.startsWith(k));
      return NextResponse.json({ error: known ? ERROR_MAP[known] : 'Erro ao criar acesso.' }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: 'Erro de conexão. Tente novamente.' }, { status: 502 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set('bp_auth', 'ok', { httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 8, path: '/' });
  res.cookies.set('bp_user_email', emailClean, { httpOnly: false, sameSite: 'lax', maxAge: 60 * 60 * 8, path: '/' });
  return res;
}
