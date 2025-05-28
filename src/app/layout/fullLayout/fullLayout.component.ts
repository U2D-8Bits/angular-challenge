import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterOutlet],
  selector: 'app-fullLayout',
  templateUrl: './fullLayout.component.html',
  styleUrls: ['./fullLayout.component.css']
})
export class FullLayoutComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
