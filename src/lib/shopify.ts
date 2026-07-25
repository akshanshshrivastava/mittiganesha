function getShopifyConfig() {
  const rawDomain = process.env.SHOPIFY_STORE_DOMAIN?.trim() ?? "";
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN?.trim() ?? "";

  // Strip protocol, paths, and whitespace — keep only the hostname
  let domain = rawDomain
    .replace(/^https?:\/\//, "")
    .split("/")[0]
    .trim()
    .toLowerCase();

  if (!domain || !token) {
    throw new Error(
      "Missing Shopify env vars. Set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN in Vercel.",
    );
  }

  if (!/^[a-z0-9-]+\.myshopify\.com$/.test(domain)) {
    throw new Error(
      `Invalid SHOPIFY_STORE_DOMAIN: "${rawDomain}". ` +
        "Use only your myshopify.com hostname, e.g. 0vfr3h-bn.myshopify.com",
    );
  }

  return { domain, token };
}

export type Product = {
  id: string;
  title: string;
  handle: string;
  description: string;
  price: string;
  currencyCode: string;
  imageUrl: string;
  imageAlt: string;
  variantId: string;
  available: boolean;
};

async function shopifyFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const { domain, token } = getShopifyConfig();

  const res = await fetch(`https://${domain}/api/2025-01/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 60 },
  });

  const json = await res.json();
  if (json.errors) {
    throw new Error(json.errors[0]?.message ?? "Shopify API error");
  }
  return json.data;
}

const PRODUCT_FIELDS = `
  id
  title
  handle
  description
  featuredImage {
    url
    altText
  }
  priceRange {
    minVariantPrice {
      amount
      currencyCode
    }
  }
  variants(first: 1) {
    edges {
      node {
        id
        availableForSale
      }
    }
  }
`;

export async function getProducts(): Promise<Product[]> {
  try {
    const data = await shopifyFetch<{
      products: { edges: { node: Record<string, unknown> }[] };
    }>(`{
      products(first: 20, sortKey: TITLE) {
        edges {
          node { ${PRODUCT_FIELDS} }
        }
      }
    }`);

    return data.products.edges.map(({ node }) => mapProduct(node));
  } catch (error) {
    console.error("Failed to load products:", error);
    return [];
  }
}

export async function getProduct(handle: string): Promise<Product | null> {
  try {
    const data = await shopifyFetch<{
      product: Record<string, unknown> | null;
    }>(
      `query ($handle: String!) {
        product(handle: $handle) {
          ${PRODUCT_FIELDS}
        }
      }`,
      { handle },
    );

    if (!data.product) return null;
    return mapProduct(data.product);
  } catch (error) {
    console.error(`Failed to load product "${handle}":`, error);
    return null;
  }
}

export async function createCheckout(variantId: string, quantity = 1): Promise<string> {
  const data = await shopifyFetch<{
    cartCreate: {
      cart: { checkoutUrl: string } | null;
      userErrors: { message: string }[];
    };
  }>(
    `mutation ($lines: [CartLineInput!]!) {
      cartCreate(input: { lines: $lines }) {
        cart { checkoutUrl }
        userErrors { message }
      }
    }`,
    { lines: [{ merchandiseId: variantId, quantity }] },
  );

  const errors = data.cartCreate.userErrors;
  if (errors.length > 0) {
    throw new Error(errors[0].message);
  }

  const url = data.cartCreate.cart?.checkoutUrl;
  if (!url) throw new Error("Could not create checkout");
  return url;
}

function mapProduct(node: Record<string, unknown>): Product {
  const variant = (node.variants as { edges: { node: Record<string, unknown> }[] })
    .edges[0].node;
  const price = (node.priceRange as { minVariantPrice: { amount: string; currencyCode: string } })
    .minVariantPrice;
  const image = node.featuredImage as { url: string; altText: string | null } | null;

  return {
    id: node.id as string,
    title: node.title as string,
    handle: node.handle as string,
    description: node.description as string,
    price: price.amount,
    currencyCode: price.currencyCode,
    imageUrl: image?.url ?? "",
    imageAlt: image?.altText ?? (node.title as string),
    variantId: variant.id as string,
    available: variant.availableForSale as boolean,
  };
}

export function formatPrice(amount: string, currencyCode: string): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(parseFloat(amount));
}
