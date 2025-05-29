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
  isAnalyst = false;
  form: FormGroup;
  estadoLista: 'EDICION' | 'APROBACION' | 'APROBADO' = 'EDICION';
  promotionListResumen: any[] = [];
  // Para manager
  showManagerTable = false;
  // Para manager: estados de cada promo
  managerPromoStatus: Array<'pendiente' | 'aprobada' | 'rechazada'> = [];

  // Para controlar productos aprobados y rechazados al volver a edición
  productosAprobados: number[] = [];
  productosRechazados: any[] = [];

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
      if (lista && lista.length > 0) {
        this.productosAprobados = lista.filter(p => p.managerStatus === 'aprobada').map(p => p.productId);
        this.productosRechazados = lista.filter(p => p.managerStatus === 'rechazada');
        const aprobados = lista.filter(p => p.managerStatus === 'aprobada');
        const formArray = this.promotionsFormArray;
        while (formArray.length > 0) {
          formArray.removeAt(0);
        }
        // Primero los rechazados (editables)
        this.productosRechazados.forEach(promo => {
          const group = this.createPromotionGroup(promo);
          formArray.push(group);
        });
        // Luego los aprobados (no editables)
        aprobados.forEach(promo => {
          const group = this.createPromotionGroup(promo);
          formArray.push(group);
        });
        this.estadoLista = status;
        this.cdr.detectChanges();
      } else {
        // Si no hay lista previa, flujo normal
        if (status === 'APROBACION') {
          this.estadoLista = 'APROBACION';
          this.cargarResumenPromos();
        } else {
          this.estadoLista = 'EDICION';
        }
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

  // Devuelve true si el item está aprobado por el manager
  isApproved(promo: any): boolean {
    return promo.managerStatus === 'aprobada';
  }

  // Devuelve true si el item está bloqueado (aprobado y no editable)
  isBlocked(promo: any): boolean {
    return this.isApproved(promo);
  }

  // Opciones de productos para el select, excluyendo los que ya están en la tabla (FormArray), excepto el actual
  getProductOptions(index: number) {
    const currentId = this.promotionsFormArray.at(index).get('productId')?.value;
    // IDs de productos ya seleccionados en la tabla (FormArray)
    const idsSeleccionados = this.promotionsFormArray.controls
      .map((ctrl, i) => i !== index ? ctrl.get('productId')?.value : null)
      .filter(id => id !== null);
    return this.products
      .filter(product => !idsSeleccionados.includes(product.id) || product.id === currentId)
      .map(product => ({ value: product.id, label: product.name }));
  }

  private createPromotionGroup(promo?: any): FormGroup {
    // Si promo es aprobado, los controles van disabled
    const isAprobada = promo?.managerStatus === 'aprobada';
    return this.fb.group({
      productId: [{ value: promo?.productId ?? null, disabled: isAprobada }, Validators.required],
      productName: [{ value: promo?.productName ?? '', disabled: isAprobada }],
      listPrice: [{ value: promo?.listPrice ?? null, disabled: isAprobada }],
      quantity: [{ value: promo?.quantity ?? null, disabled: isAprobada }, [Validators.required]],
      promotionPrice: [{ value: promo?.promotionPrice ?? null, disabled: isAprobada }, [Validators.required]],
      minPromotionQuantity: [{ value: promo?.minPromotionQuantity ?? null, disabled: isAprobada }],
      maxPromotionQuantity: [{ value: promo?.maxPromotionQuantity ?? null, disabled: isAprobada }],
      minPromotionPrice: [{ value: promo?.minPromotionPrice ?? null, disabled: isAprobada }],
      managerStatus: [promo?.managerStatus ?? null],
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

  // Al enviar la lista, cada item debe ir con managerStatus: 'pendiente'
  submitPromotions() {
    if (this.form.invalid || this.promotions.length === 0) return;
    const list = this.promotions.getRawValue().map((promo: any) => ({
      ...promo,
      managerStatus: 'pendiente'
    }));
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
    this.managerPromoStatus[idx] = 'aprobada';
    this.promotionListResumen[idx].managerStatus = 'aprobada';
    this.promotionsService.savePromotionList(this.promotionListResumen);
  }

  rechazarPromo(idx: number) {
    this.managerPromoStatus[idx] = 'rechazada';
    this.promotionListResumen[idx].managerStatus = 'rechazada';
    this.promotionsService.savePromotionList(this.promotionListResumen);
  }

  // Métodos para botones globales del gerente
  get puedeAprobarLista(): boolean {
    return this.managerPromoStatus.length > 0 && this.managerPromoStatus.every(s => s === 'aprobada');
  }

  get puedeEnviarAEdicion(): boolean {
    return this.managerPromoStatus.some(s => s === 'rechazada');
  }

  aprobarListaPromos() {
    // Guardar todos los managerStatus como 'aprobada' en localStorage
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
    // Limpiar estados locales
    this.managerPromoStatus = [];
    this.promotionListResumen = [];
  }

  enviarAEdicion() {
    // Guardar los estados actuales en localStorage
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
    // Limpiar estados locales
    this.managerPromoStatus = [];
    this.promotionListResumen = [];
  }
}
