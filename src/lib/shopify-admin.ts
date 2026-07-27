import type { DeliveryAddress } from "@/lib/delivery";

const API_VERSION = "2025-01";

function getShopDomain() {
  const raw = process.env.SHOPIFY_STORE_DOMAIN?.trim() ?? "";
  return raw.replace(/^https?:\/\//, "").split("/")[0].toLowerCase();
}

async function getAdminAccessToken(): Promise<string> {
  const shop = getShopDomain();
  const clientId = process.env.SHOPIFY_CLIENT_ID?.trim();
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET?.trim();

  if (!shop || !clientId || !clientSecret) {
    throw new Error(
      "Missing SHOPIFY_STORE_DOMAIN, SHOPIFY_CLIENT_ID, or SHOPIFY_CLIENT_SECRET.",
    );
  }

  const res = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  const data = await res.json();
  if (!data.access_token) {
    throw new Error(data.error_description || "Could not get Shopify Admin token.");
  }
  return data.access_token;
}

async function adminGraphql<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const shop = getShopDomain();
  const token = await getAdminAccessToken();

  const res = await fetch(`https://${shop}/admin/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(json.errors[0]?.message ?? "Shopify Admin API error");
  }
  return json.data;
}

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  return {
    firstName: parts[0] || "Customer",
    lastName: parts.slice(1).join(" ") || ".",
  };
}

function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

export type CreateShopifyOrderInput = {
  variantId: string;
  quantity: number;
  amountInr: number;
  productTitle: string;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  delivery: DeliveryAddress & {
    estimate?: string;
    estimatedBy?: string;
  };
};

export async function createShopifyOrder(input: CreateShopifyOrderInput) {
  const { firstName, lastName } = splitName(input.delivery.name);
  const phone = normalizePhone(input.delivery.phone);

  const note = [
    "Paid via Razorpay on mittiganesha.com",
    `Razorpay Payment ID: ${input.razorpayPaymentId}`,
    `Razorpay Order ID: ${input.razorpayOrderId}`,
    `Amount: ₹${input.amountInr}`,
    input.delivery.estimate ? `Delivery estimate: ${input.delivery.estimate}` : "",
    input.delivery.estimatedBy ? `Expected by: ${input.delivery.estimatedBy}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const draftData = await adminGraphql<{
    draftOrderCreate: {
      draftOrder: { id: string; name: string } | null;
      userErrors: { message: string }[];
    };
  }>(
    `mutation ($input: DraftOrderInput!) {
      draftOrderCreate(input: $input) {
        draftOrder { id name }
        userErrors { field message }
      }
    }`,
    {
      input: {
        email: input.delivery.email,
        phone,
        note,
        tags: ["razorpay", "website", "mittiganesha"],
        lineItems: [{ variantId: input.variantId, quantity: input.quantity }],
        shippingAddress: {
          firstName,
          lastName,
          address1: input.delivery.addressLine1,
          address2: input.delivery.addressLine2 || "",
          city: input.delivery.city,
          province: input.delivery.state,
          zip: input.delivery.pincode,
          country: "IN",
          phone,
        },
        customAttributes: [
          { key: "razorpay_payment_id", value: input.razorpayPaymentId },
          { key: "payment_method", value: "Razorpay" },
        ],
      },
    },
  );

  const draftErrors = draftData.draftOrderCreate.userErrors;
  if (draftErrors.length > 0) {
    throw new Error(draftErrors.map((e) => e.message).join(", "));
  }

  const draftId = draftData.draftOrderCreate.draftOrder?.id;
  if (!draftId) throw new Error("Draft order was not created.");

  const completeData = await adminGraphql<{
    draftOrderComplete: {
      draftOrder: { order: { id: string; name: string } | null } | null;
      userErrors: { message: string }[];
    };
  }>(
    `mutation ($id: ID!) {
      draftOrderComplete(id: $id) {
        draftOrder { order { id name } }
        userErrors { field message }
      }
    }`,
    { id: draftId },
  );

  const completeErrors = completeData.draftOrderComplete.userErrors;
  if (completeErrors.length > 0) {
    throw new Error(completeErrors.map((e) => e.message).join(", "));
  }

  const order = completeData.draftOrderComplete.draftOrder?.order;
  if (!order) throw new Error("Shopify order was not created from draft.");

  // Mark paid — payment already collected via Razorpay
  try {
    await adminGraphql(
      `mutation ($input: OrderMarkAsPaidInput!) {
        orderMarkAsPaid(input: $input) {
          order { id displayFinancialStatus }
          userErrors { message }
        }
      }`,
      { input: { id: order.id } },
    );
  } catch {
    // Order exists but may show as pending — still a success
  }

  return order;
}
