import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  type?: "customer" | "guest";
  email?: string;
  name?: string;
  phone?: string;
  shopifyToken?: string;
  isLoggedIn: boolean;
}

export const defaultSession: SessionData = {
  isLoggedIn: false,
};

let cachedOptions: SessionOptions | null = null;

function getSessionOptions(): SessionOptions {
  if (cachedOptions) return cachedOptions;

  const secret = process.env.SESSION_SECRET?.trim();
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set and at least 32 characters.");
  }

  cachedOptions = {
    password: secret,
    cookieName: "mitti_ganesha_session",
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    },
  };

  return cachedOptions;
}

export async function getSession() {
  const session = await getIronSession<SessionData>(await cookies(), getSessionOptions());
  if (session.isLoggedIn === undefined) {
    session.isLoggedIn = false;
  }
  return session;
}

export async function requireCheckoutSession(redirectPath: string) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return { session: null, redirect: `/login?redirect=${encodeURIComponent(redirectPath)}` };
  }
  return { session, redirect: null };
}
