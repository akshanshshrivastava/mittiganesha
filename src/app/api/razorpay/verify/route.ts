import { NextRequest, NextResponse } from "next/server";
import { validateDeliveryAddress } from "@/lib/delivery";
import { verifyRazorpayPayment } from "@/lib/razorpay";
import { createShopifyOrder } from "@/lib/shopify-admin";
import { getProduct } from "@/lib/shopify";
import { getSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: "Session expired." }, { status: 401 });
    }

    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      productTitle,
      amount,
      handle,
      quantity = 1,
      delivery,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment response." }, { status: 400 });
    }

    const valid = verifyRazorpayPayment(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    );

    if (!valid) {
      return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
    }

    let shopifyOrder: { id: string; name: string } | null = null;
    let shopifyError: string | null = null;

    if (handle && delivery) {
      const addressError = validateDeliveryAddress(delivery);
      if (!addressError) {
        try {
          const product = await getProduct(handle);
          if (product) {
            const qty = Math.min(Math.max(Number(quantity) || 1, 1), 10);
            shopifyOrder = await createShopifyOrder({
              variantId: product.variantId,
              quantity: qty,
              amountInr: Number(amount),
              productTitle: productTitle || product.title,
              razorpayPaymentId: razorpay_payment_id,
              razorpayOrderId: razorpay_order_id,
              delivery: {
                ...delivery,
                estimate: delivery.estimate,
                estimatedBy: delivery.estimatedBy,
              },
            });
          }
        } catch (err) {
          shopifyError =
            err instanceof Error ? err.message : "Could not create Shopify order.";
          console.error("Shopify order sync failed:", shopifyError);
        }
      }
    }

    return NextResponse.json({
      ok: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      shopifyOrderName: shopifyOrder?.name ?? null,
      shopifyOrderSynced: !!shopifyOrder,
      shopifyError,
      productTitle,
      amount,
      customer: {
        name: session.name,
        email: session.email,
        type: session.type,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Payment verification failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
