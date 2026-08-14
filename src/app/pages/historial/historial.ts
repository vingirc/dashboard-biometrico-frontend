import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { AuthService } from '../../services/auth.service';
import { TelemetryService } from '../../services/telemetry.service';
import { statusLabel, statusSeverity } from '../../shared/bpm-status';

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

  ngOnInit(): void {
    if (!this.isAdmin) {
      this.telemetryService.fetchRecent();
    }
  }

  formatAvg(value: number | null): string {
    return value === null ? '—' : value.toFixed(1);
  }
}
