import { Component, OnInit } from '@angular/core';
import { CardComponent } from '../../shared/components/card/card.component';

@Component({
  standalone: true,
  imports: [
    CardComponent
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
