export interface PaginationQuery {
    page?: number;
    limit?: number;
  }
  
  export interface PaginationResult<T> {
    items: T[];
    page: number;
    limit: number;
    total: number;
  }