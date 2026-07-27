import { NextResponse } from "next/server";
import { defaultSession, getWritableSession } from "@/lib/session";

export async function POST() {
  const session = await getWritableSession();
  if (!session) {
    return NextResponse.json({ ok: true });
  }

  session.type = undefined;
  session.isLoggedIn = defaultSession.isLoggedIn;
  session.email = undefined;
  session.name = undefined;
  session.phone = undefined;
  session.shopifyToken = undefined;
  await session.save();

  return NextResponse.json({ ok: true });
}
