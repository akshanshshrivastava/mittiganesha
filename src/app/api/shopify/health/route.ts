import { NextResponse } from "next/server";
import { checkShopifyOrderSyncReady } from "@/lib/shopify-admin";

export async function GET() {
  const status = await checkShopifyOrderSyncReady();
  return NextResponse.json(status);
}
