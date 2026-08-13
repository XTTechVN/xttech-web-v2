import { ReactNode } from 'react';
export interface BaseResponseWithPagination<T> {
  items: T[];
  meta: {
    total: number;
    offset: number;
    limit: number;
    next: boolean;
  };
}

export interface ITableColumn<T> {
  key: string;
  label: string;
  minWidth?: string;
  maxWidth?: string;
  sticky?: boolean;
  visible?: boolean; // Xác định cột có hiển thị mặc định hay không (mặc định là true)
  cell: (row: T) => ReactNode;
}

export interface ITableSearchProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export interface ITableFilterProps {
  label?: string;
  type?: 'select' | 'date-range';
  value?: string | undefined;
  startDate?: string | undefined;
  endDate?: string | undefined;
  options?: { value: string | undefined; label: string; icon?: ReactNode }[];
  onChange?: (value: string | undefined) => void;
  onDateChange?: (startDate: string | undefined, endDate: string | undefined) => void;
  className?: string;
  icon?: ReactNode;
}

export interface TableDataBaseProps<T> {
  // Fetch
  fetcher: (params: { offset: number; limit: number }) => Promise<BaseResponseWithPagination<T>>;
  queryKey: any[];

  // Sync
  syncToUrl?: boolean;
  initialData?: BaseResponseWithPagination<T>;
}

export interface TableDataDesktopProps<T> extends TableDataBaseProps<T> {
  columns: ITableColumn<T>[];
  select?: boolean;
  hideRowPerPage?: boolean;
  hidePagination?: boolean;
}

export interface TableDataMobileProps<T> extends TableDataBaseProps<T> {
  renderCard: (row: T, index: number) => ReactNode;
}

export interface TableDataProps<T> extends TableDataBaseProps<T> {
  columns: ITableColumn<T>[];
  search?: ITableSearchProps;
  filters?: ITableFilterProps[];

  select?: boolean;

  renderCard?: (row: T, index: number) => ReactNode;

  hideRowPerPage?: boolean;
  hidePagination?: boolean;
}
