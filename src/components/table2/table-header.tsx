import { ITableColumn } from './types';

export function TableHeader<T>({ columns, select }: { columns: ITableColumn<T>[]; select: boolean }) {
  return (
    <thead className="bg-gray-100">
      <tr className="border-b border-gray-300">
        {/* Render checkbox */}
        {select && (
          <th className="border-b border-gray-300 px-4 py-2 text-left text-sm h-12 text-gray-700 w-12 min-w-[48px] text-center">
            <input type="checkbox" />
          </th>
        )}

        {/* Render columns */}
        {columns.map((column: ITableColumn<T>) => {
          const isSticky = column.sticky;
          const leftOffset = isSticky ? (select ? '47px' : '0px') : undefined;

          return (
            <th
              className={`border-b border-gray-300 px-4 py-2 text-left text-sm h-12 text-gray-700 whitespace-normal wrap-break-word hover:text-bk-black ${
                column.maxWidth ? 'truncate' : ''
              } ${
                isSticky
                  ? 'sticky z-20 bg-gray-100 border-r md:border-r-0 border-gray-300'
                  : ''
              }`}
              style={{
                minWidth: column.minWidth,
                maxWidth: column.maxWidth,
                ...(isSticky ? { left: leftOffset } : {}),
              }}
              key={column.key}
            >
              {column.label}
            </th>
          );
        })}
      </tr>
    </thead>
  );
}
