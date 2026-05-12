'use client';
import { usePathname } from 'next/navigation';
import FindStore from './FindStore';

export default function FindStoreConditional() {
  const pathname = usePathname();
  if (pathname.startsWith('/product/')) return null;
  return <FindStore />;
}
