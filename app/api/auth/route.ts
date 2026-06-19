import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const expected = process.env.ADMIN_PASSWORD || 'brasporto2026';

  if (password !== expected) {
    return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 });
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
