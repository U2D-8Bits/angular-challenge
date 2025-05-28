import { Component, OnInit } from '@angular/core';


import { AuthService } from '../../../core/services/auth.service';
import { UserModel } from '../../models';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [
    CommonModule
  ],
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {

  userData: UserModel | null = null;

  constructor(
    private readonly authService: AuthService,
  ) { }

  ngOnInit() {
    this.userData = this.authService.getSessionUser();
  }

}
