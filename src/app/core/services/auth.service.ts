import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, map, catchError } from 'rxjs';

import { environment } from '../../environments/environment';
import { UserModel, RoleModel } from '../../shared/models';

import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private storage = inject(StorageService)

  private readonly USER_KEY = 'auth_user';
  private readonly apiURL: string = environment.apiUrl;


  // Método para iniciar sesión
  login(username: string, password: string): Observable<UserModel | null> {
    const url = `${this.apiURL}/users/username=${username}&password=${password}`;

    return this.http.get<UserModel[]>(url).pipe(
      map((users) => (users.length > 0 ? users[0] : null)),
      catchError(() => of(null))
    );
  }

  // Método para obtener los roles del usuario
  getRoles(): Observable<RoleModel[]> {
    const url = `${this.apiURL}/roles`;
    return this.http.get<RoleModel[]>(url);
  }

  // Método para guardar el usuario autenticado en el localStorage
  setSessionUser(user: UserModel) {
    this.storage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  // Método para obtener el usuario autenticado desde el localStorage
  getSessionUser(): UserModel | null {
    const user = this.storage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  // Método para cerrar sesión
  logout(): void {
    this.storage.removeItem(this.USER_KEY);
  }

  // Método para redireccionar al usuario según su rol
  redirectByRoleUser(role: string, router: Router) {
    if (role === 'analyst') {
      router.navigate(['/analysts']);
    } else if (role === 'manager') {
      router.navigate(['/sales-management']);
    } else {
      router.navigate(['/login']);
    }
  }
}
