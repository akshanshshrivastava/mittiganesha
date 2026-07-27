import { getEstimatedDelivery, type DeliveryAddress } from "@/lib/delivery";

const SHIPROCKET_BASE = "https://apiv2.shiprocket.in/v1/external";

/** Default package for one 6-inch clay idol (cm / kg). */
const PACKAGE = {
  length: 18,
  breadth: 18,
  height: 22,
  weightPerUnit: 0.6,
} as const;

export type ShippingQuote = {
  rate: number;
  courierName: string;
  courierCompanyId: number | null;
  etd: string | null;
  estimatedDays: string | null;
  source: "shiprocket" | "fallback";
};

type CourierOption = {
  courier_company_id?: number;
  courier_name?: string;
  rate?: number;
  freight_charge?: number;
  estimated_delivery_days?: string | number;
  etd?: string;
  etd_hours?: number;
};

let cachedToken: string | null = null;
let cachedTokenAt = 0;

export function isShiprocketConfigured() {
  return !!(
    process.env.SHIPROCKET_EMAIL?.trim() &&
    process.env.SHIPROCKET_PASSWORD?.trim() &&
    process.env.SHIPROCKET_PICKUP_PINCODE?.trim()
  );
}

function getPickupPincode() {
  return process.env.SHIPROCKET_PICKUP_PINCODE?.trim() || "";
}

function getPickupLocationName() {
  return process.env.SHIPROCKET_PICKUP_LOCATION?.trim() || "Primary";
}

function packageWeightKg(quantity: number) {
  const override = Number(process.env.SHIPROCKET_WEIGHT_KG);
  const perUnit =
    Number.isFinite(override) && override > 0 ? override : PACKAGE.weightPerUnit;
  return Math.max(0.5, perUnit * Math.max(1, quantity));
}

async function getShiprocketToken(): Promise<string> {
  if (cachedToken && Date.now() - cachedTokenAt < 8 * 24 * 60 * 60 * 1000) {
    return cachedToken;
  }

  const email = process.env.SHIPROCKET_EMAIL?.trim();
  const password = process.env.SHIPROCKET_PASSWORD?.trim();
  if (!email || !password) {
    throw new Error("Shiprocket credentials are not configured.");
  }

  const res = await fetch(`${SHIPROCKET_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  const data = await res.json();
  if (!res.ok || !data.token) {
    throw new Error(data.message || "Shiprocket login failed.");
  }

  cachedToken = data.token as string;
  cachedTokenAt = Date.now();
  return cachedToken;
}

async function shiprocketFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getShiprocketToken();
  const res = await fetch(`${SHIPROCKET_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  const data = await res.json();
  if (!res.ok) {
    const message =
      data.message ||
      data.error ||
      (typeof data === "string" ? data : "Shiprocket API error");
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }
  return data as T;
}

function fallbackQuote(pincode: string): ShippingQuote {
  const estimate = getEstimatedDelivery(pincode);
  const rate = estimate?.zone === "metro" ? 59 : 99;
  return {
    rate,
    courierName: estimate?.zone === "metro" ? "Standard Metro" : "Standard India",
    courierCompanyId: null,
    etd: estimate?.estimatedBy ?? null,
    estimatedDays: estimate?.label ?? null,
    source: "fallback",
  };
}

function pickCheapestCourier(couriers: CourierOption[]): ShippingQuote | null {
  const priced = couriers
    .map((c) => ({
      courierCompanyId: c.courier_company_id ?? null,
      courierName: c.courier_name || "Courier",
      rate: Number(c.rate ?? c.freight_charge ?? NaN),
      etd: c.etd || null,
      estimatedDays:
        c.estimated_delivery_days != null ? String(c.estimated_delivery_days) : null,
    }))
    .filter((c) => Number.isFinite(c.rate) && c.rate >= 0)
    .sort((a, b) => a.rate - b.rate);

  if (priced.length === 0) return null;
  const best = priced[0];
  return {
    rate: Math.ceil(best.rate),
    courierName: best.courierName,
    courierCompanyId: best.courierCompanyId,
    etd: best.etd,
    estimatedDays: best.estimatedDays,
    source: "shiprocket",
  };
}

export async function getShippingQuote(
  deliveryPincode: string,
  quantity = 1,
): Promise<ShippingQuote> {
  const pin = deliveryPincode.replace(/\s/g, "");
  if (!/^[1-9][0-9]{5}$/.test(pin)) {
    throw new Error("Enter a valid 6-digit pincode.");
  }

  if (!isShiprocketConfigured()) {
    return fallbackQuote(pin);
  }

  try {
    const pickup = getPickupPincode();
    const weight = packageWeightKg(quantity);
    const params = new URLSearchParams({
      pickup_postcode: pickup,
      delivery_postcode: pin,
      weight: String(weight),
      cod: "0",
    });

    const data = await shiprocketFetch<{
      data?: { available_courier_companies?: CourierOption[] };
      available_courier_companies?: CourierOption[];
    }>(`/courier/serviceability/?${params.toString()}`);

    const couriers =
      data.data?.available_courier_companies ||
      data.available_courier_companies ||
      [];

    const quote = pickCheapestCourier(couriers);
    if (!quote) {
      throw new Error("No courier available for this pincode.");
    }
    return quote;
  } catch (error) {
    console.error("Shiprocket rate lookup failed, using fallback:", error);
    return fallbackQuote(pin);
  }
}

export type CreateShiprocketOrderInput = {
  orderId: string;
  delivery: DeliveryAddress;
  productTitle: string;
  productSku: string;
  quantity: number;
  productPriceInr: number;
  shippingCharges: number;
  courierCompanyId?: number | null;
};

export async function createShiprocketOrder(input: CreateShiprocketOrderInput) {
  if (!isShiprocketConfigured()) {
    return null;
  }

  const { firstName, lastName } = splitName(input.delivery.name);
  const phone = input.delivery.phone.replace(/\D/g, "").slice(-10);
  const qty = Math.max(1, input.quantity);
  const now = new Date();
  const orderDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const payload = {
    order_id: input.orderId.slice(0, 50),
    order_date: orderDate,
    pickup_location: getPickupLocationName(),
    billing_customer_name: firstName,
    billing_last_name: lastName,
    billing_address: input.delivery.addressLine1,
    billing_address_2: input.delivery.addressLine2 || "",
    billing_city: input.delivery.city,
    billing_pincode: Number(input.delivery.pincode),
    billing_state: input.delivery.state,
    billing_country: "India",
    billing_email: input.delivery.email,
    billing_phone: Number(phone),
    shipping_is_billing: true,
    order_items: [
      {
        name: input.productTitle,
        sku: input.productSku.slice(0, 50) || "mitti-ganesha",
        units: qty,
        selling_price: Math.round(input.productPriceInr),
      },
    ],
    payment_method: "Prepaid",
    shipping_charges: Math.round(input.shippingCharges),
    sub_total: Math.round(input.productPriceInr * qty),
    length: PACKAGE.length,
    breadth: PACKAGE.breadth,
    height: PACKAGE.height,
    weight: packageWeightKg(qty),
    order_tag: "mittiganesha,website,razorpay",
  };

  const data = await shiprocketFetch<{
    order_id?: number;
    shipment_id?: number;
    status?: string;
    status_code?: number;
  }>("/orders/create/adhoc", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  // Optionally request preferred courier assignment later via AWB API.
  // Creating the order is enough for the merchant to ship from Shiprocket panel.
  void input.courierCompanyId;

  return {
    shiprocketOrderId: data.order_id ?? null,
    shipmentId: data.shipment_id ?? null,
    status: data.status ?? null,
  };
}

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  return {
    firstName: parts[0] || "Customer",
    lastName: parts.slice(1).join(" ") || ".",
  };
}
