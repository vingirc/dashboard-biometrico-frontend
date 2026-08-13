import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { credentialsInterceptor } from './interceptors/credentials.interceptor';

// Nuevas importaciones de PrimeNG
import { providePrimeNG } from 'primeng/config';
import Lara from '@primeng/themes/lara';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // El manejo del header CSRF (X-XSRF-TOKEN) va dentro de credentialsInterceptor: el mecanismo nativo
    // de Angular (withXsrfConfiguration) solo funciona same-origin y aqui el backend esta en otro puerto.
    provideHttpClient(withInterceptors([credentialsInterceptor])),
    provideAnimationsAsync(),
    // Configuración del tema moderno
    providePrimeNG({
        theme: {
            preset: Lara,
            options: {
                darkModeSelector: '.dark' // Facilita el modo oscuro
            }
        }
    })
  ]
};
