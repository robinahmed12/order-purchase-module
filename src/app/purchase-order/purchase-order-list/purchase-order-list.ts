import { Component, inject, OnInit, TemplateRef } from '@angular/core';
import { Observable } from 'rxjs';
import { PurchaseOrderService } from '../services/purchase-order.service';
import { AsyncPipe, CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableFilterService } from '../../shared/table-filter.service';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { PurchaseOrderDetails } from '../Models/po.interface';
import {  Router } from '@angular/router';

@Component({
  selector: 'app-purchase-order-list',
  imports: [AsyncPipe, FormsModule, PaginationModule, DatePipe, CommonModule],
  providers: [],
  templateUrl: './purchase-order-list.html',
  styleUrl: './purchase-order-list.css',
})
export class PurchaseOrderList implements OnInit {
  // Reactive data streams for filtered orders and total count
  orders$!: Observable<PurchaseOrderDetails[]>;
  totalCount$!: Observable<number>;

  // UI filter and sort state
  searchTerm = '';
  sortKey = '';
  selectedStatus = 'All';
  startDate: string | null = null;
  endDate: string | null = null;

  // Injected services using Angular's functional DI
  private poService = inject(PurchaseOrderService);
  private route = inject(Router);
  private tableHelper = inject(TableFilterService<PurchaseOrderDetails>);

  constructor() {}

  ngOnInit() {
    // Initial fetch: load all orders and push to filter service
    this.poService.getAllOrders().subscribe((orders) => {
      this.tableHelper.setData(orders);
    });

    // Bind reactive streams for filtered data and count
    this.orders$ = this.tableHelper.getFilteredData();
    this.totalCount$ = this.tableHelper.getTotalCount();

    // Subscribe to reactive order stream from service (BehaviorSubject)
    this.orders$ = this.poService.orders$;
    this.poService.loadOrders(); // triggers initial load
  }

  //  Search filter handler
  onSearch(term: string) {
    this.tableHelper.updateFilters({ searchTerm: term, page: 1 });
  }

  //  Status filter handler
  onStatusChange(value: string) {
    this.tableHelper.updateFilters({ status: value, page: 1 });
  }

  //  Date range filter handler
  onDateRange(start: string | null, end: string | null) {
    this.tableHelper.updateFilters({
      startDate: start ?? '',
      endDate: end ?? '',
      page: 1,
    });
  }

  //  Sort handler with toggle logic
  onSort(key: keyof PurchaseOrderDetails) {
    const state = (this.tableHelper as any).filters$.value;
    const direction = state.sortKey === key && state.sortDirection === 'asc' ? 'desc' : 'asc';
    this.tableHelper.updateFilters({ sortKey: key, sortDirection: direction });
  }

  //  Pagination handler
  onPageChange(page: number) {
    this.tableHelper.updateFilters({ page });
  }

  //  Navigate to edit form with selected order ID
  onEdit(id: string) {
    this.route.navigate(['/add-order/edit', id]);
  }

  //  Delete handler with reactive refresh
  handleDelete(id: string) {
    console.log('Deleting order:', id);
    this.poService.deleteOrder(id).subscribe({
      next: () => {
        console.log('Order deleted successfully');
      },
      error: (error) => {
        console.error('Delete failed:', error);
      },
    });
  }
}
