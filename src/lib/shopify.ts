const DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ?? '';
const TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_PUBLIC_TOKEN ?? '';
const API_VERSION = '2024-10';

function ensureEnv() {
  if (!DOMAIN || !TOKEN) {
    throw new Error(
      'Missing Shopify env vars: NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN and NEXT_PUBLIC_SHOPIFY_STOREFRONT_PUBLIC_TOKEN must be set.'
    );
  }
}

export interface ShopifyVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: { amount: string; currencyCode: string };
  selectedOptions: { name: string; value: string }[];
  image?: { url: string };
}

export interface Product {
  id: string;
  handle: string;
  title: string;
  description: string;
  tags: string[];
  price: number;
  currencyCode: string;
  imageUrl: string;
  images: string[];
  variants: ShopifyVariant[];
}

async function shopifyFetch<T>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  ensureEnv();
  const token = TOKEN;
  const endpoint = `https://${DOMAIN}/api/${API_VERSION}/graphql.json`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token,
    },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Shopify fetch failed: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  if (json.errors) {
    throw new Error(`Shopify GraphQL error: ${JSON.stringify(json.errors)}`);
  }

  return json.data as T;
}

const PRODUCT_FIELDS = `
  id
  handle
  title
  description
  tags
  priceRange { minVariantPrice { amount currencyCode } }
  featuredImage { url }
  images(first: 10) { edges { node { url } } }
  variants(first: 100) {
    edges {
      node {
        id
        title
        availableForSale
        price { amount currencyCode }
        selectedOptions { name value }
        image { url }
      }
    }
  }
`;

const COLLECTION_PRODUCT_FIELDS = `
  id
  handle
  title
  description
  tags
  priceRange { minVariantPrice { amount currencyCode } }
  featuredImage { url }
  images(first: 10) { edges { node { url } } }
  variants(first: 20) {
    edges {
      node {
        id
        title
        availableForSale
        price { amount currencyCode }
        selectedOptions { name value }
      }
    }
  }
`;

function normalizeProduct(node: Record<string, any>): Product {
  return {
    id: node.id as string,
    handle: node.handle as string,
    title: node.title as string,
    description: (node.description as string) ?? '',
    tags: (node.tags as string[]) ?? [],
    price: parseFloat(node.priceRange?.minVariantPrice?.amount ?? '0'),
    currencyCode: (node.priceRange?.minVariantPrice?.currencyCode as string) ?? 'EUR',
    imageUrl: (node.featuredImage?.url as string) ?? '',
    images: ((node.images?.edges ?? []) as { node: { url: string } }[]).map(e => e.node.url),
    variants: ((node.variants?.edges ?? []) as { node: Record<string, any> }[]).map(e => ({
      id: e.node.id as string,
      title: e.node.title as string,
      availableForSale: e.node.availableForSale as boolean,
      price: e.node.price as { amount: string; currencyCode: string },
      selectedOptions: e.node.selectedOptions as { name: string; value: string }[],
      image: e.node.image as { url: string } | undefined,
    })),
  };
}

export async function getProducts(): Promise<Product[]> {
  const data = await shopifyFetch<{ products: { edges: { node: Record<string, any> }[] } }>(
    `query GetProducts { products(first: 250) { edges { node { ${PRODUCT_FIELDS} } } } }`
  );
  return data.products.edges.map(e => normalizeProduct(e.node));
}

export interface CollectionSummary {
  id: string;
  handle: string;
  title: string;
  imageUrl: string;
}

export interface CollectionDetail {
  id: string;
  handle: string;
  title: string;
  description: string;
  imageUrl: string;
  products: Product[];
}

export async function getCollections(max = 20): Promise<CollectionSummary[]> {
  const data = await shopifyFetch<{
    collections: { edges: { node: Record<string, any> }[] };
  }>(
    `query GetCollections($first: Int!) {
      collections(first: $first) {
        edges {
          node {
            id
            handle
            title
            image { url }
            products(first: 1) {
              edges { node { featuredImage { url } } }
            }
          }
        }
      }
    }`,
    { first: max }
  );
  return data.collections.edges.map(({ node }) => ({
    id: node.id as string,
    handle: node.handle as string,
    title: node.title as string,
    imageUrl:
      (node.image?.url as string) ??
      (node.products?.edges?.[0]?.node?.featuredImage?.url as string) ??
      '',
  }));
}

export async function getCollection(handle: string): Promise<CollectionDetail | null> {
  const data = await shopifyFetch<{ collectionByHandle: Record<string, any> | null }>(
    `query GetCollection($handle: String!) {
      collectionByHandle(handle: $handle) {
        id
        handle
        title
        description
        image { url }
        products(first: 30) {
          edges { node { ${COLLECTION_PRODUCT_FIELDS} } }
        }
      }
    }`,
    { handle }
  );
  if (!data.collectionByHandle) return null;
  const node = data.collectionByHandle;
  return {
    id: node.id as string,
    handle: node.handle as string,
    title: node.title as string,
    description: (node.description as string) ?? '',
    imageUrl: (node.image?.url as string) ?? '',
    products: ((node.products?.edges ?? []) as { node: Record<string, any> }[]).map(e =>
      normalizeProduct(e.node)
    ),
  };
}

export interface CollectionSibling {
  handle: string;
  imageUrl: string;
}

export interface RecommendedProduct {
  handle: string;
  title: string;
  imageUrl: string;
  price: number;
  currencyCode: string;
  collectionTitle: string;
  collectionHandle: string;
  siblings: CollectionSibling[];
}

export async function getRecommendedProducts(
  excludeHandle: string,
  count = 4
): Promise<RecommendedProduct[]> {
  // Fetch products and collections (with sibling images) in parallel
  const [productsData, collectionsData] = await Promise.all([
    shopifyFetch<{ products: { edges: { node: Record<string, any> }[] } }>(
      `query GetRecommended($first: Int!) {
        products(first: $first) {
          edges {
            node {
              handle
              title
              featuredImage { url }
              priceRange { minVariantPrice { amount currencyCode } }
            }
          }
        }
      }`,
      { first: count + 10 }
    ),
    shopifyFetch<{ collections: { edges: { node: Record<string, any> }[] } }>(
      `query GetCollectionsForRec($first: Int!) {
        collections(first: $first) {
          edges {
            node {
              handle
              title
              products(first: 30) {
                edges {
                  node {
                    handle
                    featuredImage { url }
                  }
                }
              }
            }
          }
        }
      }`,
      { first: 20 }
    ).catch(() => ({ collections: { edges: [] } })),
  ]);

  // Build handle → collectionTitle map AND handle → siblings list
  const handleToCollection: Record<string, string> = {};
  const handleToCollectionHandle: Record<string, string> = {};
  const handleToSiblings: Record<string, CollectionSibling[]> = {};

  for (const { node: col } of collectionsData.collections.edges) {
    const colProducts = ((col.products?.edges ?? []) as { node: Record<string, any> }[])
      .map(e => ({
        handle: e.node.handle as string,
        imageUrl: (e.node.featuredImage?.url as string) ?? '',
      }));

    for (const p of colProducts) {
      if (!handleToCollection[p.handle]) {
        handleToCollection[p.handle] = col.title as string;
        handleToCollectionHandle[p.handle] = col.handle as string;
        // Siblings = other products in the same collection (excluding self)
        handleToSiblings[p.handle] = colProducts.filter(s => s.handle !== p.handle);
      }
    }
  }

  return productsData.products.edges
    .map(({ node }) => ({
      handle: node.handle as string,
      title: node.title as string,
      imageUrl: (node.featuredImage?.url as string) ?? '',
      price: parseFloat(node.priceRange?.minVariantPrice?.amount ?? '0'),
      currencyCode: (node.priceRange?.minVariantPrice?.currencyCode as string) ?? 'EUR',
      collectionTitle: handleToCollection[node.handle as string] ?? '',
      collectionHandle: handleToCollectionHandle[node.handle as string] ?? '',
      siblings: handleToSiblings[node.handle as string] ?? [],
    }))
    .filter(p => p.handle !== excludeHandle)
    .slice(0, count);
}

export async function getProduct(handle: string): Promise<Product | null> {
  const data = await shopifyFetch<{ productByHandle: Record<string, any> | null }>(
    `query GetProduct($handle: String!) { productByHandle(handle: $handle) { ${PRODUCT_FIELDS} } }`,
    { handle }
  );
  return data.productByHandle ? normalizeProduct(data.productByHandle) : null;
}
