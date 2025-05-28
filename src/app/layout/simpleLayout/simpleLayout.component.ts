import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterOutlet],
  selector: 'app-simpleLayout',
  templateUrl: './simpleLayout.component.html',
  styleUrls: ['./simpleLayout.component.css']
})
export class SimpleLayoutComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
