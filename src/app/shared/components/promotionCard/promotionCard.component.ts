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

  private createPromotionGroupEmpty(): FormGroup {
    const group = this.fb.group({
      productId: ['', Validators.required],
      productName: [''],
      listPrice: [{ value: null, disabled: true }],
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
      const selected = this.products.find((p) => p.id === +productId);
      if (selected) {
        group.patchValue({
          productName: selected.name,
          listPrice: selected.listPrice,
          minPromotionQuantity: selected.minPromotionQuantity,
          maxPromotionQuantity: selected.maxPromotionQuantity,
          minPromotionPrice: selected.minPromotionPrice,
          quantity: null,
          promotionPrice: null,
        });
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
        group.patchValue({
          productName: '',
          listPrice: null,
          minPromotionQuantity: null,
          maxPromotionQuantity: null,
          minPromotionPrice: null,
          quantity: null,
          promotionPrice: null,
        });
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
  }

  private createPromotionGroup(product?: ProductModel): FormGroup {
    return this.fb.group({
      productId: [product?.id || '', Validators.required],
      productName: [product?.name || ''],
      listPrice: [{ value: product?.listPrice || 0, disabled: true }],
      quantity: [
        product?.minPromotionQuantity || '',
        [
          Validators.required,
          Validators.min(product?.minPromotionQuantity || 1),
          Validators.max(product?.maxPromotionQuantity || 999),
        ],
      ],
      promotionPrice: [
        product?.minPromotionPrice || '',
        [
          Validators.required,
          Validators.min(product?.minPromotionPrice || 0.01),
          Validators.max(product?.listPrice ? product.listPrice - 0.01 : 99999),
        ],
      ],
      minPromotionQuantity: [product?.minPromotionQuantity || 1],
      maxPromotionQuantity: [product?.maxPromotionQuantity || 999],
      minPromotionPrice: [product?.minPromotionPrice || 0.01],
    });
  }

  addPromotion(product?: ProductModel) {
    this.promotions.push(this.createPromotionGroup(product));
    this.cdr.detectChanges();
  }

  removePromotion(index: number) {
    this.promotions.removeAt(index);
  }
}