import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import {
  Product,
  PurchaseOrderDetails,
  Supplier,
  VatRate,
  Warehouse,
} from '../Models/po.interface';

@Injectable({ providedIn: 'root' })
export class PurchaseOrderService {
  baseUrl = 'http://localhost:3000';
  private ordersSubject = new BehaviorSubject<PurchaseOrderDetails[]>([]);
  orders$ = this.ordersSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadOrders(): void {
    this.getAllOrders().subscribe({
      next: (orders) => this.ordersSubject.next(orders),
      error: (err) => console.error('Failed to load orders:', err),
    });
  }

  getSuppliers(): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(`${this.baseUrl}/suppliers`);
  }
  getWarehouses(): Observable<Warehouse[]> {
    return this.http.get<Warehouse[]>(`${this.baseUrl}/warehouses`);
  }
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/products`);
  }
  getVatRates(): Observable<VatRate[]> {
    return this.http.get<VatRate[]>(`${this.baseUrl}/vatRates`);
  }

  createOrder(data: PurchaseOrderDetails): Observable<PurchaseOrderDetails> {
    return this.http
      .post<PurchaseOrderDetails>(`${this.baseUrl}/purchaseOrders`, data)
      .pipe(tap(() => this.loadOrders()));
  }

  getAllOrders(): Observable<PurchaseOrderDetails[]> {
    return this.http.get<PurchaseOrderDetails[]>(`${this.baseUrl}/purchaseOrders`);
  }

  getOrderById(id: string): Observable<PurchaseOrderDetails> {
    return this.http.get<PurchaseOrderDetails>(`${this.baseUrl}/purchaseOrders/${id}`);
  }

  updateOrder(id: string, data: PurchaseOrderDetails): Observable<PurchaseOrderDetails> {
    return this.http
      .put<PurchaseOrderDetails>(`${this.baseUrl}/purchaseOrders/${id}`, data)
      .pipe(tap(() => this.loadOrders()));
  }

  deleteOrder(id: string): Observable<PurchaseOrderDetails> {
    return this.http
      .delete<PurchaseOrderDetails>(`${this.baseUrl}/purchaseOrders/${id}`)
      .pipe(tap(() => this.loadOrders()));
  }
}
