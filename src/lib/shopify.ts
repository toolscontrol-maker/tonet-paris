const DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ?? '';
const TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_PUBLIC_TOKEN ?? '';
const API_VERSION = '2024-10';

function ensureEnv(): boolean {
  if (!DOMAIN || !TOKEN) {
    console.warn(
      'WARNING: Missing Shopify env vars: NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN and NEXT_PUBLIC_SHOPIFY_STOREFRONT_PUBLIC_TOKEN must be set.'
    );
    return false;
  }
  return true;
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
  createdAt: string;
  price: number;
  currencyCode: string;
  imageUrl: string;
  images: string[];
  variants: ShopifyVariant[];
  collectionHandles?: string[];
}

async function shopifyFetch<T>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  if (!ensureEnv()) {
    // Return empty mock structure to allow build compilation to pass
    return {
      products: { edges: [] },
      collection: { products: { edges: [] } },
      collections: { edges: [] },
      product: null
    } as unknown as T;
  }
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
  createdAt
  priceRange { minVariantPrice { amount currencyCode } }
  featuredImage { url }
  images(first: 10) { edges { node { url } } }
  collections(first: 10) { edges { node { handle } } }
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
  createdAt
  priceRange { minVariantPrice { amount currencyCode } }
  featuredImage { url }
  images(first: 10) { edges { node { url } } }
  collections(first: 10) { edges { node { handle } } }
  variants(first: 20) {
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

function normalizeProduct(node: Record<string, any>): Product {
  return {
    id: node.id as string,
    handle: node.handle as string,
    title: node.title as string,
    description: (node.description as string) ?? '',
    tags: (node.tags as string[]) ?? [],
    createdAt: (node.createdAt as string) ?? '',
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
    collectionHandles: ((node.collections?.edges ?? []) as { node: { handle: string } }[]).map(e => e.node.handle),
  };
}

export function deduplicateProductsByTitle(products: Product[]): Product[] {
  // Sort the products from newest to oldest (by createdAt descending)
  const result = [...products];
  result.sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return timeB - timeA;
  });
  return result;
}

export function splitProductsByColor(products: Product[]): Product[] {
  const result: Product[] = [];
  for (const p of products) {
    // Find all color options
    const colors = new Set<string>();
    for (const v of p.variants) {
      const colorOpt = v.selectedOptions.find(
        o => o.name.toLowerCase() === 'color' || o.name.toLowerCase() === 'colour'
      );
      if (colorOpt) {
        colors.add(colorOpt.value);
      }
    }

    if (colors.size > 1) {
      for (const color of colors) {
        const colorVariants = p.variants.filter(v =>
          v.selectedOptions.some(
            o => (o.name.toLowerCase() === 'color' || o.name.toLowerCase() === 'colour') && o.value === color
          )
        );

        const variantImages = colorVariants
          .map(v => v.image?.url)
          .filter((url): url is string => !!url);
        const uniqueVariantImages = Array.from(new Set(variantImages));
        const otherImages = p.images.filter(img => !uniqueVariantImages.includes(img));
        const newImages = [...uniqueVariantImages, ...otherImages];
        const newImageUrl = newImages[0] || p.imageUrl;
        
        // Use the first variant's price if available
        const newPrice = colorVariants.length > 0 ? parseFloat(colorVariants[0].price.amount) : p.price;

        result.push({
          ...p,
          id: `${p.id}-${color}`,
          handle: `${p.handle}?color=${encodeURIComponent(color)}`,
          title: `${p.title} - ${color}`,
          price: newPrice,
          imageUrl: newImageUrl,
          images: newImages,
          variants: colorVariants,
        });
      }
    } else {
      result.push(p);
    }
  }
  return result;
}

export async function getProducts(): Promise<Product[]> {
  const data = await shopifyFetch<{ products: { edges: { node: Record<string, any> }[] } }>(
    `query GetProducts { products(first: 250, query: "available_for_sale:true", sortKey: CREATED_AT, reverse: true) { edges { node { ${PRODUCT_FIELDS} } } } }`
  );
  return deduplicateProductsByTitle(data.products.edges.map(e => normalizeProduct(e.node)));
}

export async function getNewArrivals(first = 50): Promise<Product[]> {
  const data = await shopifyFetch<{ products: { edges: { node: Record<string, any> }[] } }>(
    `query GetNewArrivals($first: Int!) {
      products(first: $first, sortKey: CREATED_AT, reverse: true, query: "available_for_sale:true") {
        edges {
          node {
            ${PRODUCT_FIELDS}
          }
        }
      }
    }`,
    { first }
  );
  return deduplicateProductsByTitle(data.products.edges.map(e => normalizeProduct(e.node)));
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
        products(first: 250) {
          edges { node { ${COLLECTION_PRODUCT_FIELDS} } }
        }
      }
    }`,
    { handle }
  );
  if (!data.collectionByHandle) return null;
  const node = data.collectionByHandle;

  let products = ((node.products?.edges ?? []) as { node: Record<string, any> }[]).map(e =>
    normalizeProduct(e.node)
  );

  // If the collection exists but has no products assigned in Shopify admin,
  // fall back to showing all available products so the page is never empty.
  if (products.length === 0) {
    products = await getProducts();
    return {
      id: node.id as string,
      handle: node.handle as string,
      title: node.title as string,
      description: (node.description as string) ?? '',
      imageUrl: (node.image?.url as string) ?? '',
      products,
    };
  }

  return {
    id: node.id as string,
    handle: node.handle as string,
    title: node.title as string,
    description: (node.description as string) ?? '',
    imageUrl: (node.image?.url as string) ?? '',
    products: deduplicateProductsByTitle(products),
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
        products(first: $first, query: "available_for_sale:true") {
          edges {
            node {
              ${PRODUCT_FIELDS}
            }
          }
        }
      }`,
      { first: 50 }
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

  const normalizedProducts = productsData.products.edges.map(e => normalizeProduct(e.node));
  const deduplicatedProducts = deduplicateProductsByTitle(normalizedProducts);

  const mapped = deduplicatedProducts
    .map(p => {
      const baseHandle = p.handle.split('?')[0];
      return {
        handle: p.handle,
        title: p.title,
        imageUrl: p.imageUrl,
        price: p.price,
        currencyCode: p.currencyCode,
        collectionTitle: handleToCollection[baseHandle] ?? '',
        collectionHandle: handleToCollectionHandle[baseHandle] ?? '',
        siblings: handleToSiblings[baseHandle] ?? [],
      };
    })
    .filter(p => p.handle !== excludeHandle);

  // Shuffle the pool for true randomness
  for (let i = mapped.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [mapped[i], mapped[j]] = [mapped[j], mapped[i]];
  }

  return mapped.slice(0, count);
}

export async function searchProducts(query: string, count = 8): Promise<Product[]> {
  if (!query.trim()) return [];
  const data = await shopifyFetch<{ products: { edges: { node: Record<string, any> }[] } }>(
    `query SearchProducts($query: String!, $first: Int!) {
      products(first: $first, query: $query) {
        edges { node { ${PRODUCT_FIELDS} } }
      }
    }`,
    { query: query.trim(), first: count }
  );
  return deduplicateProductsByTitle(data.products.edges.map(e => normalizeProduct(e.node)));
}

export async function getProduct(handle: string): Promise<Product | null> {
  const data = await shopifyFetch<{ productByHandle: Record<string, any> | null }>(
    `query GetProduct($handle: String!) { productByHandle(handle: $handle) { ${PRODUCT_FIELDS} } }`,
    { handle }
  );
  return data.productByHandle ? normalizeProduct(data.productByHandle) : null;
}

export function getOptimizedImageUrl(url: string, width: number = 800): string {
  if (!url) return '';
  if (!url.includes('cdn.shopify.com')) return url;
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.set('width', width.toString());
    urlObj.searchParams.set('format', 'webp');
    urlObj.searchParams.set('quality', '90');
    return urlObj.toString();
  } catch (e) {
    return url;
  }
}
