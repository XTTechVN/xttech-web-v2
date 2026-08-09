/**
 * Get pagination buttons
 * @param currentPage - Current page: number
 * @param totalPages - Total pages: number
 * @returns Pagination buttons: string[]
 */

export default function getPaginationButtons(currentPage: number, totalPages: number) {
  const buttons: string[] = [];

  if (totalPages <= 6) {
    // Tổng trang ≤ 6 → hiện tất cả
    for (let i = 1; i <= totalPages; i++) {
      buttons.push(i.toString());
    }
  } else {
    if (currentPage <= 3) {
      // Trang đầu → hiện 1 2 3 4 ... last
      buttons.push('1', '2', '3', '4', '...', totalPages.toString());
    } else if (currentPage >= totalPages - 2) {
      // Trang cuối → hiện 1 ... n-3 n-2 n-1 n
      buttons.push(
        '1',
        '...',
        (totalPages - 3).toString(),
        (totalPages - 2).toString(),
        (totalPages - 1).toString(),
        totalPages.toString(),
      );
    } else {
      // Trang giữa → hiện 1 ... currentPage-1 currentPage currentPage+1 ... last
      buttons.push(
        '1',
        '...',
        (currentPage - 1).toString(),
        currentPage.toString(),
        Number(currentPage + 1).toString(),
        '...',
        totalPages.toString(),
      );
    }
  }

  return buttons;
}
