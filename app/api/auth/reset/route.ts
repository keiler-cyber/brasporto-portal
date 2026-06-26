import { NextRequest, NextResponse } from 'next/server';

// Envia email de redefinição de senha via Firebase (projeto compartilhado).
const API_KEY = process.env.FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  const emailClean = (email ?? '').trim().toLowerCase();

  if (!emailClean.endsWith('@brasporto.com')) {
    return NextResponse.json({ error: 'Utilize seu email @brasporto.com.' }, { status: 401 });
  }
  if (!API_KEY) {
    return NextResponse.json({ error: 'Autenticação não configurada. Contate o administrador.' }, { status: 500 });
  }

  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestType: 'PASSWORD_RESET', email: emailClean }),
      }
    );
    if (!res.ok) {
      const data = await res.json();
      const code = data?.error?.message ?? '';
      if (code === 'EMAIL_NOT_FOUND') {
        return NextResponse.json({ error: 'Não há conta com esse email. Use "Criar acesso".' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Erro ao enviar email de recuperação.' }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: 'Erro de conexão. Tente novamente.' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
