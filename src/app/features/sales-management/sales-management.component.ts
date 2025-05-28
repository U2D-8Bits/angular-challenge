import { Component, OnInit } from '@angular/core';
import { CardComponent } from '../../shared/components/card/card.component';

@Component({
  standalone: true,
  imports: [
    CardComponent
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
