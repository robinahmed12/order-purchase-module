export interface Supplier {
  id: string;
  name: string;
}

export interface Warehouse {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
}

export interface VatRate {
  id: string;
  rate: number;
}

export interface PurchaseOrderDetails {
  id: string;
  poNumber: string;
  supplier: Supplier;
  warehouse: Warehouse;
  shippingAddress: string;
  vatRate: VatRate;
  orderDate: string;
  items: orderedItem[];
  subtotal: number;
  vatAmount: number;
  grandTotal: number;
  status: 'Draft' | 'Approved' | 'Received';
  notes?: string;
  attachment?:string
}

export interface orderedItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}
