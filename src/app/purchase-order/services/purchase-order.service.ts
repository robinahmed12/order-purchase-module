import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({providedIn: 'root'})
export class PurchaseOrderService {
   baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getSuppliers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/suppliers`);
  }
  getWarehouses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/warehouses`);
  }
  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/products`);
  }
  getVatRates(): Observable<any[]> {
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
}