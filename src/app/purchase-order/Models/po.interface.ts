export interface PurchaseOrder {
  poNumber: string;
  supplier: string;
  warehouse: string;
  orderDate: string; 
  totalAmount: number;
  status: 'Draft' | 'Approved' | 'Received';
}