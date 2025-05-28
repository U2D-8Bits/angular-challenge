import { Routes } from '@angular/router';
import { SimpleLayoutComponent } from './layout/simpleLayout/simpleLayout.component';
import { FullLayoutComponent } from './layout/fullLayout/fullLayout.component';

export const routes: Routes = [

    {
        path: 'login',
        title: 'Inicio de sesión',
        component: SimpleLayoutComponent,
        children: [
            {
                path: '',
                loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
            }
        ]
    },
    {
        path: 'analysts',
        title: 'Analistas',
        component: FullLayoutComponent,
        children: [
            {
                path: '',
                loadComponent: () => import('./features/analysts/analysts.component').then(m => m.AnalystsComponent)
            }
        ]
    },
    {
        path: 'sales-management',
        title: 'Gestión de ventas',
        component: FullLayoutComponent,
        children: [
            {
                path: '',
                loadComponent: () => import('./features/sales-management/sales-management.component').then(m => m.SalesManagementComponent),
            }
        ]
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
