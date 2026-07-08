import { getProducts } from '@/lib/shopify';
import CollectionLandingClient from './CollectionLandingClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'The Collection — TONET Paris',
  description: 'A selection preserved within the House.',
};

export default async function CollectionLandingPage() {
  const products = await getProducts();
  return <CollectionLandingClient products={products} />;
}
