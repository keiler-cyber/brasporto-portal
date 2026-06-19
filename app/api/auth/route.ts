import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const expectedEmail = process.env.ADMIN_EMAIL || 'keiler@brasporto.com';
  const expectedPassword = process.env.ADMIN_PASSWORD || 'brasporto2026';

  if (email !== expectedEmail || password !== expectedPassword) {
    return NextResponse.json({ error: 'E-mail ou senha incorretos.' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set('bp_auth', 'ok', {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 horas
    path: '/',
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete('bp_auth');
  return res;
}
