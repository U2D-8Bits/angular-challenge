import { Component, OnInit } from '@angular/core';
import { CardComponent } from '../../shared/components/card/card.component';
import { PromotionCardComponent } from '../../shared/components/promotionCard/promotionCard.component';

@Component({
  standalone: true,
  imports: [
    CardComponent,
    PromotionCardComponent
  ],
  selector: 'app-sales-management',
  templateUrl: './sales-management.component.html',
  styleUrls: ['./sales-management.component.css']
})
export class SalesManagementComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
