import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { take, map } from 'rxjs';
import { AuthService } from '../services/auth.service';

// Se ejecuta despues de authGuard (que corre en la ruta padre y ya resolvio /api/auth/me), asi que
// solo lee el valor ya conocido en memoria -- no hace falta otra llamada al backend.
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    take(1),
    map((user) => {
      if (user?.role === 'ADMIN') {
        return true;
      }
      router.navigate(['/dashboard'], { queryParams: { notice: 'admin-required' } });
      return false;
    }),
  );
};
