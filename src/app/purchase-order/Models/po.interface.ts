
export interface PurchaseOrder {
  id: number;
  poNumber: string;
  supplier: string;
  warehouse: string;
  orderDate: string;
  totalAmount: number;
}

export interface Supplier {
  id: number;
  name: string;
}

export interface Warehouse {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
}

export interface VatRate {
  id: number;
  rate: number;
}

export interface PurchaseOrderItem {
  poNumber: any;
  productId: number;
  quantity: number;
  price: number;
}

export interface PurchaseOrderItem {
  id: number;
  poNumber: any;
  supplier: string;
  warehouse: string;
  shippingAddress: string;
  vatRate: number;
  orderDate: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  vatAmount: number;
  grandTotal: number;
  status: 'Draft' | 'Approved' | 'Received';
  notes?: string;
}
