export function getCurrentMonthDateRange(): { fromDate: string; toDate: string } {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = now.getFullYear();
  const month = now.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();
  return {
    fromDate: `${year}-${pad(month + 1)}-01`,
    toDate: `${year}-${pad(month + 1)}-${pad(lastDay)}`,
  };
}
