import { getProducts, getProduct } from '@/lib/shopify';
import ProductClient from './ProductClient';

export async function generateStaticParams() {
  if (!process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || !process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_PUBLIC_TOKEN) {
    return [];
  }
  const products = await getProducts();
  return products.map((p) => ({ id: p.handle }));
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return <div style={{ padding: '80px 24px' }}>Product not found.</div>;
  return <ProductClient product={product} />;
}
