// =========================
// Supplier Interface
// =========================
export interface Supplier {
  id: number;
  name: string;
}

// =========================
// Warehouse Interface
// =========================
export interface Warehouse {
  id: number;
  name: string;
}

// =========================
// Product Interface
// =========================
export interface Product {
  id: number;
  name: string;
  price: number;
}

// =========================
// VAT Rate Interface
// =========================
export interface VatRate {
  id: number;
  rate: number; // Percentage
}

// =========================
// Purchase Order Item Interface
// =========================
export interface PurchaseOrderItem {
  product: string;    // Product name
  quantity: number;   // Number of units
  unitPrice: number;  // Price per unit
  lineTotal: number;  // quantity * unitPrice
}

// =========================
// Purchase Order Interface
// =========================
export interface PurchaseOrder {
  id: number;
  poNumber: string;               // e.g., "PO-1001"
  supplier: string;               // Supplier name
  warehouse: string;              // Warehouse name
  shippingAddress: string;
  vatRate: number;                // VAT percentage
  orderDate: string;              // ISO date string
  items: PurchaseOrderItem[];     // Array of line items
  subtotal: number;               // Sum of line totals
  vatAmount: number;              // Calculated VAT amount
  grandTotal: number;             // subtotal + vatAmount
  status: string;                 // e.g., "Approved", "Draft", "Received"
  memo?: string;                  // Optional memo
  attachment?: string;            // Optional file/URL
}

// =========================
// Root DB interface
// =========================
export interface AppData {
  suppliers: Supplier[];
  warehouses: Warehouse[];
  products: Product[];
  vatRates: VatRate[];
  purchaseOrders: PurchaseOrder[];
}
