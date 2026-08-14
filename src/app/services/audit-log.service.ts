import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export type AuditEventType =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE'
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'USER_ROLE_CHANGED'
  | 'USER_PIN_RESET'
  | 'USER_ENABLED'
  | 'USER_DISABLED';

export interface AuditLogEntry {
  id: string;
  eventType: AuditEventType;
  actorUsername: string | null;
  targetUsername: string | null;
  ipAddress: string | null;
  detail: string | null;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class AuditLogService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/audit-logs';

  fetchRecent(): Observable<AuditLogEntry[]> {
    return this.http.get<AuditLogEntry[]>(this.apiUrl);
  }
}
