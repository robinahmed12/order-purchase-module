import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PurchaseOrderItem } from '../Models/po.interface';
import { PurchaseOrderService } from '../services/purchase-order.service';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-purchase-order-list',
  imports: [AsyncPipe, FormsModule],
  templateUrl: './purchase-order-list.html',
  styleUrl: './purchase-order-list.css',
})
export class PurchaseOrderList implements OnInit {

  orders$!: Observable<PurchaseOrderItem[]>;

  constructor(private poService: PurchaseOrderService) {}

  ngOnInit() {
    this.orders$ = this.poService.getAllOrders();
  }
}
