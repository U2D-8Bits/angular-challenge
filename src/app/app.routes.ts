import { Routes } from '@angular/router';
import { SimpleLayoutComponent } from './layout/simpleLayout/simpleLayout.component';

export const routes: Routes = [

    {
        path: 'login',
        component: SimpleLayoutComponent,
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: 'login'
    }

];
