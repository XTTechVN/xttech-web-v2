import { ITableColumn } from './types';

export function TableHeader<T>({
  columns,
  select,
}: {
  columns: ITableColumn<T>[];
  select: boolean;
}) {
  return (
    <thead className="bg-primary text-white">
      <tr className="border-b border-cyan-600/40">
        {/* Render checkbox */}
        {select && (
          <th className="border-b border-cyan-600/40 px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider h-11 text-white/90 w-12 min-w-[48px] text-center">
            <input type="checkbox" className="accent-primary" />
          </th>
        )}

        {/* Render columns */}
        {columns.map((column: ITableColumn<T>) => {
          const isSticky = column.sticky;
          const leftOffset = isSticky ? (select ? '47px' : '0px') : undefined;

          return (
            <th
              className={`border-b border-cyan-600/40 px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider h-11 text-white whitespace-normal wrap-break-word hover:text-white transition-colors ${
                column.maxWidth ? 'truncate' : ''
              } ${
                isSticky ? 'sticky z-20 bg-primary border-r md:border-r-0 border-cyan-600/40' : ''
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
