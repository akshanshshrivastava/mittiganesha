import { NextRequest, NextResponse } from "next/server";
import { loginCustomer } from "@/lib/shopify-customer";
import { getWritableSession, isSessionConfigured } from "@/lib/session";

export async function POST(request: NextRequest) {
  if (!isSessionConfigured()) {
    return NextResponse.json(
      { error: "Login is not configured yet. Use Continue as Guest or contact support." },
      { status: 503 },
    );
  }

  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const { accessToken, customer } = await loginCustomer(email, password);
    const session = await getWritableSession();
    if (!session) {
      return NextResponse.json({ error: "Session not configured." }, { status: 503 });
    }

    session.type = "customer";
    session.isLoggedIn = true;
    session.email = customer.email;
    session.name = [customer.firstName, customer.lastName].filter(Boolean).join(" ") || email;
    session.phone = customer.phone;
    session.shopifyToken = accessToken;
    await session.save();

    return NextResponse.json({
      ok: true,
      user: { type: "customer", email: session.email, name: session.name },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed.";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
