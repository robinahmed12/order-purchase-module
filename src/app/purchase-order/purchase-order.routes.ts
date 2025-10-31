import { Routes } from '@angular/router';
import { PurchaseOrderList } from './purchase-order-list/purchase-order-list';
import { PurchaseOrderForm } from './purchase-order-form/purchase-order-form';

export const purchase_orders: Routes = [
  { path: 'order-list', component: PurchaseOrderList },
  { path: 'add-order', component: PurchaseOrderForm },
  {
    path: 'add-order/edit/:id',
    component: PurchaseOrderForm,
  },
];
