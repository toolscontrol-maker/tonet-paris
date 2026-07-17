import { Suspense } from 'react';
import ArchiveClient from './ArchiveClient';

export const metadata = { title: 'Archive — TONET TORRENTINNI' };

export default function ArchivePage() {
  return (
    <Suspense>
      <ArchiveClient />
    </Suspense>
  );
}
