/**
 * Tiện ích hỗ trợ kéo thả tệp và thư mục (Drag and Drop)
 * Duyệt đệ quy cây thư mục từ DataTransferItem bằng webkitGetAsEntry
 */

export interface ParsedDroppedEntries {
  files: File[];
  relativePaths: string[];
}

/**
 * Kiểm tra xem sự kiện kéo thả có chứa tệp tin hoặc thư mục từ hệ điều hành hay không
 */
export function hasFileTransfer(dataTransfer: DataTransfer | null): boolean {
  if (!dataTransfer || !dataTransfer.types) return false;
  return Array.from(dataTransfer.types).includes('Files');
}

/**
 * Đọc toàn bộ entries trong một directory (xử lý phân trang 100 entries/lần của Chromium)
 */
async function readAllDirectoryEntries(
  reader: any,
): Promise<any[]> {
  const entries: any[] = [];
  const readBatch = (): Promise<any[]> =>
    new Promise((resolve, reject) => {
      reader.readEntries(resolve, reject);
    });

  let batch: any[];
  do {
    batch = await readBatch();
    entries.push(...batch);
  } while (batch.length > 0);

  return entries;
}

/**
 * Lấy đối tượng File từ FileEntry
 */
function getFileFromEntry(fileEntry: any): Promise<File> {
  return new Promise((resolve, reject) => {
    fileEntry.file(resolve, reject);
  });
}

/**
 * Đọc đệ quy một Entry (có thể là File hoặc Directory)
 */
async function traverseEntry(
  entry: any,
  pathPrefix: string,
  files: File[],
  relativePaths: string[],
): Promise<void> {
  if (entry.isFile) {
    const file = await getFileFromEntry(entry);
    const relativePath = pathPrefix ? `${pathPrefix}/${file.name}` : file.name;
    files.push(file);
    relativePaths.push(relativePath);
    return;
  }

  if (entry.isDirectory) {
    const reader = entry.createReader();
    const childEntries = await readAllDirectoryEntries(reader);
    const currentPath = pathPrefix ? `${pathPrefix}/${entry.name}` : entry.name;

    for (const child of childEntries) {
      await traverseEntry(child, currentPath, files, relativePaths);
    }
  }
}

/**
 * Phân tích đối tượng DataTransfer để trích xuất toàn bộ File và relativePaths
 */
export async function parseDataTransferEntries(
  dataTransfer: DataTransfer,
): Promise<ParsedDroppedEntries> {
  const files: File[] = [];
  const relativePaths: string[] = [];

  const items = dataTransfer.items;

  // Nếu trình duyệt hỗ trợ webkitGetAsEntry (Chrome, Edge, Safari, Firefox hiện đại)
  if (items && items.length > 0 && typeof (items[0] as any).webkitGetAsEntry === 'function') {
    const traversePromises: Promise<void>[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind !== 'file') continue;

      const entry = (item as any).webkitGetAsEntry?.();
      if (entry) {
        traversePromises.push(traverseEntry(entry, '', files, relativePaths));
      }
    }

    await Promise.all(traversePromises);
    return { files, relativePaths };
  }

  // Fallback chuẩn nếu không có webkitGetAsEntry
  const fallbackFiles = Array.from(dataTransfer.files || []);
  return {
    files: fallbackFiles,
    relativePaths: fallbackFiles.map((f) => f.name),
  };
}
