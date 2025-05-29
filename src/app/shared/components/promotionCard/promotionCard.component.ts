import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';

import { AuthService } from '../../../core/services/auth.service';
import { ProductsService } from '../../../core/services/products.service';
import { PromotionsService } from '../../../core/services/promotions.service';

import { ProductModel } from '../../models';

import { ButtonComponent } from '../button/button.component';
import { PromotionRowComponent } from '../promotion-row/promotion-row.component';

@Component({
  standalone: true,
  imports: [
    ButtonComponent,
    PromotionRowComponent,
    CommonModule,
    ReactiveFormsModule,
  ],
  selector: 'app-promotionCard',
  templateUrl: './promotionCard.component.html',
  styleUrls: ['./promotionCard.component.css'],
})
export class PromotionCardComponent implements OnInit {
  products: ProductModel[] = [];
  isManager = false;
  form: FormGroup;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private productService: ProductsService,
    private promotionsService: PromotionsService,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      promotions: this.fb.array([]),
    });
  }

  ngOnInit() {
    this.setRole();
    if (!this.isManager) {
      this.loadProducts();
    }
  }

  private setRole() {
    const user = this.authService.getSessionUser();
    this.isManager = user?.role === 'manager';
  }

  get promotions(): FormArray {
    return this.form.get('promotions') as FormArray;
  }

  get promotionGroups(): FormGroup[] {
    return this.promotions.controls as FormGroup[];
  }

  private loadProducts() {
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.products = products;
        if (this.promotions.length === 0 && products.length > 0) {
          this.addPromotion();
        }
      },
      error: (error) => console.log('Error => ', error),
    });
  }

  getProductOptions(index: number): { value: number | null; label: string }[] {
    const selectedIds = this.promotions.controls
      .map((ctrl, i) =>
        i !== index ? Number(ctrl.get('productId')?.value) : null
      )
      .filter((id) => id !== null);
    return [
      { value: null, label: 'Selecciona un producto' },
      ...this.products
        .filter((p) => !selectedIds.includes(p.id))
        .map((p) => ({ value: p.id, label: p.name })),
    ];
  }

  private createPromotionGroup(): FormGroup {
    return this.fb.group({
      productId: [null, Validators.required],
      productName: [''],
      listPrice: [null as number | null],
      quantity: [null as number | null, [Validators.required]],
      promotionPrice: [null as number | null, [Validators.required]],
      minPromotionQuantity: [null as number | null],
      maxPromotionQuantity: [null as number | null],
      minPromotionPrice: [null as number | null],
    });
  }

  addPromotion() {
    if (!this.products || this.products.length === 0) {
      return;
    }
    const group = this.createPromotionGroup();
    this.promotions.push(group);
    this.cdr.detectChanges();
  }

  submitPromotions() {
    if (this.form.invalid || this.promotions.length === 0) return;
    const list = this.promotions.getRawValue().map((promo: any) => ({
      productId: +promo.productId,
      productName: promo.productName,
      listPrice: promo.listPrice,
      quantity: promo.quantity,
      promotionPrice: promo.promotionPrice,
      minPromotionQuantity: promo.minPromotionQuantity,
      maxPromotionQuantity: promo.maxPromotionQuantity,
      minPromotionPrice: promo.minPromotionPrice,
    }));
    this.promotionsService.savePromotionList(list);
    this.promotionsService.setPromotionStatus('APROBACION');
    this.form.disable();
  }

  removePromotion(index: number) {
    this.promotions.removeAt(index);
  }
}