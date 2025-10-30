import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { PurchaseOrderList } from './purchase-order/purchase-order-list/purchase-order-list';
import { PurchaseOrderForm } from './purchase-order/purchase-order-form/purchase-order-form';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'order-list', component: PurchaseOrderList },
  { path: 'add-order', component: PurchaseOrderForm },
  {
    path: "add-order/edit/:id", component: PurchaseOrderForm
  }
];
