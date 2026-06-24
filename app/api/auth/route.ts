import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const emailClean = (email ?? '').trim().toLowerCase();
  if (!emailClean.endsWith('@brasporto.com')) {
    return NextResponse.json({ error: 'Utilize seu email @brasporto.com.' }, { status: 401 });
  }

  const expectedPassword = process.env.PORTAL_PASSWORD;
  if (!expectedPassword || password !== expectedPassword) {
    return NextResponse.json({ error: 'Senha incorreta.' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set('bp_auth', 'ok', {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 8,
    path: '/',
  });
  res.cookies.set('bp_user_email', emailClean, {
    httpOnly: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 8,
    path: '/',
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete('bp_auth');
  res.cookies.delete('bp_user_email');
  return res;
}
