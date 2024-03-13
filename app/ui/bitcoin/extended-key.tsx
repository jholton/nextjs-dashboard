'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { useState } from "react";
import Table from '@/app/ui/bitcoin/table';
import bs58check from 'bs58check';
import bs58 from 'bs58';
import secp256k1 from 'secp256k1';

import {
  createHmac,
  createHash
} from 'crypto';
import { Key } from '@/app/lib/definitions';

export default function ExtendedKey() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [error, setError] = useState('');
  const [keys, setKeys] = useState<Key[]>([]);


  const handleSearch = useDebouncedCallback((key) => {
    const params = new URLSearchParams(searchParams);
    if (key) {
      if (key.length == 111) {
        params.set('key', key);
        setError("");
        populate(key)
      } else {
        setError("Invalid key length. Must be 111 characters.");
      }
    } else {
      params.delete('key');
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  function populate(xprv: string) {
    const rawXprv = bs58check.decode(xprv)
    const deserializedKey = deserializeKey(rawXprv)
    const chaincode = Buffer.from(deserializedKey["chainCode"], 'hex')
    let key = Buffer.from(deserializedKey["keyData"], 'hex')
    if (key[0] == 0) {
      key = key.slice(1)
    }
    const privs = getWalletPrivs(key, chaincode)

    let pubs : Key[] = [];
    privs.forEach(priv => {
      let hexPriv = Buffer.from(priv).toString('hex')
      hexPriv = `ef${hexPriv}01`
      const hash1 = createHash('sha256').update(Buffer.from(hexPriv, 'hex')).digest();
      const hash2 = createHash('sha256').update(hash1).digest();
      const checksum = hash2.slice(0, 4).toString('hex');
      hexPriv = `${hexPriv}${checksum}`;
      const wif = bs58.encode(Buffer.from(hexPriv, 'hex'));
      const pub = getPubFromPriv(priv);
      pubs.push({
        "pub": Buffer.from(pub).toString('hex'),
        "wif": wif
      });
      setKeys(pubs);
    })



  }
  const range = (n: number) => Array.from(Array(n).keys())

  function getWalletPrivs(key: Uint8Array, chaincode: Uint8Array, path: [number, boolean][] = [[84, true], [1, true], [0, true], [0, false]]) {
    let walletPrivs:Uint8Array[] = [];
    let currentKey = key;
    path.forEach(([index, hardened]) => {
      const result = derivePrivChild(currentKey, chaincode, index, hardened);
      currentKey = result.key;
      chaincode = result.chaincode;
    });

    range(30).map(i => {
      const result = derivePrivChild(currentKey, chaincode, i, false);
      walletPrivs.push(result.key);
    })
    return walletPrivs;
  }

  function derivePrivChild(key: Uint8Array, chaincode: Uint8Array, index: number, hardened: boolean) {
    let data;
    if (hardened) {
      index += 0x80000000;
      data = Buffer.concat([Buffer.from([0]), Buffer.from(key), Buffer.from(index.toString(16), 'hex')]);
    } else {
      index += 0x00000000;
      const pub = getPubFromPriv(key);
      let indexBuff = Buffer.alloc(4);
      indexBuff.writeUInt32BE(index)
      data = Buffer.concat([pub, indexBuff]);
    }
    const hmac = createHmac('sha512', chaincode).update(data).digest();
    const secp256k1Order = BigInt('115792089237316195423570985008687907852837564279074904382605163141518161494337')
    const leftBytes = hmac.subarray(0, 32)
    const leftInt = BigInt('0x' + Buffer.from(leftBytes).toString('hex'));
    const newChaincode = hmac.subarray(32);

    const newKey = (BigInt(`0x${Buffer.from(key).toString('hex')}`) + leftInt) % secp256k1Order;
    const newKeyBytes = Buffer.from(newKey.toString(16).padStart(64, '0'), 'hex');
    return {"key": newKeyBytes, "key_hex": newKey.toString(16), "chaincode": newChaincode}
  }

  function getPubFromPriv(key: Uint8Array) {
    const pubKey = secp256k1.publicKeyCreate(key)
    return pubKey;
  }


  function deserializeKey(xprv: Uint8Array) {
    const hex = Buffer.from(xprv).toString('hex');
    return {
        "version": hex.substring(0, 8),
        "depth": hex.substring(8, 10),
        "fingerprint": hex.substring(10, 18),
        "childNmber": hex.substring(18, 26),
        "chainCode": hex.substring(26, 90),
        "keyData": hex.substring(90,)
    }
  }

  return (
    <fieldset className="mb4 flex-1">
      <div className="block p-2">Enter extended key (testnet)</div>
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
      <div className="block p-2">Uses m/84&apos;/1&apos;/0&apos;/0 derivation path</div>
      <div id="key-error" aria-live="polite" aria-atomic="true" className="block">
        {error.length > 0 &&
          <p className="mt-2 text-sm text-red-500">
            {error}
          </p>
        }
      </div>
      <Table keys={keys} />
    </fieldset>
  );
}
