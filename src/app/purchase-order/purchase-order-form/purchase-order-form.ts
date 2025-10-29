import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { Router } from '@angular/router';
import { map, startWith } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { PurchaseOrderService } from '../services/purchase-order.service';

@Component({
  selector: 'app-purchase-order-form',
  imports: [FormsModule],
  templateUrl: './purchase-order-form.html',
  styleUrl: './purchase-order-form.css',
})
export class PurchaseOrderForm implements OnInit {
  poForm!: FormGroup;
  constructor(
    private fb: FormBuilder,
    private poService: PurchaseOrderService,
    private router: Router
  ) {}

  suppliers$ = this.poService.getSuppliers();
  warehouses$ = this.poService.getWarehouses();
  products$ = this.poService.getProducts();
  vatRates$ = this.poService.getVatRates();

  ngOnInit() {
    this.poForm = this.fb.group({
      supplier: ['', Validators.required],
      warehouse: ['', Validators.required],
      shippingAddress: ['', Validators.required],
      vatRate: [null, Validators.required],
      orderDate: [new Date().toISOString().slice(0, 10), Validators.required],
      items: this.fb.array([]),
      notes: [''],
      attachment: [''],
    });

    this.addItem(); // At least one product by default

    // Recalculate totals whenever items or VAT change
    combineLatest([
      this.poForm.get('items')!.valueChanges.pipe(startWith(this.items.value)),
      this.poForm.get('vatRate')!.valueChanges.pipe(startWith(this.poForm.get('vatRate')!.value)),
    ]).subscribe(() => this.calculateTotals());
  }

  get items() {
    return this.poForm.get('items') as FormArray;
  }

  addItem() {
    const item = this.fb.group({
      product: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(1)]],
      lineTotal: [0],
    });
    this.items.push(item);
  }

  removeItem(index: number) {
    this.items.removeAt(index);
    this.calculateTotals();
  }

  calculateTotals() {
    const items = this.items.value;
    const subtotal = items.reduce((sum: number, i: any) => sum + i.quantity * i.unitPrice, 0);
    const vatRate = this.poForm.get('vatRate')?.value || 0;
    const vatAmount = (subtotal * vatRate) / 100;
    const grandTotal = subtotal + vatAmount;

    this.poForm.patchValue({ subtotal, vatAmount, grandTotal }, { emitEvent: false });
  }

  onSubmit() {
    if (this.poForm.invalid || this.items.length === 0) {
      alert('Please fill all required fields and add at least one item.');
      return;
    }
    this.poService.createOrder(this.poForm.value).subscribe(() => {
      alert('Purchase Order saved!');
      this.router.navigate(['/purchase-orders']);
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) this.poForm.patchValue({ attachment: file.name });
  }
}
