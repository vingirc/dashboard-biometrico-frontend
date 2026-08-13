import { HttpInterceptorFn } from '@angular/common/http';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS', 'TRACE']);

// Hace que el navegador mande (y acepte) la cookie httpOnly de sesion en las llamadas cross-origin
// al backend (:4200 -> :8080). Sin esto, "credentials: 'omit'" es el default del navegador y la
// cookie de auth nunca viajaria.
//
// El interceptor XSRF nativo de Angular (withXsrfConfiguration) solo adjunta el header en requests
// al MISMO origen que la app -- por diseño, para no filtrar el token a otros dominios. Como aqui el
// backend vive en un origen distinto (:8080 vs :4200), Angular nunca mandaria X-XSRF-TOKEN, y Spring
// Security rechazaria con 403 cualquier POST/PUT/PATCH/DELETE. Se lee la cookie XSRF-TOKEN (no httpOnly,
// legible por JS a proposito) y se reenvia a mano en el header, replicando el mismo patron doble-submit.
export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  let modified = req.clone({ withCredentials: true });

  if (!SAFE_METHODS.has(req.method)) {
    const xsrfToken = readCookie('XSRF-TOKEN');
    if (xsrfToken) {
      modified = modified.clone({ setHeaders: { 'X-XSRF-TOKEN': xsrfToken } });
    }
  }

  return next(modified);
};

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}
