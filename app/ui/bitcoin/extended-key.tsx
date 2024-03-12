'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { useState } from "react";

export default function ExtendedKey() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [error, setError] = useState('');


  const handleSearch = useDebouncedCallback((key) => {
    const params = new URLSearchParams(searchParams);
    if (key) {
      if (key.length == 111) {
        params.set('key', key);
        setError("");
      } else {
        setError("Invalid key length. Must be 111 characters.");
      }
    } else {
      params.delete('key');
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <fieldset className="mb4 flex-1">
      <div className="relative flex flex-1 flex-shrink-0">
        <label htmlFor="extendedKey" className="sr-only">
          Enter extended key
        </label>
        <input
          id="extendedKey"
          className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
          placeholder="Enter your extended key"
          onChange={(e) => handleSearch(e.target.value)}
          defaultValue={searchParams.get('key')?.toString()}
        />
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
      </div>
      <div id="key-error" aria-live="polite" aria-atomic="true" className="block">
        {error.length > 0 &&
          <p className="mt-2 text-sm text-red-500">
            {error}
          </p>
        }
      </div>
    </fieldset>
  );
}
