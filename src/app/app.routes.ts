import { Routes } from '@angular/router';
import { Home } from './pages/home/home';

export const routes: Routes = [
  { path: '', component: Home },

  {
    path: 'purchase-orders',
    loadChildren: () =>
      import('./purchase-order/purchase-order.routes').then((m) => m.purchase_orders),
  },
];
