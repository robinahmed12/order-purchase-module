import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { Component, inject, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { PurchaseOrderService } from '../services/purchase-order.service';
import { AsyncPipe, CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableFilterService } from '../../shared/table-filter.service';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { PurchaseOrderDetails } from '../Models/po.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-purchase-order-list',
  imports: [
    AsyncPipe,
    FormsModule,
    ReactiveFormsModule,
    PaginationModule,
    DatePipe,
    CommonModule,
    BsDatepickerModule,
    BsDropdownModule,
  ],
  providers: [],
  templateUrl: './purchase-order-list.html',
  styleUrl: './purchase-order-list.css',
})
export class PurchaseOrderList implements OnInit {
  orders$!: Observable<PurchaseOrderDetails[]>;
  totalCount$!: Observable<number>;

  searchTerm = '';
  selectedStatus = 'All';
  startDate: string | null = null;
  endDate: string | null = null;

  private poService = inject(PurchaseOrderService);
  private tableFilterService = inject(TableFilterService<PurchaseOrderDetails>);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit() {
    this.poService.getAllOrders().subscribe((orders) => {
      this.tableFilterService.setData(orders);
    });

    // Bind filtered/paginated data
    this.orders$ = this.tableFilterService.getFilteredData();
    this.totalCount$ = this.tableFilterService.getTotalCount();

    //
    this.route.queryParams.subscribe((params) => {
      this.tableFilterService.setFiltersFromQuery(params);
    });
  }

  onSearch(term: string) {
    this.tableFilterService.updateFilters({ searchTerm: term, page: 1 });
    this.syncQueryParams();
  }

  onStatusChange(value: string) {
    this.tableFilterService.updateFilters({ status: value, page: 1 });
    this.syncQueryParams();
  }

  onDateRange() {
    this.tableFilterService.updateFilters({
      startDate: this.startDate ?? '',
      endDate: this.endDate ?? '',
      page: 1,
    });
    this.syncQueryParams();
  }

  onSort(key: keyof PurchaseOrderDetails) {
    const current = (this.tableFilterService as any)['filters$'].value;
    const dir = current.sortKey === key && current.sortDirection === 'asc' ? 'desc' : 'asc';
    this.tableFilterService.updateFilters({ sortKey: key, sortDirection: dir });
    this.syncQueryParams();
  }

  currentPage = 1;

  onPageChange(event: any) {
    this.tableFilterService.updateFilters({ page: event.page });
    this.syncQueryParams();
  }

  // query params sync method
  syncQueryParams() {
    const filters = this.tableFilterService.getFilters();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: filters,
      queryParamsHandling: 'merge',
    });
  }

  // order edit method

  onEdit(id: string) {
    this.router.navigate(['purchase-orders/add-order/edit', id]);
  }

  // order delete method
  handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this order?')) {
      this.poService.deleteOrder(id).subscribe({
        next: () => {
          this.poService.getAllOrders().subscribe((orders) => {
            this.tableFilterService.setData(orders);
          });
        },
        error: (error) => console.error('Delete failed:', error),
      });
    }
  }

  addOrder() {
    this.router.navigate(['/purchase-orders/add-order']);
  }

  //   bsConfig = {
  //   dateInputFormat: 'YYYY-MM-DD',
  //   containerClass: 'theme-blue'
  // };
  // dateRange!: Date[];

}
