export type Response<T> = {
  items: T[];
  meta: {
    next: string;
  };
};

export type ResponsePagination<T> = {
  items: T[];
  meta: {
    total: number;
    offset: number;
    limit: number;
    next: boolean;
  };
};
