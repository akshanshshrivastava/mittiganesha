export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Puducherry",
  "Chandigarh",
];

export type DeliveryAddress = {
  name: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
};

export type DeliveryEstimate = {
  minDays: number;
  maxDays: number;
  label: string;
  estimatedBy: string;
  zone: "metro" | "standard";
};

function addBusinessDays(from: Date, days: number): Date {
  const result = new Date(from);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const day = result.getDay();
    if (day !== 0 && day !== 6) added++;
  }
  return result;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function validatePincode(pincode: string): boolean {
  return /^[1-9][0-9]{5}$/.test(pincode.replace(/\s/g, ""));
}

export function getEstimatedDelivery(pincode: string): DeliveryEstimate | null {
  const pin = pincode.replace(/\s/g, "");
  if (!validatePincode(pin)) return null;

  const metroPrefixes = [
    "110", "400", "560", "600", "700", "500", "411", "380", "302", "122", "201", "160",
  ];
  const isMetro = metroPrefixes.some((prefix) => pin.startsWith(prefix));

  const minDays = isMetro ? 3 : 5;
  const maxDays = isMetro ? 5 : 7;
  const estimatedBy = addBusinessDays(new Date(), maxDays);

  return {
    minDays,
    maxDays,
    label: isMetro ? "3–5 business days" : "5–7 business days",
    estimatedBy: formatDate(estimatedBy),
    zone: isMetro ? "metro" : "standard",
  };
}

export function formatDeliveryAddress(address: DeliveryAddress): string {
  const parts = [
    address.addressLine1,
    address.addressLine2,
    address.city,
    address.state,
    address.pincode,
  ].filter(Boolean);
  return parts.join(", ");
}

export function validateDeliveryAddress(address: DeliveryAddress): string | null {
  if (!address.name.trim()) return "Please enter your full name.";
  if (!address.email.trim() || !address.email.includes("@")) return "Please enter a valid email.";
  if (!/^[6-9]\d{9}$/.test(address.phone.replace(/\D/g, "").slice(-10))) {
    return "Please enter a valid 10-digit Indian mobile number.";
  }
  if (!address.addressLine1.trim()) return "Please enter your street address.";
  if (!address.city.trim()) return "Please enter your city.";
  if (!address.state.trim()) return "Please select your state.";
  if (!validatePincode(address.pincode)) return "Please enter a valid 6-digit pincode.";
  return null;
}
