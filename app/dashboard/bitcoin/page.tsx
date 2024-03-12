// copied and edited from invoices/page.tsx

import ExtendedKey from '@/app/ui/bitcoin/extended-key';
// import Table from '@/app/ui/invoices/table';
import { lusitana } from '@/app/ui/fonts';
// import { InvoicesTableSkeleton } from '@/app/ui/skeletons';
import { Suspense } from 'react';
// import { fetchInvoicesPages } from '@/app/lib/data';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BIP32',
};

// What do I need here?
// - Input for extended key
// - table to display derived keys

export default async function Page({
  searchParams
}: {
  searchParams?: {
    query?: string;
  };
}) {
  const query = searchParams?.query || '';

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Derived Keys</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <ExtendedKey />
      </div>
    </div>
  );
}
