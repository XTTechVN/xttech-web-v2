import { ITableColumn } from './types';

export function TableHeader<T>({
  columns,
  select,
}: {
  columns: ITableColumn<T>[];
  select: boolean;
}) {
  return (
    <thead className="bg-slate-200 text-slate-700">
      <tr className="border-b border-slate-200 bg-gray-100">
        {/* Render checkbox */}
        {select && (
          <th className="border-b border-slate-200 px-4 py-3 text-center text-xs font-semibold tracking-wider h-11 text-slate-600 w-12 min-w-[48px]">
            <input type="checkbox" className="accent-primary" />
          </th>
        )}

        {/* Render columns */}
        {columns.map((column: ITableColumn<T>) => {
          const isSticky = column.sticky;
          const leftOffset = isSticky ? (select ? '47px' : '0px') : undefined;

          return (
            <th
              className={`border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold tracking-wider h-11 text-slate-600 whitespace-normal wrap-break-word transition-colors ${column.maxWidth ? 'truncate' : ''
                } ${isSticky ? 'sticky z-20 bg-slate-500 border-r md:border-r-0 border-slate-200' : ''
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
