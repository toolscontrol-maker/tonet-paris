import { getCollection, getNewArrivals, getProducts } from '@/lib/shopify';
import CollectionClient from './CollectionClient';

export const dynamic = 'force-dynamic';

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;

  if (handle === 'all' || handle === 'all-garments') {
    const products = await getProducts();
    const collection = {
      id: 'all-garments',
      handle: 'all-garments',
      title: 'ALL GARMENTS',
      description: 'Explore all garments in our archive',
      imageUrl: '',
      products,
    };
    return <CollectionClient collection={collection} />;
  }

  if (handle === 'new-arrivals') {
    const products = await getNewArrivals(50);
    const collection = {
      id: 'new-arrivals',
      handle: 'new-arrivals',
      title: 'New Arrivals',
      description: 'Discover our latest arrivals',
      imageUrl: '',
      products,
    };
    return <CollectionClient collection={collection} />;
  }

  const collection = await getCollection(handle);
  if (!collection) {
    return <div style={{ padding: '80px 24px' }}>Collection not found.</div>;
  }
  return <CollectionClient collection={collection} />;
}
