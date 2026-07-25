#!/usr/bin/env python3
"""Upload Mitti Ganesha products to Shopify via Admin API."""

import json
import mimetypes
import os
import sys
import urllib.request
import urllib.parse
from pathlib import Path

SHOP = os.environ.get("SHOPIFY_STORE_DOMAIN", "")
CLIENT_ID = os.environ.get("SHOPIFY_CLIENT_ID", "")
CLIENT_SECRET = os.environ.get("SHOPIFY_CLIENT_SECRET", "")
API_VERSION = "2025-01"

if not SHOP or not CLIENT_ID or not CLIENT_SECRET:
    print(
        "Missing env vars. Set SHOPIFY_STORE_DOMAIN, SHOPIFY_CLIENT_ID, "
        "and SHOPIFY_CLIENT_SECRET in .env.local",
        file=sys.stderr,
    )
    sys.exit(1)

ASSETS = Path(
    "/Users/akshanshshrivastava/.cursor/projects/"
    "Users-akshanshshrivastava-Documents-mittiganesha/assets"
)

PRODUCTS = [
    {
        "image": "Screenshot_2026-07-26_at_12.55.46_AM-43719d9b-f1e0-4dc0-b7e2-bd3ba29ddde6.png",
        "title": "Classic Seated Mitti Ganesha",
        "price": "499.00",
        "stock": 25,
        "description": (
            "<p>Handcrafted 6-inch eco-friendly clay Ganesha idol in a classic seated "
            "blessing pose. Made from natural mitti that dissolves safely in water after "
            "visarjan. Perfect for home puja and Ganesh Chaturthi.</p>"
        ),
        "tags": ["mitti-ganesha", "eco-friendly", "6-inch", "clay-idol", "visarjan"],
    },
    {
        "image": "Screenshot_2026-07-26_at_12.57.06_AM-be8b054c-f967-4b10-8818-ceca5da4f7d5.png",
        "title": "Prabhavali Mitti Ganesha",
        "price": "549.00",
        "stock": 20,
        "description": (
            "<p>Elegant 6-inch mitti Ganesha with an ornate prabhavali backrest. "
            "Crafted from natural clay with traditional red tilak details. "
            "Eco-friendly and water-dissolvable.</p>"
        ),
        "tags": ["mitti-ganesha", "prabhavali", "eco-friendly", "6-inch", "handcrafted"],
    },
    {
        "image": "Screenshot_2026-07-26_at_12.56.47_AM-0fd9297f-8947-4f55-b50c-7da803ea76fc.png",
        "title": "Royal Chaturbhuj Mitti Ganesha",
        "price": "549.00",
        "stock": 20,
        "description": (
            "<p>6-inch four-armed mitti Ganesha on a decorative octagonal base. "
            "Natural clay finish with intricate crown and ornament details. "
            "Dissolves in water — kind to rivers and soil.</p>"
        ),
        "tags": ["mitti-ganesha", "chaturbhuj", "eco-friendly", "6-inch", "natural-clay"],
    },
    {
        "image": "Screenshot_2026-07-26_at_12.56.03_AM-99bcf1cb-9876-4fe7-ac0c-d6766b4920a3.png",
        "title": "Artisan Blessing Mitti Ganesha",
        "price": "499.00",
        "stock": 25,
        "description": (
            "<p>Artisan-made 6-inch mitti Ganesha in abhaya mudra (blessing pose). "
            "Unpainted natural clay with minimal eco-safe accents. "
            "Ideal for conscious celebrations and daily worship.</p>"
        ),
        "tags": ["mitti-ganesha", "artisan", "eco-friendly", "6-inch", "blessing-pose"],
    },
    {
        "image": "Screenshot_2026-07-26_at_12.55.41_AM-2c2424a9-8dad-4bb7-a3d7-7884df2c37c2.png",
        "title": "Terracotta Mitti Ganesha",
        "price": "449.00",
        "stock": 30,
        "description": (
            "<p>Traditional 6-inch terracotta-style mitti Ganesha idol. "
            "Hand-sculpted from natural clay, fully biodegradable. "
            "A beautiful, earth-friendly choice for Ganesh Chaturthi.</p>"
        ),
        "tags": ["mitti-ganesha", "terracotta", "eco-friendly", "6-inch", "ganesh-chaturthi"],
    },
]


def get_token() -> str:
    data = urllib.parse.urlencode(
        {
            "grant_type": "client_credentials",
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
        }
    ).encode()
    req = urllib.request.Request(
        f"https://{SHOP}/admin/oauth/access_token",
        data=data,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )
    with urllib.request.urlopen(req) as resp:
        body = json.loads(resp.read())
    token = body.get("access_token")
    if not token:
        raise RuntimeError(f"Token exchange failed: {body}")
    return token


def graphql(token: str, query: str, variables: dict | None = None) -> dict:
    payload = {"query": query}
    if variables:
        payload["variables"] = variables
    req = urllib.request.Request(
        f"https://{SHOP}/admin/api/{API_VERSION}/graphql.json",
        data=json.dumps(payload).encode(),
        headers={
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": token,
        },
        method="POST",
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())


def get_location_id(token: str) -> str:
    result = graphql(
        token,
        "{ locations(first: 1) { edges { node { id } } } }",
    )
    edges = result["data"]["locations"]["edges"]
    if not edges:
        raise RuntimeError("No inventory location found")
    return edges[0]["node"]["id"]


def staged_upload(token: str, file_path: Path) -> str:
    mime_type = mimetypes.guess_type(file_path.name)[0] or "image/png"
    mutation = """
    mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
      stagedUploadsCreate(input: $input) {
        stagedTargets {
          url
          resourceUrl
          parameters { name value }
        }
        userErrors { field message }
      }
    }
    """
    result = graphql(
        token,
        mutation,
        {
            "input": [
                {
                    "filename": file_path.name,
                    "mimeType": mime_type,
                    "httpMethod": "POST",
                    "resource": "PRODUCT_IMAGE",
                }
            ]
        },
    )
    target = result["data"]["stagedUploadsCreate"]["stagedTargets"][0]
    errors = result["data"]["stagedUploadsCreate"]["userErrors"]
    if errors:
        raise RuntimeError(f"Staged upload errors: {errors}")

    boundary = "----ShopifyUploadBoundary"
    body_parts = []
    for param in target["parameters"]:
        body_parts.append(f"--{boundary}\r\n")
        body_parts.append(
            f'Content-Disposition: form-data; name="{param["name"]}"\r\n\r\n'
        )
        body_parts.append(f'{param["value"]}\r\n')

    file_bytes = file_path.read_bytes()
    body_parts.append(f"--{boundary}\r\n")
    body_parts.append(
        f'Content-Disposition: form-data; name="file"; filename="{file_path.name}"\r\n'
    )
    body_parts.append(f"Content-Type: {mime_type}\r\n\r\n")
    body = (
        "".join(body_parts).encode()
        + file_bytes
        + f"\r\n--{boundary}--\r\n".encode()
    )

    req = urllib.request.Request(
        target["url"],
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
        method="POST",
    )
    with urllib.request.urlopen(req) as resp:
        if resp.status not in (200, 201, 204):
            raise RuntimeError(f"Upload failed with status {resp.status}")

    return target["resourceUrl"]


def create_product(
    token: str, product: dict, resource_url: str, location_id: str
) -> dict:
    create_mutation = """
    mutation productCreate($product: ProductCreateInput!, $media: [CreateMediaInput!]) {
      productCreate(product: $product, media: $media) {
        product {
          id
          title
          handle
          status
          variants(first: 1) {
            edges {
              node {
                id
                price
                inventoryQuantity
                inventoryItem { id }
              }
            }
          }
        }
        userErrors { field message }
      }
    }
    """
    create_vars = {
        "product": {
            "title": product["title"],
            "descriptionHtml": product["description"],
            "vendor": "Mitti Ganesha",
            "productType": "Eco-Friendly Ganesha Idol",
            "tags": product["tags"],
            "status": "ACTIVE",
        },
        "media": [
            {
                "originalSource": resource_url,
                "mediaContentType": "IMAGE",
                "alt": product["title"],
            }
        ],
    }
    result = graphql(token, create_mutation, create_vars)
    errors = result.get("data", {}).get("productCreate", {}).get("userErrors", [])
    if errors:
        raise RuntimeError(f"Product create errors for {product['title']}: {errors}")
    if "errors" in result:
        raise RuntimeError(f"GraphQL errors: {result['errors']}")

    created = result["data"]["productCreate"]["product"]
    variant = created["variants"]["edges"][0]["node"]

    price_mutation = """
    mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants { id price }
        userErrors { field message }
      }
    }
    """
    price_result = graphql(
        token,
        price_mutation,
        {
            "productId": created["id"],
            "variants": [{"id": variant["id"], "price": product["price"]}],
        },
    )
    price_errors = price_result["data"]["productVariantsBulkUpdate"]["userErrors"]
    if price_errors:
        raise RuntimeError(f"Price update errors: {price_errors}")

    inventory_mutation = """
    mutation inventorySetQuantities($input: InventorySetQuantitiesInput!) {
      inventorySetQuantities(input: $input) {
        userErrors { field message }
      }
    }
    """
    inv_result = graphql(
        token,
        inventory_mutation,
        {
            "input": {
                "name": "available",
                "reason": "correction",
                "ignoreCompareQuantity": True,
                "quantities": [
                    {
                        "inventoryItemId": variant["inventoryItem"]["id"],
                        "locationId": location_id,
                        "quantity": product["stock"],
                    }
                ],
            }
        },
    )
    inv_errors = inv_result["data"]["inventorySetQuantities"]["userErrors"]
    if inv_errors:
        raise RuntimeError(f"Inventory errors: {inv_errors}")

    created["variants"]["edges"][0]["node"]["price"] = product["price"]
    created["variants"]["edges"][0]["node"]["inventoryQuantity"] = product["stock"]
    return created


def main() -> int:
    print("Getting Admin API token...")
    token = get_token()

    print("Fetching inventory location...")
    location_id = get_location_id(token)
    print(f"Location: {location_id}")

    created = []
    for product in PRODUCTS:
        image_path = ASSETS / product["image"]
        if not image_path.exists():
            print(f"SKIP missing image: {image_path}", file=sys.stderr)
            continue

        print(f"\nUploading image for: {product['title']}...")
        resource_url = staged_upload(token, image_path)

        print(f"Creating product: {product['title']} @ ₹{product['price']}...")
        result = create_product(token, product, resource_url, location_id)
        created.append(result)
        print(f"  ✓ Created: {result['title']} ({result['handle']})")

    print(f"\nDone — {len(created)} products created.")
    for p in created:
        variant = p["variants"]["edges"][0]["node"]
        print(
            f"  - {p['title']}: ₹{variant['price']}, "
            f"stock {variant['inventoryQuantity']}, status {p['status']}"
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
