import { Component, OnInit } from '@angular/core';
import { CardComponent } from '../../shared/components/card/card.component';
import { PromotionCardComponent } from '../../shared/components/promotionCard/promotionCard.component';

@Component({
  standalone: true,
  imports: [
    CardComponent,
    PromotionCardComponent
  ],
  selector: 'app-analysts',
  templateUrl: './analysts.component.html',
  styleUrls: ['./analysts.component.css']
})
export class AnalystsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
