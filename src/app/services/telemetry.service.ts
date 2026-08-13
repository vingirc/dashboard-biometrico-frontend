import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';

export interface TelemetryRecord {
  id: string;
  username: string | null;
  heartRate: number;
  timestamp: string;
  isCritical: boolean;
  isLow: boolean;
}

export interface TelemetryIngestRequest {
  userId: string;
  heartRate: number;
}

@Injectable({ providedIn: 'root' })
export class TelemetryService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/telemetry';

  private readonly recordsSubject = new BehaviorSubject<TelemetryRecord[]>([]);
  readonly records$ = this.recordsSubject.asObservable();

  readonly latest$: Observable<TelemetryRecord | null> = this.records$.pipe(
    map((records) => records[0] ?? null),
  );

  fetchRecent(): void {
    this.http.get<TelemetryRecord[]>(`${this.apiUrl}/recent`).subscribe({
      next: (records) => this.recordsSubject.next(records),
      error: (err) => console.error('Error al obtener la telemetría reciente', err),
    });
  }

  ingest(payload: TelemetryIngestRequest): Observable<TelemetryRecord> {
    return this.http.post<TelemetryRecord>(`${this.apiUrl}/ingest`, payload);
  }
}
