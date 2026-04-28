import { getCollection } from '@/lib/shopify';
import CollectionClient from './CollectionClient';

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const collection = await getCollection(handle);
  if (!collection) {
    return <div style={{ padding: '80px 24px' }}>Collection not found.</div>;
  }
  return <CollectionClient collection={collection} />;
}
