import type { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth.service';


export const roleGuard: CanActivateFn = (route, state) => {
  
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.getSessionUser();


  // Obtenemos el rol permitido
  const allowedRoles = route.data?.['roles'] as string[] | undefined;
  
  if(user && allowedRoles && allowedRoles.includes(user.role)){
    return true;
  }

  // Si el usuario no tiene el rol correspondiente redirigirlo a su ruta
  if(user){
    authService.redirectByRoleUser(user.role, router);
  }else {
    router.navigate(['/login'])
  }

  return false;
};
