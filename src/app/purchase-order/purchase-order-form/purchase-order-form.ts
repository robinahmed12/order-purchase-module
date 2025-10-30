import { orderedItem, PurchaseOrderDetails } from './../Models/po.interface';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, inject, OnInit } from '@angular/core';
import { PurchaseOrderService } from '../services/purchase-order.service';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, Observable, startWith } from 'rxjs';
import { Product, Supplier, VatRate, Warehouse } from '../Models/po.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-purchase-order-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './purchase-order-form.html',
  styleUrl: './purchase-order-form.css',
})
export class PurchaseOrderForm implements OnInit {
  isEditMode = false;
  poForm!: FormGroup;
  showSuccess = false;

  // Observables for dropdown data
  suppliers$!: Observable<Supplier[]>;
  warehouses$!: Observable<Warehouse[]>;
  products$!: Observable<Product[]>;
  vatRates$!: Observable<VatRate[]>;

  // Injected services using Angular's functional DI
  private poService = inject(PurchaseOrderService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  constructor(private fb: FormBuilder) // private poService: PurchaseOrderService,
  // public router: Router,
  // private route: ActivatedRoute
  {}

  ngOnInit() {
    // Load dropdown data from service
    this.suppliers$ = this.poService.getSuppliers();
    this.warehouses$ = this.poService.getWarehouses();
    this.products$ = this.poService.getProducts();
    this.vatRates$ = this.poService.getVatRates();

    const orderId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!orderId && orderId !== 'add';

    // Initialize form
    this.initForm();

    if (this.isEditMode && orderId) {
      this.poService.getOrderById(orderId).subscribe((order) => {
        this.populateForm(order);
      });
    } else {
      this.addItem(); // default item for new form
    }

    // Add one default item initially
    this.addItem();

    // Whenever 'items' or 'vatRate' changes, recalculate totals
    combineLatest([
      this.poForm.get('items')!.valueChanges.pipe(startWith(this.items.value)),
      this.poForm.get('vatRate')!.valueChanges.pipe(startWith(this.poForm.get('vatRate')!.value)),
    ]).subscribe(() => this.calculateTotals());
  }

  initForm() {
    this.poForm = this.fb.group({
      supplier: ['', Validators.required],
      warehouse: ['', Validators.required],
      shippingAddress: ['', Validators.required],
      vatRate: [null, Validators.required],
      orderDate: ['', Validators.required],
      items: this.fb.array([]),
      notes: [''],
      attachment: [''],
      subtotal: [0],
      vatAmount: [0],
      grandTotal: [0],
    });
  }

  // Getter for easy access to items FormArray
  get items() {
    return this.poForm.get('items') as FormArray;
  }

  // Add a new item row
  addItem() {
    const item = this.fb.group({
      product: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(1)]],
      lineTotal: [0],
    });

    this.items.push(item);

    // Auto-calculate line total on item change
    item.valueChanges.subscribe((val) => {
      const quantity = val.quantity || 0;
      const unitPrice = val.unitPrice || 0;
      const lineTotal = quantity * unitPrice;

      item.patchValue({ lineTotal }, { emitEvent: false });
      this.calculateTotals();
    });
  }

  // Remove an item from the list
  removeItem(index: number) {
    this.items.removeAt(index);
    this.calculateTotals();
  }

  // Calculate subtotal, VAT, and grand total
  calculateTotals() {
    const items = this.items.value;
    const subtotal = items.reduce((sum: number, i: any) => sum + i.quantity * i.unitPrice, 0);

    const vatRate = this.poForm.get('vatRate')?.value || 0;
    const vatAmount = (subtotal * vatRate) / 100;
    const grandTotal = subtotal + vatAmount;

    // Patch totals without triggering more recalculations
    this.poForm.patchValue({ subtotal, vatAmount, grandTotal }, { emitEvent: false });
  }

  // When a product is selected, set its price automatically
  onProductChange(index: number) {
    const item = this.items.at(index);
    const productId = item.get('product')!.value;

    this.products$.subscribe((products) => {
      const selected = products.find((p) => p.id === productId);
      if (selected) {
        const quantity = item.get('quantity')!.value || 1;
        const unitPrice = selected.price;
        const lineTotal = quantity * unitPrice;

        item.patchValue({ unitPrice, lineTotal });
        this.calculateTotals();
      }
    });
  }

  // edit form
  populateForm(order: PurchaseOrderDetails) {
    this.poForm.patchValue({
      supplier: order.supplier,
      warehouse: order.warehouse,
      shippingAddress: order.shippingAddress,
      vatRate: order.vatRate,
      orderDate: order.orderDate,
      notes: order.notes,
      attachment: order.attachment,
    });

    // Add items from order
    order.items.forEach((item: orderedItem) => {
      const itemGroup = this.fb.group({
        product: [item.productId, Validators.required],
        quantity: [item.quantity, [Validators.required, Validators.min(1)]],
        unitPrice: [item.unitPrice, [Validators.required, Validators.min(1)]],
        lineTotal: [item.lineTotal],
      });

      this.items.push(itemGroup);

      // Subscribe to changes for recalculation
      itemGroup.valueChanges.subscribe((val) => {
        const quantity = val.quantity || 0;
        const unitPrice = val.unitPrice || 0;
        const lineTotal = quantity * unitPrice;
        itemGroup.patchValue({ lineTotal }, { emitEvent: false });
        this.calculateTotals();
      });
    });

    this.calculateTotals();
  }

  // Submit the form data to backend
  onSubmit() {
    if (this.poForm.invalid) {
      this.poForm.markAllAsTouched();
      return;
    }

    const formValue = this.poForm.value;
    const purchaseOrderData = {
      ...formValue,
      items: formValue.items.map((item: any) => ({
        productId: item.product,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal,
      })),
    };

    if (this.isEditMode) {
      const orderId = this.route.snapshot.paramMap.get('id');
      this.poService.updateOrder(orderId!, purchaseOrderData).subscribe({
        next: (data) => {
          console.log(data);
          alert('Order updated successfully');
        },
        error: (err) => console.error('Error updating order:', err),
      });
    } else {
      this.poService.createOrder(purchaseOrderData).subscribe({
        next: () => alert('Order submitted successfully'),
        error: (err) => console.error('Error creating order:', err),
      });
    }
  }

  // Handle file input change (store file name)
  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) this.poForm.patchValue({ attachment: file.name });
  }
}
