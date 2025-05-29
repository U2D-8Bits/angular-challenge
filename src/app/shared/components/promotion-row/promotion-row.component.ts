import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ProductModel } from '../../models';

@Component({
  standalone: true,
  imports: [],
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
  }

}
