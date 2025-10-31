// src/app/shared/table-filter.service.ts
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  shareReplay,
} from 'rxjs';

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

@Injectable({ providedIn: 'root' })
export class TableFilterService<T extends Record<string, any>> {
  private allData: T[] = [];

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

  private data$ = new BehaviorSubject<T[]>([]);

  constructor() {
    this.filteredData$ = combineLatest([this.data$, this.filters$]).pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(([data, filters]) => this.applyFilters(data, filters)),
      shareReplay(1)
    );

    this.totalCount$ = this.filteredData$.pipe(map((data) => data.length));
  }

  filteredData$;
  totalCount$;

  /** set initial data */
  setData(data: T[]) {
    this.allData = data;
    this.data$.next(data);
  }

  /** update filters reactively */
  updateFilters(partial: Partial<TableFilters>) {
    this.filters$.next({ ...this.filters$.value, ...partial });
  }

  /** expose observables */
  getFilteredData() {
    return this.filteredData$;
  }
  getTotalCount() {
    return this.totalCount$;
  }

  /** core filtering logic */
  private applyFilters(data: T[], filters: TableFilters): T[] {
    let filtered = [...data];

    // search
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (x) =>
          x['poNumber']?.toLowerCase().includes(term) ||
          x['supplier']?.toLowerCase().includes(term) ||
          x['warehouse']?.toLowerCase().includes(term)
      );
    }

    // status
    if (filters.status !== 'All') {
      filtered = filtered.filter((x) => x['status'] === filters.status);
    }

    // date range
    if (filters.startDate && filters.endDate) {
      const start = new Date(filters.startDate).getTime();
      const end = new Date(filters.endDate).getTime();
      filtered = filtered.filter((x) => {
        const d = new Date(x['orderDate']).getTime();
        return d >= start && d <= end;
      });
    }

    // sorting
    if (filters.sortKey) {
      filtered.sort((a, b) => {
        const aVal = a[filters.sortKey];
        const bVal = b[filters.sortKey];
        return filters.sortDirection === 'asc' ? (aVal > bVal ? 1 : -1) : aVal < bVal ? 1 : -1;
      });
    }

    // pagination
    const startIdx = (filters.page - 1) * filters.pageSize;
    const endIdx = startIdx + filters.pageSize;

    return filtered.slice(startIdx, endIdx);
  }
}
