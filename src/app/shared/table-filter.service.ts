import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { TableFilter } from './table-filter.model';

@Injectable({ providedIn: 'root' })
export class TableFilterService<T extends Record<string, any>> {
  getFilters() {
    throw new Error('Method not implemented.');
  }
  private originalData: T[] = [];
  private filters$ = new BehaviorSubject<TableFilter>({
    searchTerm: '',
    status: 'All',
    startDate: null,
    endDate: null,
    sortKey: '',
    sortDirection: '',
    page: 1,
    pageSize: 10,
  });

  setData(data: T[]) {
    this.originalData = data;
  }

  updateFilters(patch: Partial<TableFilter>) {
    this.filters$.next({ ...this.filters$.value, ...patch });
  }

  getFilteredData(): Observable<T[]> {
    return this.filters$.pipe(
      map((f) => {
        let data = [...this.originalData];

        if (f.searchTerm?.trim()) {
          const term = f.searchTerm.toLowerCase();
          data = data.filter(
            (item) =>
              item['poNumber']?.toLowerCase().includes(term) ||
              item['supplier']?.toLowerCase().includes(term) ||
              item['warehouse']?.toLowerCase().includes(term)
          );
        }

        if (f.status && f.status !== 'All') {
          data = data.filter((item) => item['status'] === f.status);
        }

        if (f.startDate && f.endDate) {
          const start = new Date(f.startDate);
          const end = new Date(f.endDate);
          data = data.filter((item) => {
            const orderDate = new Date(item['orderDate']);
            return orderDate >= start && orderDate <= end;
          });
        }

        if (f.sortKey) {
          data.sort((a, b) => {
            const aVal = a[f.sortKey!];
            const bVal = b[f.sortKey!];
            const compare = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
            return f.sortDirection === 'asc' ? compare : -compare;
          });
        }

        const startIdx = ((f.page || 1) - 1) * (f.pageSize || 10);
        return data.slice(startIdx, startIdx + (f.pageSize || 10));
      })
    );
  }

  getTotalCount(): Observable<number> {
    return this.filters$.pipe(
      map((f) => {
        let data = [...this.originalData];

        if (f.searchTerm?.trim()) {
          const term = f.searchTerm.toLowerCase();
          data = data.filter(
            (item) =>
              item['poNumber']?.toLowerCase().includes(term) ||
              item['supplier']?.toLowerCase().includes(term) ||
              item['warehouse']?.toLowerCase().includes(term)
          );
        }

        if (f.status && f.status !== 'All') {
          data = data.filter((item) => item['status'] === f.status);
        }

        if (f.startDate && f.endDate) {
          const start = new Date(f.startDate);
          const end = new Date(f.endDate);
          data = data.filter((item) => {
            const orderDate = new Date(item['orderDate']);
            return orderDate >= start && orderDate <= end;
          });
        }

        return data.length;
      })
    );
  }
}
