import { Key } from '@/app/lib/definitions';

export default function InvoicesTable({
  keys
}: {
  keys: Array<Key>;
}) {

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  public key
                </th>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  WIF
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {keys?.map((key) => (
                <tr
                  key={key.pub}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap px-3 py-3">
                    {key.pub}
                  </td>
                  <td>{key.wif}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
