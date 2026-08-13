import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, of, tap } from 'rxjs';

export type Role = 'USER' | 'ADMIN';

export interface AuthUser {
  username: string;
  role: Role;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginPinRequest {
  username: string;
  pin: string;
}

// El JWT ya no pasa por el cliente: vive en una cookie httpOnly que el navegador adjunta solo,
// invisible para JavaScript (mitigacion contra robo de token via XSS). Este servicio solo guarda
// en memoria quien esta logueado (para la UI), nunca el token en si.
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/auth';

  private readonly currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  readonly currentUser$ = this.currentUserSubject.asObservable();

  login(payload: LoginRequest): Observable<AuthUser> {
    return this.http
      .post<AuthUser>(`${this.apiUrl}/login`, payload)
      .pipe(tap((user) => this.currentUserSubject.next(user)));
  }

  loginPin(payload: LoginPinRequest): Observable<AuthUser> {
    return this.http
      .post<AuthUser>(`${this.apiUrl}/login-pin`, payload)
      .pipe(tap((user) => this.currentUserSubject.next(user)));
  }

  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
      next: () => this.currentUserSubject.next(null),
      error: () => this.currentUserSubject.next(null),
    });
  }

  // Le pregunta al backend "quien soy" segun la cookie que haya (o no) en la request. La usan los
  // guards para decidir si una ruta es accesible, ya que no hay ningun token local que inspeccionar.
  fetchCurrentUser(): Observable<AuthUser | null> {
    return this.http.get<AuthUser>(`${this.apiUrl}/me`).pipe(
      tap((user) => this.currentUserSubject.next(user)),
      catchError(() => {
        this.currentUserSubject.next(null);
        return of(null);
      }),
    );
  }

  currentUserSnapshot(): AuthUser | null {
    return this.currentUserSubject.value;
  }
}
