import { Component, inject, OnInit, TemplateRef } from '@angular/core';
import { Observable } from 'rxjs';
import { PurchaseOrderService } from '../services/purchase-order.service';
import { AsyncPipe, CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableFilterService } from '../../shared/table-filter.service';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { PurchaseOrderDetails } from '../Models/po.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-purchase-order-list',
  imports: [AsyncPipe, FormsModule, PaginationModule, DatePipe, CommonModule],
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
  private tableHelper = inject(TableFilterService<PurchaseOrderDetails>);
  private router = inject(Router);

  ngOnInit() {
    this.poService.getAllOrders().subscribe((orders) => {
      this.tableHelper.setData(orders);
    });

    this.orders$ = this.tableHelper.getFilteredData();
    this.totalCount$ = this.tableHelper.getTotalCount();

     // Subscribe to reactive order stream from service (BehaviorSubject)
    // this.orders$ = this.poService.orders$;
    // this.poService.loadOrders(); 
  }

  onSearch(term: string) {
    this.tableHelper.updateFilters({ searchTerm: term, page: 1 });
  }

  onStatusChange(value: string) {
    this.tableHelper.updateFilters({ status: value, page: 1 });
  }

  onDateRange() {
    this.tableHelper.updateFilters({
      startDate: this.startDate ?? '',
      endDate: this.endDate ?? '',
      page: 1,
    });
  }

  onSort(key: keyof PurchaseOrderDetails) {
    const current = (this.tableHelper as any)['filters$'].value;
    const dir = current.sortKey === key && current.sortDirection === 'asc' ? 'desc' : 'asc';
    this.tableHelper.updateFilters({ sortKey: key, sortDirection: dir });
  }

  currentPage = 1; // bind to ngModel

onPageChange(event: any) {
  this.currentPage = event.page;
  this.tableHelper.updateFilters({ page: this.currentPage });
}

  onEdit(id: string) {
    this.router.navigate(['/add-order/edit', id]);
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
