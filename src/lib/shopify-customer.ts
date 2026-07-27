function getShopifyConfig() {
  const rawDomain = process.env.SHOPIFY_STORE_DOMAIN?.trim() ?? "";
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN?.trim() ?? "";

  const domain = rawDomain
    .replace(/^https?:\/\//, "")
    .split("/")[0]
    .trim()
    .toLowerCase();

  if (!domain || !token) {
    throw new Error("Missing Shopify Storefront credentials.");
  }

  return { domain, token };
}

async function storefrontFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
  customerToken?: string,
): Promise<T> {
  const { domain, token } = getShopifyConfig();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Shopify-Storefront-Access-Token": token,
  };
  if (customerToken) {
    headers["X-Shopify-Customer-Access-Token"] = customerToken;
  }

  const res = await fetch(`https://${domain}/api/2025-01/graphql.json`, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(json.errors[0]?.message ?? "Shopify API error");
  }
  return json.data;
}

export type CustomerProfile = {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
};

export async function loginCustomer(
  email: string,
  password: string,
): Promise<{ accessToken: string; customer: CustomerProfile }> {
  const data = await storefrontFetch<{
    customerAccessTokenCreate: {
      customerAccessToken: { accessToken: string; expiresAt: string } | null;
      customerUserErrors: { message: string; code?: string }[];
    };
  }>(
    `mutation ($input: CustomerAccessTokenCreateInput!) {
      customerAccessTokenCreate(input: $input) {
        customerAccessToken { accessToken expiresAt }
        customerUserErrors { message code }
      }
    }`,
    { input: { email, password } },
  );

  const errors = data.customerAccessTokenCreate.customerUserErrors;
  if (errors.length > 0) {
    throw new Error(errors[0].message);
  }

  const accessToken = data.customerAccessTokenCreate.customerAccessToken?.accessToken;
  if (!accessToken) {
    throw new Error("Invalid email or password.");
  }

  const customer = await getCustomer(accessToken);
  return { accessToken, customer };
}

export async function getCustomer(accessToken: string): Promise<CustomerProfile> {
  const data = await storefrontFetch<{
    customer: {
      email: string;
      firstName: string;
      lastName: string;
      phone?: string;
    } | null;
  }>(
    `query ($token: String!) {
      customer(customerAccessToken: $token) {
        email
        firstName
        lastName
        phone
      }
    }`,
    { token: accessToken },
    accessToken,
  );

  if (!data.customer) {
    throw new Error("Could not load customer profile.");
  }

  return data.customer;
}
