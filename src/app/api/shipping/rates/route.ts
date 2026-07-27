import { NextRequest, NextResponse } from "next/server";
import { validatePincode } from "@/lib/delivery";
import { getShippingQuote, isShiprocketConfigured } from "@/lib/shiprocket";

export async function GET(request: NextRequest) {
  try {
    const pincode = request.nextUrl.searchParams.get("pincode") || "";
    const quantity = Number(request.nextUrl.searchParams.get("quantity") || "1");

    if (!validatePincode(pincode)) {
      return NextResponse.json({ error: "Enter a valid 6-digit pincode." }, { status: 400 });
    }

    const quote = await getShippingQuote(pincode, quantity);
    return NextResponse.json({
      ...quote,
      configured: isShiprocketConfigured(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not fetch shipping rates.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
