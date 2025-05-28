import type { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.getSessionUser();


  // Redirigir a "dashboard" si el usuario ya esta autenticado
  if(state.url === '/login' && user){
    authService.redirectByRoleUser(user.role, router)
    return false;
  }


  // Redirigir al login si el usuario no esta autenticado
  if(!user && state.url !== '/login'){
    router.navigate(['/login']);
    return false
  }

  return true;
};
