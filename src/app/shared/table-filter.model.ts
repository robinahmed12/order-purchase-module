export interface TableFilters {
  searchTerm: string;
  status: string;
  startDate: string;
  endDate: string;
  sortKey: string;
  sortDirection: 'asc' | 'desc';
  page: number;
  pageSize: number;
}