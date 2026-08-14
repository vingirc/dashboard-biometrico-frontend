import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Fuse, { IFuseOptions } from 'fuse.js';
import { InputText } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { BehaviorSubject, combineLatest, debounceTime, map, startWith } from 'rxjs';
import { AuditEventType, AuditLogEntry, AuditLogService } from '../../services/audit-log.service';

const EVENT_LABELS: Record<AuditEventType, string> = {
  LOGIN_SUCCESS: 'Inicio de sesión exitoso',
  LOGIN_FAILURE: 'Inicio de sesión fallido',
  USER_CREATED: 'Usuario creado',
  USER_UPDATED: 'Usuario actualizado',
  USER_ROLE_CHANGED: 'Rol modificado',
  USER_PIN_RESET: 'PIN reiniciado',
  USER_ENABLED: 'Usuario habilitado',
  USER_DISABLED: 'Usuario deshabilitado',
};

type Severity = 'success' | 'info' | 'warn' | 'danger';

const EVENT_SEVERITIES: Record<AuditEventType, Severity> = {
  LOGIN_SUCCESS: 'success',
  LOGIN_FAILURE: 'danger',
  USER_CREATED: 'success',
  USER_UPDATED: 'info',
  USER_ROLE_CHANGED: 'warn',
  USER_PIN_RESET: 'warn',
  USER_ENABLED: 'success',
  USER_DISABLED: 'danger',
};

// Se busca por la etiqueta traducida y no por el enum crudo para que escribir "inicio" encuentre
// los eventos de login tal como se ven en la tabla.
const FUSE_OPTIONS: IFuseOptions<AuditLogEntry> = {
  keys: [
    'actorUsername',
    'targetUsername',
    'detail',
    { name: 'evento', getFn: (entry) => EVENT_LABELS[entry.eventType] ?? entry.eventType },
  ],
  threshold: 0.35,
  ignoreLocation: true,
};

@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [AsyncPipe, DatePipe, FormsModule, InputText, TableModule, Tag],
  templateUrl: './audit-log.html',
})
export class AuditLog {
  private readonly auditLogService = inject(AuditLogService);

  private readonly entries$ = this.auditLogService.fetchRecent();

  searchTerm = '';
  private readonly searchTerm$ = new BehaviorSubject<string>('');

  // Mismo buscador difuso que en gestion de usuarios: filtra en el cliente, tolera errores de tipeo.
  readonly filteredEntries$ = combineLatest([
    this.entries$,
    this.searchTerm$.pipe(debounceTime(150), startWith('')),
  ]).pipe(
    map(([entries, term]) => {
      const needle = term.trim();
      if (!needle) {
        return entries;
      }
      return new Fuse(entries, FUSE_OPTIONS).search(needle).map((result) => result.item);
    }),
  );

  onSearchChange(value: string): void {
    this.searchTerm$.next(value);
  }

  // El backend manda el enum crudo; si algun dia agrega un evento nuevo, se muestra tal cual
  // en vez de quedar vacio.
  eventLabel(eventType: AuditEventType): string {
    return EVENT_LABELS[eventType] ?? eventType;
  }

  eventSeverity(eventType: AuditEventType): Severity {
    return EVENT_SEVERITIES[eventType] ?? 'info';
  }
}
