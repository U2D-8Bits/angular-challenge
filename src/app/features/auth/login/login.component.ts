import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { RoleModel, UserModel } from '../../../shared/models';
import { CustomInputComponent } from '../../../shared/components/custom-input/custom-input.component';

import Swal from 'sweetalert2';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  standalone: true,
  imports: [CustomInputComponent, ReactiveFormsModule, ButtonComponent],
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  submitLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const { username, password } = this.loginForm.value;

    console.log('data', this.loginForm.value)

    this.authService.login(username, password).subscribe({
      next: (user: UserModel | null) => {
        this.loading = false;

        if (!user) {
          this.alertModal('Error', 'Usuario o contraseña incorrectos', 'error');
          return;
        }

        this.authService.getRoles().subscribe({
          next: (roles: RoleModel[]) => {
            const userRole = roles.find((r) => r.code === user.role);
            if (!userRole || !userRole.isSupported) {
              this.alertModal(
                'Acceso Denegado',
                'El rol de este usuario no está soportado',
                'warning'
              );
              return;
            }

            this.authService.setSessionUser(user);
            this.authService.redirectByRoleUser(user.role, this.router);
          },
          error: () => {
            this.alertModal(
              'Error',
              'Ocurrió un error al obtener los roles.',
              'error'
            );
          },
        });
      },
      error: () => {
        this.loading = false;
        this.alertModal(
          'Error',
          'Ocurrió un error al intentar inciar sesión.',
          'error'
        );
      },
    });
  }

  alertModal(
    title: string,
    text: string,
    icon: 'success' | 'error' | 'warning' | 'info' | 'question'
  ) {
    Swal.fire({
      title,
      text,
      icon,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#166fe5',
    });
  }
}
