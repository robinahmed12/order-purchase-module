import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { PurchaseOrderService } from '../services/purchase-order.service';
import { Router } from '@angular/router';
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
  poForm!: FormGroup;
  showSuccess = false;

  // Observables for dropdown data
  suppliers$!: Observable<Supplier[]>;
  warehouses$!: Observable<Warehouse[]>;
  products$!: Observable<Product[]>;
  vatRates$!: Observable<VatRate[]>;

  constructor(
    private fb: FormBuilder,
    private poService: PurchaseOrderService,
    public router: Router
  ) {}

  ngOnInit() {
    // Load dropdown data from service
    this.suppliers$ = this.poService.getSuppliers();
    this.warehouses$ = this.poService.getWarehouses();
    this.products$ = this.poService.getProducts();
    this.vatRates$ = this.poService.getVatRates();

    // Initialize purchase order form
    this.poForm = this.fb.group({
      supplier: ['', Validators.required],
      warehouse: ['', Validators.required],
      shippingAddress: ['', Validators.required],
      vatRate: [null, Validators.required],
      orderDate: [new Date().toISOString().slice(0, 10), Validators.required],
      items: this.fb.array([]), // form array for multiple items
      notes: [''],
      attachment: [''],
      subtotal: [0],
      vatAmount: [0],
      grandTotal: [0],
    });

    // Add one default item initially
    this.addItem();

    // Whenever 'items' or 'vatRate' changes, recalculate totals
    combineLatest([
      this.poForm.get('items')!.valueChanges.pipe(startWith(this.items.value)),
      this.poForm.get('vatRate')!.valueChanges.pipe(startWith(this.poForm.get('vatRate')!.value)),
    ]).subscribe(() => this.calculateTotals());
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

      item.patchValue({ lineTotal }, { emitEvent: false }); // avoid recursive triggers
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

  // Submit the form data to backend
  onSubmit() {
    if (this.poForm.invalid) {
      this.poForm.markAllAsTouched();
      return;
    }

    const formValue = this.poForm.value;

    // Prepare clean payload for backend
    const payload = {
      ...formValue,
      items: formValue.items.map((item: any) => ({
        productId: item.product,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal,
      })),
    };

    // Call API to create order
    this.poService.createOrder(payload).subscribe({
      next: (data) => {
        console.log('Order created:', data);
        alert('Order submitted successfully');
      },
      error: (err) => {
        console.error('Error creating order:', err);
      },
    });
  }

  // Handle file input change (store file name)
  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) this.poForm.patchValue({ attachment: file.name });
  }
}
