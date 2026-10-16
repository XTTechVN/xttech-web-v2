'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Image as AntdImage } from 'antd';
import { Document, Page, pdfjs } from 'react-pdf';
import {
  ArrowLeft,
  Download,
  Printer,
  ExternalLink,
  X,
  FileText,
  AlertCircle,
  Loader2,
  Table as TableIcon,
  Search,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCw,
  FileWarning,
  Info,
} from 'lucide-react';
import type { DocumentItem } from '@/types';
import { getFileUrl } from '@/utils/string';
import api from '@/utils/api';
import { markDocumentAsRead } from '@/actions/document';
import { formatBytes, getFileVisualInfo, getFileExtension } from '../_utils/doc-helpers';

// Cấu hình Worker cho react-pdf
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

// Chuyển index cột sang nhãn chữ cái Excel: 0 -> A, 1 -> B, 25 -> Z, 26 -> AA...
const getExcelColLabel = (index: number): string => {
  let label = '';
  let temp = index;
  while (temp >= 0) {
    label = String.fromCharCode((temp % 26) + 65) + label;
    temp = Math.floor(temp / 26) - 1;
  }
  return label;
};

const MAX_EXCEL_ROWS = 500;

// =========================================================================
// SUB-COMPONENT: XEM FILE WORD (.DOCX) - LAZY LOAD DOCX-PREVIEW
// =========================================================================
interface WordViewerProps {
  buffer: ArrayBuffer | null;
  isLoading: boolean;
  error: string | null;
  onDownload: () => void;
}

const WordViewer: React.FC<WordViewerProps> = ({ buffer, isLoading, error: parentError, onDownload }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    if (!buffer) return;
    let isMounted = true;
    setIsRendering(true);
    setRenderError(null);

    const render = async () => {
      try {
        const bytes = new Uint8Array(buffer.slice(0, 4));
        const isZip = bytes[0] === 0x50 && bytes[1] === 0x4b; // DOCX là file ZIP
        const isOldDoc = bytes[0] === 0xd0 && bytes[1] === 0xcf; // OLE binary .doc

        if (isOldDoc) {
          throw new Error('Tệp sử dụng định dạng Word cũ (.doc). Vui lòng tải về máy để xem.');
        }
        if (!isZip) {
          throw new Error('Dữ liệu trả về không phải là tệp văn bản hợp lệ.');
        }

        // Lazy load docx-preview khi thực sự mở file Word
        const { renderAsync } = await import('docx-preview');

        if (containerRef.current && isMounted) {
          containerRef.current.innerHTML = '';
          await renderAsync(buffer, containerRef.current, undefined, {
            inWrapper: false,
            ignoreWidth: false,
            ignoreHeight: false,
            breakPages: true,
            renderHeaders: true,
            renderFooters: true,
            renderFootnotes: true,
            renderEndnotes: true,
            useBase64URL: true,
            className: 'docx-document-viewer',
          });
        }
      } catch (err: any) {
        if (isMounted) setRenderError(err.message || 'Không thể xem trực tiếp tệp Word này.');
      } finally {
        if (isMounted) setIsRendering(false);
      }
    };

    render();

    return () => {
      isMounted = false;
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [buffer]);

  const loading = isLoading || isRendering;
  const error = parentError || renderError;

  return (
    <div className="w-full h-full max-w-5xl bg-white rounded-xl shadow-2xl border border-slate-800 flex flex-col overflow-hidden text-slate-900 relative">
      {loading && (
        <div className="absolute inset-0 z-10 bg-white/90 backdrop-blur-xs flex flex-col items-center justify-center gap-3 text-slate-500">
          <Loader2 size={36} className="animate-spin text-primary" />
          <p className="text-xs font-semibold text-slate-700">Đang đọc và dựng văn bản Word (.docx)...</p>
        </div>
      )}
      {error && !loading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-200">
            <AlertCircle size={28} />
          </div>
          <h4 className="text-sm font-bold text-slate-800">Không thể xem trực tiếp tệp Word</h4>
          <p className="text-xs text-slate-500 max-w-md">{error}</p>
          <button
            type="button"
            onClick={onDownload}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors cursor-pointer"
          >
            <Download size={15} />
            <span>Tải tệp tin về máy</span>
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 md:p-12">
          <div ref={containerRef} className="w-full docx-container text-slate-900 mx-auto select-text leading-normal" />
        </div>
      )}
    </div>
  );
};

// =========================================================================
// SUB-COMPONENT: XEM BẢNG TÍNH EXCEL (.XLSX, .XLS, .CSV) - LAZY LOAD XLSX
// =========================================================================
interface ExcelViewerProps {
  buffer: ArrayBuffer | null;
  isLoading: boolean;
  error: string | null;
  onDownload: () => void;
}

interface ExcelSheet {
  name: string;
  rows: any[][];
  maxCols: number;
  totalRows: number;
}

const ExcelViewer: React.FC<ExcelViewerProps> = ({ buffer, isLoading, error: parentError, onDownload }) => {
  const [sheets, setSheets] = useState<ExcelSheet[]>([]);
  const [activeSheetIdx, setActiveSheetIdx] = useState(0);
  const [search, setSearch] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  useEffect(() => {
    if (!buffer) return;
    let isMounted = true;
    setIsParsing(true);
    setParseError(null);

    const parse = async () => {
      try {
        // Lazy load xlsx khi mở file Excel
        const XLSX = await import('xlsx');
        const workbook = XLSX.read(buffer, { type: 'array', cellFormula: false, cellHTML: false });

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          throw new Error('Tệp Excel không chứa bảng tính (sheet) hợp lệ.');
        }

        const parsedSheets: ExcelSheet[] = workbook.SheetNames.map((name) => {
          const worksheet = workbook.Sheets[name];
          const rawRows = (XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '', blankrows: false }) as any[][]) || [];
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
        if (isMounted) setParseError(err.message || 'Không thể đọc nội dung file Excel trực tiếp.');
      } finally {
        if (isMounted) setIsParsing(false);
      }
    };

    parse();

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
      filtered = currentSheet.rows.filter((row) => row.some((cell) => String(cell ?? '').toLowerCase().includes(q)));
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
          {/* Toolbar Tabs Sheet & Search */}
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
                  <span className={`text-[10px] px-1.5 rounded-full ${activeSheetIdx === idx ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-100 text-slate-500'}`}>
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

          {/* Cảnh báo giới hạn dòng */}
          {isCapped && (
            <div className="px-4 py-1.5 bg-amber-50 border-b border-amber-200 text-amber-800 text-[11px] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5">
                <Info size={14} className="text-amber-600 shrink-0" />
                <span>
                  Đang hiển thị <strong>{MAX_EXCEL_ROWS}</strong> trên tổng số <strong>{totalFiltered}</strong> dòng để bảo vệ hiệu năng.
                </span>
              </div>
              <button type="button" onClick={onDownload} className="text-emerald-700 hover:text-emerald-800 font-semibold underline ml-2 cursor-pointer">
                Tải file để xem trọn bộ
              </button>
            </div>
          )}

          {/* Table Grid */}
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

// =========================================================================
// SUB-COMPONENT: XEM FILE PDF (REACT-PDF)
// =========================================================================
interface PdfViewerProps {
  file: string | ArrayBuffer | Blob;
  downloadUrl: string | null;
  onDownload: () => void;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ file, downloadUrl, onDownload }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.1);
  const [rotation, setRotation] = useState(0);
  const [inputPage, setInputPage] = useState('1');
  const [error, setError] = useState<string | null>(null);
  const [useIframe, setUseIframe] = useState(false);

  if (useIframe && downloadUrl) {
    return (
      <div className="w-full h-full max-w-6xl flex flex-col items-center justify-center bg-white rounded-xl overflow-hidden shadow-2xl border border-slate-800 relative">
        <div className="absolute top-2 right-2 z-10">
          <button
            type="button"
            onClick={() => setUseIframe(false)}
            className="px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-800 text-white text-[11px] font-medium border border-slate-700 transition-colors"
          >
            Quay lại chế độ xem chuẩn
          </button>
        </div>
        <iframe src={downloadUrl} className="w-full h-full border-0 bg-white" title="PDF Preview" />
      </div>
    );
  }

  return (
    <div className="w-full h-full max-w-5xl flex flex-col bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-800 select-none">
      {/* Toolbar PDF */}
      <div className="h-12 px-3 sm:px-4 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0 z-10 text-slate-300">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setPageNumber((p) => {
                const n = Math.max(p - 1, 1);
                setInputPage(String(n));
                return n;
              });
            }}
            disabled={pageNumber <= 1 || !numPages}
            className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Trang trước"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex items-center gap-1 text-xs font-medium text-slate-300">
            <input
              type="text"
              value={inputPage}
              onChange={(e) => setInputPage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = parseInt(inputPage, 10);
                  if (!isNaN(val) && numPages && val >= 1 && val <= numPages) setPageNumber(val);
                  else setInputPage(String(pageNumber));
                }
              }}
              onBlur={() => {
                const val = parseInt(inputPage, 10);
                if (!isNaN(val) && numPages && val >= 1 && val <= numPages) setPageNumber(val);
                else setInputPage(String(pageNumber));
              }}
              className="w-9 h-7 text-center rounded-md bg-slate-800 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-primary"
            />
            <span className="text-slate-400">/ {numPages || '...'}</span>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!numPages) return;
              setPageNumber((p) => {
                const n = Math.min(p + 1, numPages);
                setInputPage(String(n));
                return n;
              });
            }}
            disabled={!numPages || pageNumber >= numPages}
            className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Trang tiếp theo"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            type="button"
            onClick={() => setScale((p) => Math.max(Number((p - 0.15).toFixed(2)), 0.5))}
            disabled={scale <= 0.5}
            className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Thu nhỏ"
          >
            <ZoomOut size={16} />
          </button>
          <span className="text-[11px] font-mono px-1.5 text-slate-300 min-w-11 text-center">{Math.round(scale * 100)}%</span>
          <button
            type="button"
            onClick={() => setScale((p) => Math.min(Number((p + 0.15).toFixed(2)), 3))}
            disabled={scale >= 3}
            className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Phóng to"
          >
            <ZoomIn size={16} />
          </button>
          <button
            type="button"
            onClick={() => setScale(1.0)}
            className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors cursor-pointer hidden sm:inline-flex"
            title="Kích thước 100%"
          >
            <Maximize2 size={15} />
          </button>
          <button
            type="button"
            onClick={() => setRotation((p) => (p + 90) % 360)}
            className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ml-1 border-l border-slate-700 pl-2"
            title="Xoay 90°"
          >
            <RotateCw size={15} />
          </button>
        </div>
      </div>

      {/* Content Canvas */}
      <div className="flex-1 w-full overflow-auto bg-slate-950/60 p-4 sm:p-6 flex items-start justify-center relative">
        {error ? (
          <div className="my-auto p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center max-w-md shadow-2xl flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
              <AlertCircle size={28} />
            </div>
            <h4 className="font-semibold text-white text-sm">Không thể nạp tệp PDF</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">{error}</p>
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => setUseIframe(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
              >
                <ExternalLink size={14} />
                <span>Dùng trình xem ngoài</span>
              </button>
              <button
                type="button"
                onClick={onDownload}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-medium transition-colors cursor-pointer shadow-xs"
              >
                <Download size={14} />
                <span>Tải về máy</span>
              </button>
            </div>
          </div>
        ) : (
          <Document
            file={file}
            onLoadSuccess={({ numPages }) => {
              setNumPages(numPages);
              setPageNumber(1);
              setInputPage('1');
              setError(null);
            }}
            onLoadError={(err) => setError(err.message || 'Không thể hiển thị tệp PDF.')}
            loading={
              <div className="my-auto flex flex-col items-center justify-center gap-3 text-slate-400 py-16">
                <Loader2 size={36} className="animate-spin text-rose-500" />
                <p className="text-xs font-medium text-slate-300">Đang nạp dữ liệu PDF...</p>
              </div>
            }
          >
            <div className="shadow-2xl rounded-sm overflow-hidden bg-white">
              <Page
                pageNumber={pageNumber}
                scale={scale}
                rotate={rotation}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                loading={
                  <div className="w-[500px] h-[700px] bg-white flex flex-col items-center justify-center text-slate-400 gap-2">
                    <Loader2 size={24} className="animate-spin text-primary" />
                    <span className="text-xs">Đang tải trang {pageNumber}...</span>
                  </div>
                }
              />
            </div>
          </Document>
        )}
      </div>
    </div>
  );
};

// =========================================================================
// SUB-COMPONENT: GIAO DIỆN TỆP CHƯA HỖ TRỢ XEM TRỰC TIẾP (FALLBACK)
// =========================================================================
interface FallbackViewerProps {
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  downloadUrl: string | null;
  onDownload: () => void;
}

const FallbackViewer: React.FC<FallbackViewerProps> = ({ fileName, fileSize, mimeType, downloadUrl, onDownload }) => {
  const visualInfo = getFileVisualInfo(fileName, mimeType);
  const ext = getFileExtension(fileName).toUpperCase() || 'FILE';

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center max-w-lg bg-slate-900/90 rounded-2xl border border-slate-800 text-slate-300 shadow-2xl select-none mx-4">
      <div className="w-20 h-20 rounded-2xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center mb-4 shadow-inner relative">
        {visualInfo?.icon ? (
          React.cloneElement(visualInfo.icon as React.ReactElement<{ size?: number; className?: string }>, {
            size: 40,
            className: 'drop-shadow-sm',
          })
        ) : (
          <FileWarning size={40} className="text-amber-400" />
        )}
        <span className="absolute -bottom-2 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-slate-700 text-white border border-slate-600 uppercase">
          {ext}
        </span>
      </div>

      <h3 className="text-base font-bold text-white max-w-sm truncate mb-1" title={fileName}>
        {fileName}
      </h3>

      <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
        {fileSize !== undefined && fileSize > 0 && <span>{formatBytes(fileSize)}</span>}
        {mimeType && (
          <>
            <span>•</span>
            <span className="font-mono text-[11px] text-slate-400 max-w-xs truncate">{mimeType}</span>
          </>
        )}
      </div>

      <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-xs text-slate-300 leading-relaxed mb-6 max-w-sm">
        Định dạng này hiện chưa hỗ trợ xem trước trực tiếp trên trình duyệt. Bạn có thể tải tệp tin về máy để mở bằng ứng dụng tương ứng.
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onDownload}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-all cursor-pointer shadow-md active:scale-95"
        >
          <Download size={16} />
          <span>Tải tệp tin về máy</span>
        </button>

        {downloadUrl && (
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-medium hover:bg-slate-700 hover:text-white transition-colors cursor-pointer border border-slate-700"
          >
            <ExternalLink size={15} />
            <span>Mở liên kết</span>
          </a>
        )}
      </div>
    </div>
  );
};

// =========================================================================
// MAIN COMPONENT: DOCUMENT PREVIEW MODAL
// =========================================================================
interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentItem | null;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({ isOpen, onClose, document: doc }) => {
  const currentVersion = doc?.currentVersion;
  const fileName = currentVersion?.fileName || doc?.title || '';
  const downloadUrl =
    currentVersion?.downloadUrl ||
    (currentVersion?.filePath ? getFileUrl(currentVersion.filePath) : null);

  const visualInfo = doc ? getFileVisualInfo(fileName, currentVersion?.mimeType) : null;
  const ext = getFileExtension(fileName).toLowerCase();
  const mime = (currentVersion?.mimeType || '').toLowerCase();

  // Nhận diện loại tệp
  const isImage = Boolean(mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext));
  const isPdf = Boolean(mime.includes('pdf') || ext === 'pdf');
  const isWord = Boolean(mime.includes('word') || ['docx', 'doc'].includes(ext));
  const isExcel = Boolean(
    mime.includes('sheet') ||
    mime.includes('excel') ||
    mime.includes('spreadsheet') ||
    mime.includes('csv') ||
    ['xlsx', 'xls', 'csv'].includes(ext)
  );

  // Binary buffer dùng chung cho các parser nhị phân
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [isBufferLoading, setIsBufferLoading] = useState(false);
  const [bufferError, setBufferError] = useState<string | null>(null);

  // Tải nội dung nhị phân khi cần (Word, Excel, PDF)
  useEffect(() => {
    if (!isOpen || !downloadUrl || isImage) {
      setFileBuffer(null);
      setBufferError(null);
      return;
    }

    if (doc?.id) {
      markDocumentAsRead(doc.id).catch((err) => {
        console.debug('markDocumentAsRead in preview:', err?.message);
      });
    }

    let isMounted = true;
    setIsBufferLoading(true);
    setBufferError(null);

    const loadBuffer = async () => {
      try {
        let buffer: ArrayBuffer;
        try {
          const res = await api.get(downloadUrl, { responseType: 'arraybuffer' });
          buffer = res.data;
        } catch {
          const res = await fetch(downloadUrl);
          if (!res.ok) throw new Error(`Lỗi nạp tệp: ${res.status} ${res.statusText}`);
          buffer = await res.arrayBuffer();
        }

        if (!isMounted) return;
        if (!buffer || buffer.byteLength === 0) throw new Error('Tệp rỗng hoặc không có dữ liệu.');
        setFileBuffer(buffer);
      } catch (err: any) {
        if (isMounted) setBufferError(err.message || 'Không thể tải tệp tin từ máy chủ.');
      } finally {
        if (isMounted) setIsBufferLoading(false);
      }
    };

    loadBuffer();

    return () => {
      isMounted = false;
    };
  }, [isOpen, downloadUrl, isImage]);

  // Khóa cuộn trang khi mở modal
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !doc) return null;

  // Thao tác tải xuống
  const handleDownload = () => {
    if (!downloadUrl) return;
    window.open(downloadUrl, '_blank', 'noopener,noreferrer');
  };

  // Thao tác in ấn
  const handlePrint = () => {
    if (!downloadUrl) return;
    const printWindow = window.open(downloadUrl, '_blank');
    if (printWindow) {
      printWindow.focus();
      printWindow.print();
    }
  };

  // 1. FILE ẢNH: DÙNG ANTD IMAGE PREVIEW CÓ SẴN TOOLBAR XOAY, LẬT, ZOOM
  if (isImage) {
    return (
      <AntdImage
        style={{ display: 'none' }}
        preview={{
          open: isOpen,
          onOpenChange: (open) => {
            if (!open) onClose();
          },
          src: downloadUrl || '',
        }}
        src={downloadUrl || ''}
      />
    );
  }

  // 2. CÁC LOẠI FILE KHÁC (PDF, WORD, EXCEL, VĂN BẢN, UNSUPPORTED)
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 text-white backdrop-blur-sm select-none animate-in fade-in duration-150"
    >
      {/* Header Toolbar */}
      <div className="h-14 px-3 sm:px-4 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between gap-3 shrink-0 z-20 shadow-md">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title="Đóng (ESC)"
          >
            <ArrowLeft size={19} />
          </button>

          <div className="shrink-0 flex items-center justify-center">
            {visualInfo?.icon ? (
              React.cloneElement(visualInfo.icon as React.ReactElement<{ size?: number }>, { size: 20 })
            ) : (
              <FileText size={20} className="text-blue-400" />
            )}
          </div>

          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-xs sm:text-sm font-semibold text-white truncate leading-tight" title={doc.title}>
              {doc.title}
            </h1>
            {doc.code && (
              <span className="hidden md:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 shrink-0 border border-slate-700">
                {doc.code}
              </span>
            )}
            {currentVersion?.fileSize && (
              <span className="hidden lg:inline-block text-[11px] text-slate-400 shrink-0">
                • {formatBytes(currentVersion.fileSize)}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {downloadUrl && (
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="In tài liệu"
            >
              <Printer size={18} />
            </button>
          )}

          {downloadUrl && (
            <button
              type="button"
              onClick={handleDownload}
              className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Tải xuống"
            >
              <Download size={18} />
            </button>
          )}

          {downloadUrl && (
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Mở tab mới"
            >
              <ExternalLink size={18} />
            </a>
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ml-1"
            title="Đóng (ESC)"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Main Viewer Area */}
      <div className="flex-1 w-full h-[calc(100vh-56px)] flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden relative">
        {!downloadUrl ? (
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center max-w-md shadow-2xl flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center">
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="font-semibold text-white text-sm">Không có tệp xem trước</p>
              <p className="text-xs text-slate-400 mt-1">Tài liệu này chưa được đính kèm tệp tin.</p>
            </div>
          </div>
        ) : isWord ? (
          <WordViewer buffer={fileBuffer} isLoading={isBufferLoading} error={bufferError} onDownload={handleDownload} />
        ) : isExcel ? (
          <ExcelViewer buffer={fileBuffer} isLoading={isBufferLoading} error={bufferError} onDownload={handleDownload} />
        ) : isPdf ? (
          <PdfViewer file={fileBuffer || downloadUrl} downloadUrl={downloadUrl} onDownload={handleDownload} />
        ) : (
          <FallbackViewer
            fileName={fileName}
            fileSize={currentVersion?.fileSize}
            mimeType={currentVersion?.mimeType}
            downloadUrl={downloadUrl}
            onDownload={handleDownload}
          />
        )}
      </div>
    </div>
  );
};
