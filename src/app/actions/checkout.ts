"use server";

import { createCheckout } from "@/lib/shopify";

export async function buyNow(variantId: string): Promise<string> {
  return createCheckout(variantId);
}
