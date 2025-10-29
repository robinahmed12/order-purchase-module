import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product, PurchaseOrderItem, Supplier, VatRate, Warehouse } from '../Models/po.interface';

@Injectable({ providedIn: 'root' })
export class PurchaseOrderService {
  baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getSuppliers(): Observable<Supplier[]> {
    return this.http.get<any[]>(`${this.baseUrl}/suppliers`);
  }
  getWarehouses(): Observable<Warehouse[]> {
    return this.http.get<any[]>(`${this.baseUrl}/warehouses`);
  }
  getProducts(): Observable<Product[]> {
    return this.http.get<any[]>(`${this.baseUrl}/products`);
  }
  getVatRates(): Observable<VatRate[]> {
    return this.http.get<any[]>(`${this.baseUrl}/vatRates`);
  }

  createOrder(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/purchaseOrders`, data);
  }

  updateOrder(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/purchaseOrders/${id}`, data);
  }

  getOrderById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/purchaseOrders/${id}`);
  }

  getAllOrders(): Observable<PurchaseOrderItem[]> {
    return this.http.get<PurchaseOrderItem[]>(`${this.baseUrl}/purchaseOrders`);
  }
}
