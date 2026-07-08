import { getProducts, getProduct } from '@/lib/shopify';
import ProductClient from './ProductClient';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return <div style={{ padding: '80px 24px' }}>Product not found.</div>;
  
  // Find related products by tag
  // We filter products that share at least one tag with the current product,
  // excluding all variants of the current product itself (by comparing base handle).
  const allProducts = await getProducts();
  const relatedProductsByTag = allProducts.filter(p => 
    p.handle.split('?')[0] !== product.handle && 
    p.tags && product.tags && p.tags.some(t => product.tags.includes(t))
  );

  return (
    <Suspense fallback={<div style={{ padding: '80px 24px', textAlign: 'center' }}>Loading product details...</div>}>
      <ProductClient product={product} relatedProductsByTag={relatedProductsByTag} />
    </Suspense>
  );
}
