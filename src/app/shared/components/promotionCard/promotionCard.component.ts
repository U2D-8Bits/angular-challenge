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
import { PromotionItemModel } from '../../models';

import { ButtonComponent } from '../button/button.component';
import { CustomInputComponent } from '../custom-input/custom-input.component';

@Component({
  standalone: true,
  imports: [
    ButtonComponent,
    CustomInputComponent,
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
  productOptions = [{ value: '', label: 'Selecciona un producto' }];

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
      if (this.promotions.length === 0) {
        this.addPromotionEmpty();
      }
    }
  }

  private setRole() {
    const user = this.authService.getSessionUser();
    this.isManager = user?.role === 'manager';
  }

  get promotions(): FormArray {
    return this.form.get('promotions') as FormArray;
  }

  private loadProducts() {
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.productOptions = [
          { value: '', label: 'Selecciona un producto' },
          ...products.map((p) => ({ value: p.id.toString(), label: p.name })),
        ];
        if (this.promotions.length === 0 && products.length > 0) {
          this.addPromotion(products[0]);
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

  private createPromotionGroupEmpty(): FormGroup {
    const group = this.fb.group({
      productId: [null, Validators.required],
      productName: [''],
      listPrice: [null],
      quantity: [null, [Validators.required]],
      promotionPrice: [null, [Validators.required]],
      minPromotionQuantity: [null],
      maxPromotionQuantity: [null],
      minPromotionPrice: [null],
    });
    this.handleProductSelection(group);
    return group;
  }

private handleProductSelection(group: FormGroup) {
  group.get('productId')?.valueChanges.subscribe((productId) => {
    const id = productId !== null ? Number(productId) : null;
    const selected = this.products.find((p) => p.id === id);
    if (selected) {
      group.patchValue(
        {
          productName: selected.name,
          listPrice: selected.listPrice,
          minPromotionQuantity: selected.minPromotionQuantity,
          maxPromotionQuantity: selected.maxPromotionQuantity,
          minPromotionPrice: selected.minPromotionPrice,
          quantity: selected.minPromotionQuantity,
          promotionPrice: selected.minPromotionPrice,
        },
        { emitEvent: false }
      );
      group.get('quantity')?.setValidators([
        Validators.required,
        Validators.min(selected.minPromotionQuantity),
        Validators.max(selected.maxPromotionQuantity),
      ]);
      group.get('quantity')?.updateValueAndValidity();
      group.get('promotionPrice')?.setValidators([
        Validators.required,
        Validators.min(selected.minPromotionPrice),
        Validators.max(selected.listPrice - 0.01),
      ]);
      group.get('promotionPrice')?.updateValueAndValidity();
    } else {
      group.patchValue(
        {
          productName: '',
          listPrice: null,
          minPromotionQuantity: null,
          maxPromotionQuantity: null,
          minPromotionPrice: null,
          quantity: null,
          promotionPrice: null,
        },
        { emitEvent: false }
      );
      group.get('quantity')?.clearValidators();
      group.get('quantity')?.updateValueAndValidity();
      group.get('promotionPrice')?.clearValidators();
      group.get('promotionPrice')?.updateValueAndValidity();
    }
  });
}

  addPromotionEmpty() {
    this.promotions.push(this.createPromotionGroupEmpty());
    this.cdr.detectChanges();
    console.log('Promociones actuales:', this.promotions.getRawValue());
  }

  private createPromotionGroup(product?: ProductModel): FormGroup {
    return this.fb.group({
      productId: [product?.id ?? null, Validators.required],
      productName: [product?.name || ''],
      listPrice: [product?.listPrice ?? null],
      quantity: [
        product?.minPromotionQuantity ?? null,
        [
          Validators.required,
          Validators.min(product?.minPromotionQuantity ?? 1),
          Validators.max(product?.maxPromotionQuantity ?? 999),
        ],
      ],
      promotionPrice: [
        product?.minPromotionPrice ?? null,
        [
          Validators.required,
          Validators.min(product?.minPromotionPrice ?? 0.01),
          Validators.max(product?.listPrice ? product.listPrice - 0.01 : 99999),
        ],
      ],
      minPromotionQuantity: [product?.minPromotionQuantity ?? null],
      maxPromotionQuantity: [product?.maxPromotionQuantity ?? null],
      minPromotionPrice: [product?.minPromotionPrice ?? null],
    });
  }

  addPromotion(product?: ProductModel) {
    this.promotions.push(this.createPromotionGroup(product));
    this.cdr.detectChanges();
    console.log('Promociones actuales:', this.promotions.getRawValue());
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
