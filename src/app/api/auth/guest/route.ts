import { NextRequest, NextResponse } from "next/server";
import { getSession, isSessionConfigured } from "@/lib/session";

export async function POST(request: NextRequest) {
  if (!isSessionConfigured()) {
    return NextResponse.json(
      { error: "Guest checkout is not configured yet. Add SESSION_SECRET in Vercel." },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const session = await getSession();

  session.type = "guest";
  session.isLoggedIn = true;
  session.name = body.name?.trim() || "Guest";
  session.email = body.email?.trim() || undefined;
  session.phone = body.phone?.trim() || undefined;
  session.shopifyToken = undefined;
  await session.save();

  return NextResponse.json({
    ok: true,
    user: { type: "guest", name: session.name, email: session.email },
  });
}
