import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PurchaseOrderItem } from '../Models/po.interface';
import { PurchaseOrderService } from '../services/purchase-order.service';
import { AsyncPipe, CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableFilterService } from '../../shared/table-filter.service';
import { PaginationModule } from 'ngx-bootstrap/pagination';

@Component({
  selector: 'app-purchase-order-list',
  imports: [AsyncPipe, FormsModule, PaginationModule, DatePipe , CommonModule],
  templateUrl: './purchase-order-list.html',
  styleUrl: './purchase-order-list.css',
})
export class PurchaseOrderList implements OnInit {
 orders$!: Observable<PurchaseOrderItem[]>;
  totalCount$!: Observable<number>;

  searchTerm = '';
  selectedStatus = 'All';
  startDate: string | null = null;
  endDate: string | null = null;

  constructor(
    private poService: PurchaseOrderService,
    private tableHelper: TableFilterService<PurchaseOrderItem>
  ) {}

  ngOnInit() {
    this.poService.getAllOrders().subscribe((orders) => {
      this.tableHelper.setData(orders);
    });

    this.orders$ = this.tableHelper.getFilteredData();
    this.totalCount$ = this.tableHelper.getTotalCount();
  }

  onSearch(term: string) {
    this.tableHelper.updateFilters({ searchTerm: term, page: 1 });
  }
onStatusChange(value: string) {
  this.tableHelper.updateFilters({ status: value, page: 1 });
}

  onDateRange(start: string | null, end: string | null) {
  this.tableHelper.updateFilters({
    startDate: start ?? '',
    endDate: end ?? '',
    page: 1
  });
}

  onSort(key: keyof PurchaseOrderItem) {
    const state = (this.tableHelper as any).filters$.value;
    const direction =
      state.sortKey === key && state.sortDirection === 'asc' ? 'desc' : 'asc';
    this.tableHelper.updateFilters({ sortKey: key, sortDirection: direction });
  }

  onPageChange(page: number) {
    this.tableHelper.updateFilters({ page });
  }
}
