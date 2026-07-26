import { ITableColumn } from './types';

export function TableBody<T>({ data, columns, select }: { data: T[]; columns: ITableColumn<T>[]; select: boolean }) {
  return (
    <tbody>
      {data?.map((row: T, index: number) => {
        return (
          <tr key={index} className="group hover:bg-slate-50/60 border-b border-slate-200">
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
                  className={`h-12 px-4 py-2 text-sm font-medium text-slate-600 whitespace-normal wrap-break-word ${column.maxWidth ? 'truncate' : ''} ${
                    isSticky
                      ? 'sticky z-10 bg-white group-hover:bg-slate-50/60 border-r md:border-r-0 border-slate-200 transition-colors'
                      : ''
                  }`}
                  style={{
                    minWidth: column.minWidth,
                    maxWidth: column.maxWidth,
                    ...(isSticky ? { left: leftOffset } : {}),
                  }}
                >
                  {column.cell(row)}
                </td>
              );
            })}
          </tr>
        );
      })}
    </tbody>
  );
}
