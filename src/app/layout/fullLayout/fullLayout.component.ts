import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  selector: 'app-fullLayout',
  templateUrl: './fullLayout.component.html',
  styleUrls: ['./fullLayout.component.css']
})
export class FullLayoutComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
