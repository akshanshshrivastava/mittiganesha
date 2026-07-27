import { NextRequest, NextResponse } from "next/server";
import { createRazorpayOrder } from "@/lib/razorpay";
import { validateDeliveryAddress } from "@/lib/delivery";
import { getProduct } from "@/lib/shopify";
import { getSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: "Please log in or continue as guest." }, { status: 401 });
    }

    const { handle, quantity = 1, delivery } = await request.json();
    if (!handle) {
      return NextResponse.json({ error: "Product handle is required." }, { status: 400 });
    }

    if (!delivery) {
      return NextResponse.json({ error: "Delivery address is required." }, { status: 400 });
    }

    const addressError = validateDeliveryAddress(delivery);
    if (addressError) {
      return NextResponse.json({ error: addressError }, { status: 400 });
    }

    const product = await getProduct(handle);
    if (!product || !product.available) {
      return NextResponse.json({ error: "Product unavailable." }, { status: 404 });
    }

    const qty = Math.min(Math.max(Number(quantity) || 1, 1), 10);
    const totalInr = parseFloat(product.price) * qty;
    const receipt = `mg_${handle.slice(0, 20)}_${Date.now()}`;

    const order = await createRazorpayOrder(totalInr, receipt, {
      product: product.title,
      customer: delivery.name,
      city: delivery.city,
      pincode: delivery.pincode,
      delivery_eta: delivery.estimate || "",
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      product: {
        title: product.title,
        handle: product.handle,
        price: product.price,
        quantity: qty,
      },
      delivery: {
        formatted: delivery.formatted,
        estimate: delivery.estimate,
        estimatedBy: delivery.estimatedBy,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create payment order.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
