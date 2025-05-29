import { Component, OnInit } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { CustomInputComponent } from '../custom-input/custom-input.component';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [
    ButtonComponent,
    CustomInputComponent,
    CommonModule
  ],
  selector: 'app-promotionCard',
  templateUrl: './promotionCard.component.html',
  styleUrls: ['./promotionCard.component.css']
})
export class PromotionCardComponent implements OnInit {

  isManager: boolean = true;

  constructor() { }

  ngOnInit() {
  }

}
