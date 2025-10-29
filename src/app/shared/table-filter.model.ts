export interface TableFilter {
  searchTerm?: string;
  status?: string;
  startDate?: string | null;
  endDate?: string | null;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc' | '';
  page?: number;
  pageSize?: number;
}