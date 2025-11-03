import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { PurchaseOrderService } from '../../purchase-order/services/purchase-order.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
isMenuOpen=false
 total$!: Observable<number>;

  private poService = inject(PurchaseOrderService);

  ngOnInit() {
    // Ensure data is loaded once
    this.poService.loadOrders();
    this.total$ = this.poService.getTotalAmount();
  }
}
