import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  shareReplay,
} from 'rxjs';
import { TableFilters } from './table-filter.model';



@Injectable({ providedIn: 'root' })
export class TableFilterService<T extends Record<string, any>> {
  // Full dataset (unfiltered)
  private allData: T[] = [];

  // Reactive filter state
  private filters$ = new BehaviorSubject<TableFilters>({
    searchTerm: '',
    status: 'All',
    startDate: '',
    endDate: '',
    sortKey: '',
    sortDirection: 'asc',
    page: 1,
    pageSize: 10,
  });

  // Reactive data stream (raw input)
  private data$ = new BehaviorSubject<T[]>([]);

  // Final filtered + paginated output stream
  filteredData$ = combineLatest([this.data$, this.filters$]).pipe(
    debounceTime(150), // debounce for smoother UX
    distinctUntilChanged(), // prevent unnecessary recalculations
    map(([data, filters]) => this.applyFilters(data, filters)),
    shareReplay(1) // cache latest result for subscribers
  );

  // Total count of raw data (used for pagination UI)
  totalCount$ = this.data$.pipe(map((data) => data.length));

  /**  Set initial dataset or refresh after create/update/delete */
  setData(data: T[]) {
    this.allData = data;
    this.data$.next(data);
  }

  /**  Update filters reactively (search, sort, pagination, etc.) */
  updateFilters(partial: Partial<TableFilters>) {
    this.filters$.next({ ...this.filters$.value, ...partial });
  }

  /**  Get filtered and paginated data stream */
  getFilteredData() {
    return this.filteredData$;
  }

  /** Get total count of raw data */
  getTotalCount() {
    return this.totalCount$;
  }

  /**  Apply all filters and pagination logic */
  private applyFilters(data: T[], filters: TableFilters): T[] {
    let filtered = [...data];

    //  Text search across key fields
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (x) =>
          x['poNumber']?.toLowerCase().includes(term) ||
          x['supplier']?.toLowerCase().includes(term) ||
          x['warehouse']?.toLowerCase().includes(term)
      );
    }

    //  Status filter
    if (filters.status !== 'All') {
      filtered = filtered.filter((x) => x['status'] === filters.status);
    }

    //  Date range filter
    if (filters.startDate && filters.endDate) {
      const start = new Date(filters.startDate).getTime();
      const end = new Date(filters.endDate).getTime();
      filtered = filtered.filter((x) => {
        const d = new Date(x['orderDate']).getTime();
        return d >= start && d <= end;
      });
    }

    //  Sorting
    if (filters.sortKey) {
      filtered.sort((a, b) => {
        const aVal = a[filters.sortKey];
        const bVal = b[filters.sortKey];
        if (aVal === bVal) return 0;
        return filters.sortDirection === 'asc' ? (aVal > bVal ? 1 : -1) : aVal < bVal ? 1 : -1;
      });
    }

    //  Pagination
    const startIdx = (filters.page - 1) * filters.pageSize;
    const endIdx = startIdx + filters.pageSize;
    return filtered.slice(startIdx, endIdx);
  }


  // query params sync
  getFilters(): TableFilters {
  return this.filters$.value;
}

setFiltersFromQuery(params: Partial<TableFilters>) {
  const current = this.filters$.value;
  const merged: TableFilters = {
    ...current,
    ...params,
    page: Number(params.page) || 1,
    pageSize: Number(params.pageSize) || 10,
    sortDirection: params.sortDirection === 'desc' ? 'desc' : 'asc',
  };
  this.filters$.next(merged);
}

}
