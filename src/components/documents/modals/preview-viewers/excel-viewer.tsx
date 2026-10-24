'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AlertCircle, Download, Info, Loader2, Search, Table as TableIcon } from 'lucide-react';

const MAX_EXCEL_ROWS = 500;

const getExcelColLabel = (index: number): string => {
  let label = '';
  let temp = index;
  while (temp >= 0) {
    label = String.fromCharCode((temp % 26) + 65) + label;
    temp = Math.floor(temp / 26) - 1;
  }
  return label;
};

interface ExcelViewerProps {
  buffer: ArrayBuffer | null;
  isLoading: boolean;
  error: string | null;
  onDownload: () => void;
}

interface ExcelSheet {
  name: string;
  rows: unknown[][];
  maxCols: number;
  totalRows: number;
}

export const ExcelViewer: React.FC<ExcelViewerProps> = ({
  buffer,
  isLoading,
  error: parentError,
  onDownload,
}) => {
  const [sheets, setSheets] = useState<ExcelSheet[]>([]);
  const [activeSheetIdx, setActiveSheetIdx] = useState(0);
  const [search, setSearch] = useState('');
  const [isParsing, setIsParsing] = useState(Boolean(buffer));
  const [parseError, setParseError] = useState<string | null>(null);
  const [prevBuffer, setPrevBuffer] = useState<ArrayBuffer | null>(buffer);

  if (buffer !== prevBuffer) {
    setPrevBuffer(buffer);
    setIsParsing(Boolean(buffer));
    setParseError(null);
  }

  useEffect(() => {
    if (!buffer) return;
    let isMounted = true;

    const parse = async () => {
      try {
        const XLSX = await import('xlsx');
        const workbook = XLSX.read(buffer, { type: 'array', cellFormula: false, cellHTML: false });
        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          throw new Error('Tệp Excel không chứa bảng tính (sheet) hợp lệ.');
        }

        const parsedSheets: ExcelSheet[] = workbook.SheetNames.map((name) => {
          const worksheet = workbook.Sheets[name];
          const rawRows =
            (XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '', blankrows: false }) as unknown[][]) || [];
          let maxCols = 0;
          for (const row of rawRows) {
            if (Array.isArray(row) && row.length > maxCols) maxCols = row.length;
          }
          return { name, rows: rawRows, maxCols: Math.max(maxCols, 1), totalRows: rawRows.length };
        });

        if (isMounted) {
          setSheets(parsedSheets);
          setActiveSheetIdx(0);
        }
      } catch (err: any) {
        if (isMounted) setParseError(err?.message || 'Không thể đọc nội dung file Excel trực tiếp.');
      } finally {
        if (isMounted) setIsParsing(false);
      }
    };

    void parse();
    return () => {
      isMounted = false;
    };
  }, [buffer]);

  const currentSheet = sheets[activeSheetIdx] || null;
  const { displayRows, isCapped, totalFiltered } = useMemo(() => {
    if (!currentSheet) return { displayRows: [], isCapped: false, totalFiltered: 0 };
    let filtered = currentSheet.rows;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = currentSheet.rows.filter((row) =>
        row.some((cell) => String(cell ?? '').toLowerCase().includes(q)),
      );
    }
    const capped = filtered.length > MAX_EXCEL_ROWS;
    return {
      displayRows: capped ? filtered.slice(0, MAX_EXCEL_ROWS) : filtered,
      isCapped: capped,
      totalFiltered: filtered.length,
    };
  }, [currentSheet, search]);

  const loading = isLoading || isParsing;
  const error = parentError || parseError;

  return (
    <div className="w-full h-full max-w-7xl flex flex-col bg-white rounded-xl shadow-2xl border border-slate-800 text-slate-900 overflow-hidden relative">
      {loading && (
        <div className="absolute inset-0 z-20 bg-white/90 backdrop-blur-xs flex flex-col items-center justify-center gap-3 text-slate-500">
          <Loader2 size={36} className="animate-spin text-emerald-600" />
          <p className="text-xs font-semibold text-slate-800">Đang đọc và dựng bảng tính Excel...</p>
        </div>
      )}

      {error && !loading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-200">
            <AlertCircle size={28} />
          </div>
          <h4 className="text-sm font-bold text-slate-800">Không thể xem trực tiếp tệp Excel</h4>
          <p className="text-xs text-slate-500 max-w-md">{error}</p>
          <button
            type="button"
            onClick={onDownload}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition-colors cursor-pointer"
          >
            <Download size={15} />
            <span>Tải tệp tin về máy</span>
          </button>
        </div>
      ) : (
        <>
          <div className="px-3 sm:px-4 py-2 bg-slate-100/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-0.5 scrollbar-thin">
              {sheets.map((sheet, idx) => (
                <button
                  key={sheet.name}
                  type="button"
                  onClick={() => {
                    setActiveSheetIdx(idx);
                    setSearch('');
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 select-none ${
                    activeSheetIdx === idx
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-300'
                  }`}
                >
                  <TableIcon size={14} className={activeSheetIdx === idx ? 'text-white' : 'text-emerald-600'} />
                  <span>{sheet.name}</span>
                  <span
                    className={`text-[10px] px-1.5 rounded-full ${
                      activeSheetIdx === idx ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {sheet.totalRows}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 ml-auto shrink-0">
              {currentSheet && (
                <span className="text-[11px] font-mono text-slate-500 hidden sm:inline-block">
                  {currentSheet.totalRows} hàng × {currentSheet.maxCols} cột
                </span>
              )}
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm trong bảng..."
                  className="h-7.5 pl-7 pr-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 w-36 sm:w-52"
                />
              </div>
            </div>
          </div>

          {isCapped && (
            <div className="px-4 py-1.5 bg-amber-50 border-b border-amber-200 text-amber-800 text-[11px] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5">
                <Info size={14} className="text-amber-600 shrink-0" />
                <span>
                  Đang hiển thị <strong>{MAX_EXCEL_ROWS}</strong> trên tổng số <strong>{totalFiltered}</strong> dòng để bảo vệ hiệu năng.
                </span>
              </div>
              <button
                type="button"
                onClick={onDownload}
                className="text-emerald-700 hover:text-emerald-800 font-semibold underline ml-2 cursor-pointer"
              >
                Tải file để xem trọn bộ
              </button>
            </div>
          )}

          {currentSheet && (
            <div className="flex-1 w-full overflow-auto bg-slate-50 select-text relative">
              <table className="border-collapse w-full bg-white text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 border-b border-slate-300">
                    <th className="sticky top-0 left-0 z-20 bg-slate-200 border-r border-b border-slate-300 px-2.5 py-1.5 text-center font-mono text-[11px] text-slate-500 w-12 min-w-12 select-none">
                      #
                    </th>
                    {Array.from({ length: currentSheet.maxCols }).map((_, colIdx) => (
                      <th
                        key={colIdx}
                        className="sticky top-0 z-10 bg-slate-100 border-r border-b border-slate-300 px-3 py-1.5 text-center font-mono text-[11px] text-slate-600 font-semibold min-w-24 whitespace-nowrap select-none"
                      >
                        {getExcelColLabel(colIdx)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayRows.length === 0 ? (
                    <tr>
                      <td colSpan={currentSheet.maxCols + 1} className="py-16 text-center text-slate-400 italic text-xs">
                        {search ? 'Không tìm thấy dữ liệu phù hợp với từ khóa.' : 'Bảng tính này không có dữ liệu.'}
                      </td>
                    </tr>
                  ) : (
                    displayRows.map((row, rowIdx) => (
                      <tr key={rowIdx} className="hover:bg-emerald-50/50 transition-colors border-b border-slate-200">
                        <td className="sticky left-0 z-10 bg-slate-100 border-r border-slate-300 px-2 py-1 text-center font-mono text-[11px] text-slate-500 font-medium select-none">
                          {rowIdx + 1}
                        </td>
                        {Array.from({ length: currentSheet.maxCols }).map((_, colIdx) => {
                          const cellValue = row[colIdx];
                          const isNum = typeof cellValue === 'number';
                          const strVal = cellValue !== undefined && cellValue !== null ? String(cellValue) : '';
                          return (
                            <td
                              key={colIdx}
                              className={`border-r border-slate-200 px-3 py-1.5 text-slate-800 whitespace-nowrap max-w-xs truncate ${
                                isNum ? 'text-right font-mono' : 'text-left'
                              }`}
                              title={strVal}
                            >
                              {strVal}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};
