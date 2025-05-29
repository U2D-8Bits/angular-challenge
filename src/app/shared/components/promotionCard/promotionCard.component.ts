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
import Swal from 'sweetalert2';

@Component({
  standalone: true,
  imports: [ButtonComponent, CommonModule, ReactiveFormsModule],
  selector: 'app-promotionCard',
  templateUrl: './promotionCard.component.html',
  styleUrls: ['./promotionCard.component.css'],
})
export class PromotionCardComponent implements OnInit {
  products: ProductModel[] = [];
  isManager = false;
  form: FormGroup;
  estadoLista: 'EDICION' | 'APROBACION' = 'EDICION';

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
      this.promotionsFormArray.valueChanges.subscribe(() => {
        this.handleFormArrayChanges();
      });
      // Al iniciar, verificar si la lista ya está en APROBACION
      const status = this.promotionsService.getPromotionStatus();
      if (status === 'APROBACION') {
        this.estadoLista = 'APROBACION';
      }
    }
  }

  private handleFormArrayChanges() {
    this.promotionsFormArray.controls.forEach((group, idx) => {
      const productId = group.get('productId')?.value;
      if (productId) {
        const product = this.products.find((p) => p.id === productId);
        if (product) {
          const patch: any = {
            listPrice: product.listPrice,
            minPromotionQuantity: product.minPromotionQuantity,
            maxPromotionQuantity: product.maxPromotionQuantity,
            minPromotionPrice: product.minPromotionPrice,
            productName: product.name,
          };
          const currentQuantity = group.get('quantity')?.value;
          if (
            currentQuantity === null ||
            currentQuantity < product.minPromotionQuantity ||
            currentQuantity > product.maxPromotionQuantity
          ) {
            patch.quantity = product.minPromotionQuantity;
          }
          const currentPromoPrice = group.get('promotionPrice')?.value;
          if (
            currentPromoPrice === null ||
            currentPromoPrice < product.minPromotionPrice ||
            currentPromoPrice >= product.listPrice
          ) {
            patch.promotionPrice = product.minPromotionPrice;
          }
          group.patchValue(patch, { emitEvent: false });
          group.get('quantity')?.setValidators([
            Validators.required,
            Validators.min(product.minPromotionQuantity),
            Validators.max(product.maxPromotionQuantity),
            Validators.pattern('^[0-9]+$'),
          ]);
          group.get('quantity')?.updateValueAndValidity({ emitEvent: false });
          group.get('promotionPrice')?.setValidators([
            Validators.required,
            Validators.min(product.minPromotionPrice),
            Validators.max(product.listPrice - 0.01),
          ]);
          group.get('promotionPrice')?.updateValueAndValidity({ emitEvent: false });
        }
      } else {
        group.patchValue(
          {
            listPrice: null,
            minPromotionQuantity: null,
            maxPromotionQuantity: null,
            minPromotionPrice: null,
            productName: '',
            quantity: null,
            promotionPrice: null,
          },
          { emitEvent: false }
        );
        group.get('quantity')?.clearValidators();
        group.get('quantity')?.updateValueAndValidity({ emitEvent: false });
        group.get('promotionPrice')?.clearValidators();
        group.get('promotionPrice')?.updateValueAndValidity({ emitEvent: false });
      }
    });
  }

  get promotionsFormArray(): FormArray<FormGroup> {
    return this.form.get('promotions') as FormArray<FormGroup>;
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
      .map((ctrl, i) => (i !== index ? Number(ctrl.get('productId')?.value) : null))
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
    group.get('productId')?.valueChanges.subscribe(() => {
      this.handleFormArrayChanges();
    });
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
    this.estadoLista = 'APROBACION';
    Swal.fire({
      icon: 'success',
      title: '¡Lista enviada!',
      text: 'Tu lista de promociones fue enviada para aprobación de gerencia.',
      confirmButtonColor: '#00c951',
      confirmButtonText: 'OK'
    });
  }

  removePromotion(index: number) {
    this.promotions.removeAt(index);
    this.cdr.detectChanges();
  }

  get disableRemove(): boolean {
    return this.promotions.length <= 1;
  }
}
