import { ITableColumn } from './types';

export function TableBody<T>({
  data,
  columns,
  select,
  onRowClick,
}: {
  data: T[];
  columns: ITableColumn<T>[];
  select: boolean;
  onRowClick?: (row: T) => void;
}) {
  return (
    <tbody>
      {data?.map((row: T, index: number) => {
        return (
          <tr
            key={index}
            onClick={() => onRowClick?.(row)}
            className={`group hover:bg-slate-50/60 border-b border-slate-200 ${onRowClick ? 'cursor-pointer' : ''}`}
          >
            {/* Render checkbox */}
            {select && (
              <td className="h-12 px-4 py-2 text-center sticky left-0 z-10 bg-white group-hover:bg-slate-50/60 border-r border-slate-200 transition-colors">
                <input type="checkbox" />
              </td>
            )}

            {/* Render columns */}
            {columns.map((column) => {
              const isSticky = column.sticky;
              const leftOffset = isSticky ? (select ? '47px' : '0px') : undefined;

              return (
                <td
                  key={column.key}
                  className={`h-12 px-4 py-2 text-xs font-medium text-slate-600 whitespace-normal wrap-break-word ${column.maxWidth ? 'truncate' : ''} ${isSticky
                      ? 'sticky z-10 bg-white group-hover:bg-slate-50/60 border-r md:border-r-0 border-slate-200 transition-colors'
                      : ''
                    }`}
                  style={{
                    minWidth: column.minWidth,
                    maxWidth: column.maxWidth,
                    ...(isSticky ? { left: leftOffset } : {}),
                  }}
                >
                  {column.cell(row, index)}
                </td>
              );
            })}
          </tr>
        );
      })}
    </tbody>
  );
}
