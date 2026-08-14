import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { map } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { TelemetryRecord, TelemetryService } from '../../services/telemetry.service';
import { isCritical, isLow, statusLabel, statusSeverity } from '../../shared/bpm-status';

interface PersonalStats {
  totalReadings: number;
  avgHeartRate: number | null;
  minHeartRate: number | null;
  maxHeartRate: number | null;
  criticalCount: number;
  lowCount: number;
}

// El mismo resumen que el ADMIN ve por usuario, pero calculado en el cliente sobre las lecturas
// que este usuario ya tiene cargadas: no hace falta otra llamada al backend.
function summarize(records: TelemetryRecord[]): PersonalStats {
  const rates = records.map((record) => record.heartRate);

  return {
    totalReadings: records.length,
    avgHeartRate: rates.length ? rates.reduce((a, b) => a + b, 0) / rates.length : null,
    minHeartRate: rates.length ? Math.min(...rates) : null,
    maxHeartRate: rates.length ? Math.max(...rates) : null,
    criticalCount: rates.filter(isCritical).length,
    lowCount: rates.filter(isLow).length,
  };
}

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [AsyncPipe, DatePipe, TableModule, Tag],
  templateUrl: './historial.html',
  styleUrl: './historial.css',
})
export class Historial implements OnInit {
  private readonly telemetryService = inject(TelemetryService);
  private readonly authService = inject(AuthService);

  // authGuard ya resolvio /api/auth/me en la ruta padre, asi que aqui el usuario ya se conoce.
  readonly isAdmin = this.authService.currentUserSnapshot()?.role === 'ADMIN';

  readonly statusLabel = statusLabel;
  readonly statusSeverity = statusSeverity;

  readonly records$ = this.telemetryService.records$;
  readonly stats$ = this.isAdmin ? this.telemetryService.fetchStats() : null;
  readonly personalStats$ = this.records$.pipe(map(summarize));

  ngOnInit(): void {
    if (!this.isAdmin) {
      this.telemetryService.fetchRecent();
    }
  }

  formatAvg(value: number | null): string {
    return value === null ? '—' : value.toFixed(1);
  }
}
