#  Purchase Order Management System (Angular)

A simple and functional **Purchase Order Management** module built with **Angular**, **Reactive Forms**, and **RxJS**.  
It allows users to **create, view, edit, delete, and filter** purchase orders with pagination, sorting, and query parameter syncing.

---

##  Features

✅ Create and edit purchase orders  
✅ Add or remove multiple items dynamically  
✅ Auto-calculate subtotal, VAT, and grand total  
✅ Search, filter by status, and date range  
✅ Sorting and pagination  
✅ URL query parameter sync for filters  
✅ Modular architecture with shared filter service  
✅ JSON-Server as a mock backend API  

---

##  Tech Stack

- **Frontend:** Angular 20+, RxJS, Tailwind/Bootstrap (optional)
- **Backend (Mock API):** JSON Server
- **UI Components:** ngx-bootstrap (pagination, modal, etc.)
- **Reactive Forms:** Angular `FormBuilder`, `FormArray`, `FormGroup`

---

## Project Structure

```
src/
├── app/
│   ├── purchase-order/
│   │   ├── components/
│   │   │   ├── purchase-order-form/
│   │   │   ├── purchase-order-list/
│   │   ├── services/
│   │   │   └── purchase-order.service.ts
│   │   ├── Models/
│   │   │   └── po.interface.ts
│   │   └── shared/
│   │       ├── table-filter.service.ts
│   │       └── table-filter.model.ts
│   └── app.component.ts
└── assets/
    └── mock-data/
        └── db.json
```


---


 db.json example:

{
  "purchaseOrders": [],
  "suppliers": [],
  "warehouses": [],
  "products": [],
  "vatRates": []
}


You can add initial mock data if you like.

## ⚙️ Setup Instructions

###  Clone the Repository

```bash
(https://github.com/robinahmed12/order-purchase-module.git)
cd purchase-order-module

Install Dependencies
npm install

npm start
json server and project both will run together

---
