import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { AuditEventType, AuditLogService } from '../../services/audit-log.service';

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

@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [AsyncPipe, DatePipe, TableModule, Tag],
  templateUrl: './audit-log.html',
})
export class AuditLog {
  private readonly auditLogService = inject(AuditLogService);

  readonly entries$ = this.auditLogService.fetchRecent();

  // El backend manda el enum crudo; si algun dia agrega un evento nuevo, se muestra tal cual
  // en vez de quedar vacio.
  eventLabel(eventType: AuditEventType): string {
    return EVENT_LABELS[eventType] ?? eventType;
  }

  eventSeverity(eventType: AuditEventType): Severity {
    return EVENT_SEVERITIES[eventType] ?? 'info';
  }
}
