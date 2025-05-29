import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';

import { AuthService } from '../../../core/services/auth.service';
import { ProductsService } from '../../../core/services/products.service';
import { PromotionsService } from '../../../core/services/promotions.service';

import { ProductModel } from '../../models';
import { ButtonComponent } from '../button/button.component';
import { CustomInputComponent } from '../custom-input/custom-input.component';
import Swal from 'sweetalert2';

@Component({
  standalone: true,
  imports: [ButtonComponent, CustomInputComponent, CommonModule, ReactiveFormsModule],
  selector: 'app-promotionCard',
  templateUrl: './promotionCard.component.html',
  styleUrls: ['./promotionCard.component.css'],
})
export class PromotionCardComponent implements OnInit {
  products: ProductModel[] = [];
  isManager = false;
  isAnalyst = false;
  form: FormGroup;
  estadoLista: 'EDICION' | 'APROBACION' | 'APROBADO' = 'EDICION';
  promotionListResumen: any[] = [];

  showManagerTable = false;

  managerPromoStatus: Array<'pendiente' | 'aprobada' | 'rechazada'> = [];

  productosAprobados: number[] = [];
  productosRechazados: any[] = [];

  todosAprobados = false;

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
    if (this.isManager) {
      const status = this.promotionsService.getPromotionStatus();
      this.estadoLista = status;
      this.promotionListResumen = this.promotionsService.getPromotionList();
      this.showManagerTable = status === 'APROBACION' && this.promotionListResumen.length > 0;
      this.managerPromoStatus = this.promotionListResumen.map((p: any) => p.managerStatus || 'pendiente');
    } else {
      this.loadProducts();
      this.promotionsFormArray.valueChanges.subscribe(() => {
        this.handleFormArrayChanges();
      });
      const status = this.promotionsService.getPromotionStatus();
      const lista = this.promotionsService.getPromotionList();
      this.productService.getAllProducts().subscribe((allProducts) => {
        if (lista && lista.length > 0) {
          const allApproved = allProducts.every(prod => {
            const promo = lista.find(p => p.productId === prod.id);
            return promo && promo.managerStatus === 'aprobada';
          });
          const faltanProductos = allProducts.some(prod => !lista.find(p => p.productId === prod.id));
          if (allApproved && allProducts.length > 0 && !faltanProductos) {
            this.todosAprobados = true;
            this.productosAprobados = lista.map(p => p.productId);
            this.productosRechazados = [];
            this.estadoLista = 'APROBADO';
            this.cdr.detectChanges();
            return;
          } else {
            if (status === 'APROBADO' && faltanProductos) {
              this.promotionsService.setPromotionStatus('EDICION');
              this.estadoLista = 'EDICION';
            } else {
              this.estadoLista = status;
            }
            this.todosAprobados = false;
            this.productosAprobados = lista.filter(p => p.managerStatus === 'aprobada').map(p => p.productId);
            this.productosRechazados = lista.filter(p => p.managerStatus === 'rechazada');
            const aprobados = lista.filter(p => p.managerStatus === 'aprobada');
            const formArray = this.promotionsFormArray;
            while (formArray.length > 0) {
              formArray.removeAt(0);
            }
            this.productosRechazados.forEach(promo => {
              const group = this.createPromotionGroup(promo);
              formArray.push(group);
            });
            aprobados.forEach(promo => {
              const group = this.createPromotionGroup(promo);
              formArray.push(group);
            });
            this.cdr.detectChanges();
          }
        } else {
          if (status === 'APROBACION') {
            this.estadoLista = 'APROBACION';
            this.cargarResumenPromos();
          } else {
            this.estadoLista = 'EDICION';
          }
        }
      });
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
    this.isAnalyst = user?.role === 'analyst';
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

  isApproved(promo: any): boolean {
    return promo.managerStatus === 'aprobada';
  }

  isBlocked(promo: any): boolean {
    return this.isApproved(promo);
  }

  getProductOptions(index: number) {
    const currentId = this.promotionsFormArray.at(index).get('productId')?.value;
    const idsSeleccionados = this.promotionsFormArray.controls
      .map((ctrl, i) => i !== index ? ctrl.get('productId')?.value : null)
      .filter(id => id !== null);
    // Agregar opción de placeholder como opción real
    const options = [
      { value: null, label: 'Seleccionar un producto' },
      ...this.products
        .filter(product => !idsSeleccionados.includes(product.id) || product.id === currentId)
        .map(product => ({ value: product.id, label: product.name }))
    ];
    return options;
  }

  private createPromotionGroup(promo?: any): FormGroup {
    const isAprobada = promo?.managerStatus === 'aprobada';
    return this.fb.group({
      productId: [{ value: promo?.productId ?? null, disabled: isAprobada }, Validators.required],
      productName: [{ value: promo?.productName ?? '', disabled: isAprobada }],
      listPrice: [{ value: promo?.listPrice ?? null, disabled: isAprobada || !isAprobada }],
      quantity: [{ value: promo?.quantity ?? null, disabled: isAprobada }, [Validators.required]],
      promotionPrice: [{ value: promo?.promotionPrice ?? null, disabled: isAprobada }, [Validators.required]],
      minPromotionQuantity: [{ value: promo?.minPromotionQuantity ?? null, disabled: isAprobada }],
      maxPromotionQuantity: [{ value: promo?.maxPromotionQuantity ?? null, disabled: isAprobada }],
      minPromotionPrice: [{ value: promo?.minPromotionPrice ?? null, disabled: isAprobada }],
      managerStatus: [promo?.managerStatus ?? null],
    });
  }

  createReadonlyFormControl(value: any) {
    const ctrl = new FormControl({ value, disabled: true });
    return ctrl;
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
    const prevList = this.promotionsService.getPromotionList();
    const list = this.promotions.getRawValue().map((promo: any) => {
      const prev = prevList.find((p: any) => p.productId === promo.productId);
      if (prev && prev.managerStatus === 'aprobada') {
        return { ...promo, managerStatus: 'aprobada' };
      }
      return { ...promo, managerStatus: 'pendiente' };
    });
    this.promotionsService.savePromotionList(list);
    this.promotionsService.setPromotionStatus('APROBACION');
    this.form.disable();
    this.estadoLista = 'APROBACION';
    this.cargarResumenPromos();
    Swal.fire({
      icon: 'success',
      title: '¡Lista enviada!',
      text: 'Tu lista de promociones fue enviada para aprobación de gerencia.',
      confirmButtonColor: '#00c951',
      confirmButtonText: 'OK'
    });
  }

  cargarResumenPromos() {
    this.promotionListResumen = this.promotionsService.getPromotionList();
  }

  removePromotion(index: number) {
    this.promotions.removeAt(index);
    this.cdr.detectChanges();
  }

  get disableRemove(): boolean {
    return this.promotions.length <= 1;
  }

  aprobarPromo(idx: number) {
    if (this.managerPromoStatus[idx] === 'aprobada') return;
    this.managerPromoStatus[idx] = 'aprobada';
    this.promotionListResumen[idx].managerStatus = 'aprobada';
    this.promotionsService.savePromotionList(this.promotionListResumen);
  }

  rechazarPromo(idx: number) {
    if (this.managerPromoStatus[idx] === 'aprobada') return;
    this.managerPromoStatus[idx] = 'rechazada';
    this.promotionListResumen[idx].managerStatus = 'rechazada';
    this.promotionsService.savePromotionList(this.promotionListResumen);
  }

  get puedeAprobarLista(): boolean {
    return this.managerPromoStatus.length > 0 && this.managerPromoStatus.every(s => s === 'aprobada');
  }

  get puedeEnviarAEdicion(): boolean {
    return this.managerPromoStatus.some(s => s === 'rechazada');
  }

  aprobarListaPromos() {
    this.promotionListResumen.forEach((promo, idx) => {
      promo.managerStatus = 'aprobada';
      this.managerPromoStatus[idx] = 'aprobada';
    });
    this.promotionsService.savePromotionList(this.promotionListResumen);
    this.promotionsService.setPromotionStatus('APROBADO');
    this.estadoLista = 'APROBADO';
    this.showManagerTable = false;
    Swal.fire({
      icon: 'success',
      title: '¡Lista aprobada!',
      text: 'La lista de promociones ha sido aprobada y el proceso ha finalizado.',
      confirmButtonColor: '#00c951',
      confirmButtonText: 'OK'
    });
    this.managerPromoStatus = [];
    this.promotionListResumen = [];
  }

  enviarAEdicion() {
    this.promotionsService.savePromotionList(this.promotionListResumen);
    this.promotionsService.setPromotionStatus('EDICION');
    this.estadoLista = 'EDICION';
    this.showManagerTable = false;
    Swal.fire({
      icon: 'info',
      title: 'Lista enviada a edición',
      text: 'El analista podrá modificar los ítems rechazados.',
      confirmButtonColor: '#ffb900',
      confirmButtonText: 'OK'
    });
    this.managerPromoStatus = [];
    this.promotionListResumen = [];
  }
}
