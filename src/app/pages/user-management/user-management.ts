import { AsyncPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import {
  BehaviorSubject,
  Observable,
  combineLatest,
  concat,
  debounceTime,
  map,
  startWith,
} from 'rxjs';
import { Role } from '../../services/auth.service';
import { AppUser, UserManagementService } from '../../services/user-management.service';

const PIN_PATTERN = /^\d{4,6}$/;

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [AsyncPipe, FormsModule, InputText, TableModule, Tag, Button, Dialog, Select, Message],
  templateUrl: './user-management.html',
  styleUrl: './user-management.css',
})
export class UserManagement implements OnInit {
  private readonly userManagementService = inject(UserManagementService);

  readonly users$ = this.userManagementService.users$;

  readonly roleOptions: { label: string; value: Role }[] = [
    { label: 'Usuario', value: 'USER' },
    { label: 'Administrador', value: 'ADMIN' },
  ];

  searchTerm = '';
  private readonly searchTerm$ = new BehaviorSubject<string>('');

  readonly editing = signal<AppUser | null>(null);
  readonly saving = signal(false);
  readonly editError = signal<string | null>(null);
  editUsername = '';
  editRole: Role = 'USER';
  editPin = '';

  // Buscador reactivo (Practicas 3/4): filtra en el cliente, sin recargar la pagina.
  readonly filteredUsers$ = combineLatest([
    this.users$,
    this.searchTerm$.pipe(debounceTime(150), startWith('')),
  ]).pipe(
    map(([users, term]) => {
      const needle = term.trim().toLowerCase();
      if (!needle) {
        return users;
      }
      return users.filter(
        (u) => u.username.toLowerCase().includes(needle) || u.role.toLowerCase().includes(needle),
      );
    }),
  );

  ngOnInit(): void {
    this.userManagementService.fetchUsers();
  }

  onSearchChange(value: string): void {
    this.searchTerm$.next(value);
  }

  toggle(user: AppUser): void {
    this.userManagementService.setEnabled(user.id, !user.isEnabled).subscribe({
      error: (err) => console.error('No se pudo actualizar el estado del usuario', err),
    });
  }

  openEdit(user: AppUser): void {
    this.editing.set(user);
    this.editUsername = user.username;
    this.editRole = user.role;
    this.editPin = '';
    this.editError.set(null);
  }

  closeEdit(): void {
    this.editing.set(null);
  }

  onDialogVisibleChange(visible: boolean): void {
    if (!visible) {
      this.closeEdit();
    }
  }

  get usernameInvalid(): boolean {
    return !this.editUsername.trim();
  }

  // El backend sigue siendo la fuente de verdad; esto solo evita viajes obvios al servidor.
  get pinInvalid(): boolean {
    return !!this.editPin && !PIN_PATTERN.test(this.editPin);
  }

  saveEdit(): void {
    const user = this.editing();
    if (!user || this.saving() || this.usernameInvalid || this.pinInvalid) {
      return;
    }

    const username = this.editUsername.trim();
    const operations: Observable<unknown>[] = [];
    if (username !== user.username) {
      operations.push(this.userManagementService.updateUser(user.id, username));
    }
    if (this.editRole !== user.role) {
      operations.push(this.userManagementService.changeRole(user.id, this.editRole));
    }
    if (this.editPin) {
      operations.push(this.userManagementService.resetPin(user.id, this.editPin));
    }

    if (!operations.length) {
      this.closeEdit();
      return;
    }

    this.saving.set(true);
    this.editError.set(null);
    concat(...operations).subscribe({
      complete: () => {
        this.saving.set(false);
        this.closeEdit();
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.editError.set(this.resolveErrorMessage(err));
        this.userManagementService.fetchUsers();
      },
    });
  }

  private resolveErrorMessage(err: HttpErrorResponse): string {
    switch (err.status) {
      case 400:
        return 'Datos invalidos. Revisa el nombre de usuario y el PIN.';
      case 409:
        return 'Ese nombre de usuario ya esta en uso.';
      case 403:
        return 'No tienes permiso para realizar este cambio.';
      default:
        return 'No se pudo guardar. Verifica tu conexion con el servidor.';
    }
  }
}
