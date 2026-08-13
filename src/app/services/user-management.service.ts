import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Role } from './auth.service';

export interface AppUser {
  id: string;
  username: string;
  role: Role;
  isEnabled: boolean;
}

@Injectable({ providedIn: 'root' })
export class UserManagementService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/users';

  private readonly usersSubject = new BehaviorSubject<AppUser[]>([]);
  readonly users$ = this.usersSubject.asObservable();

  fetchUsers(): void {
    this.http.get<AppUser[]>(this.apiUrl).subscribe({
      next: (users) => this.usersSubject.next(users),
      error: (err) => console.error('Error al obtener los usuarios', err),
    });
  }

  setEnabled(id: string, enabled: boolean): Observable<AppUser> {
    const action = enabled ? 'enable' : 'disable';
    return this.http
      .patch<AppUser>(`${this.apiUrl}/${id}/${action}`, {})
      .pipe(tap((updated) => this.replaceInCache(updated)));
  }

  updateUser(id: string, username: string): Observable<AppUser> {
    return this.http
      .patch<AppUser>(`${this.apiUrl}/${id}`, { username })
      .pipe(tap((updated) => this.replaceInCache(updated)));
  }

  changeRole(id: string, role: Role): Observable<AppUser> {
    return this.http
      .patch<AppUser>(`${this.apiUrl}/${id}/role`, { role })
      .pipe(tap((updated) => this.replaceInCache(updated)));
  }

  resetPin(id: string, pin: string): Observable<AppUser> {
    return this.http
      .patch<AppUser>(`${this.apiUrl}/${id}/pin`, { pin })
      .pipe(tap((updated) => this.replaceInCache(updated)));
  }

  private replaceInCache(updated: AppUser): void {
    this.usersSubject.next(this.usersSubject.value.map((u) => (u.id === updated.id ? updated : u)));
  }
}
