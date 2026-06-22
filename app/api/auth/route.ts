import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || !email.trim().toLowerCase().endsWith('@brasporto.com')) {
    return NextResponse.json({ error: 'Utilize seu email @brasporto.com.' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set('bp_auth', 'ok', {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 8,
    path: '/',
  });
  res.cookies.set('bp_user_email', email.trim().toLowerCase(), {
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
