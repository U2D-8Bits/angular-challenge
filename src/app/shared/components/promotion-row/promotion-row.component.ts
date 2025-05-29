import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProductModel } from '../../models';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-promotion-row',
  templateUrl: './promotion-row.component.html',
  styleUrls: ['./promotion-row.component.css']
})
export class PromotionRowComponent implements OnInit {

  @Input() group!: FormGroup;
  @Input() products: ProductModel[] = [];
  @Input() productOptions: {value: number | null; label: string}[] = [];
  @Input() disableRemove = false;
  @Output() remove = new EventEmitter<void>();

  constructor() { }

ngOnInit() {
  this.group.get('productId')?.valueChanges.subscribe((productId) => {
    const id = productId !== null && productId !== undefined ? Number(productId) : null;
    const selected = this.products.find((p) => p.id === id);
    if (selected) {
      this.group.patchValue(
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
      this.group.get('quantity')?.setValidators([
        Validators.required,
        Validators.min(selected.minPromotionQuantity),
        Validators.max(selected.maxPromotionQuantity),
      ]);
      this.group.get('quantity')?.updateValueAndValidity();
      this.group.get('promotionPrice')?.setValidators([
        Validators.required,
        Validators.min(selected.minPromotionPrice),
        Validators.max(selected.listPrice - 0.01),
      ]);
      this.group.get('promotionPrice')?.updateValueAndValidity();
    } else {
      this.group.patchValue(
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
      this.group.get('quantity')?.clearValidators();
      this.group.get('quantity')?.updateValueAndValidity();
      this.group.get('promotionPrice')?.clearValidators();
      this.group.get('promotionPrice')?.updateValueAndValidity();
    }
  });
}

}
