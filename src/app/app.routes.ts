import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { adminGuard } from './guards/admin-guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login')
      .then(m => m.Login)
  },
  {
    path: '',
    loadComponent: () => import('./layouts/app-shell/app-shell')
      .then(m => m.AppShell),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard')
          .then(m => m.Dashboard),
        data: { title: 'Dashboard en Vivo' }
      },
      {
        path: 'historial',
        loadComponent: () => import('./pages/historial/historial')
          .then(m => m.Historial),
        data: { title: 'Historial' }
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./pages/user-management/user-management')
          .then(m => m.UserManagement),
        canActivate: [adminGuard],
        data: { title: 'Gestión de Usuarios' }
      },
      {
        path: 'auditoria',
        loadComponent: () => import('./pages/audit-log/audit-log')
          .then(m => m.AuditLog),
        canActivate: [adminGuard],
        data: { title: 'Registro de Auditoría' }
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found')
      .then(m => m.NotFound)
  }
];
