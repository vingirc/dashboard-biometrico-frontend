import { AsyncPipe } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UIChart } from 'primeng/chart';
import { Message } from 'primeng/message';
import { EMPTY, Subscription, catchError, interval, map, startWith, switchMap } from 'rxjs';
import { BpmWidget } from '../../components/bpm-widget/bpm-widget';
import { WearableCallout } from '../../components/wearable-callout/wearable-callout';
import { AuthService } from '../../services/auth.service';
import {
  TelemetryRecord,
  TelemetryService,
  TelemetryUserStats,
} from '../../services/telemetry.service';
import { CRITICAL_BPM, STATUS_COLOR, isCritical } from '../../shared/bpm-status';

const POLL_INTERVAL_MS = 3000;

const SERIES_BLUE = '#3987e5';
const GRID_COLOR = 'rgba(255, 255, 255, 0.08)';
const TICK_COLOR = '#9ca3af';

interface SystemSummary {
  monitoredUsers: number;
  totalReadings: number;
  criticalReadings: number;
  lowReadings: number;
}

const EMPTY_SUMMARY: SystemSummary = {
  monitoredUsers: 0,
  totalReadings: 0,
  criticalReadings: 0,
  lowReadings: 0,
};

function summarize(stats: TelemetryUserStats[]): SystemSummary {
  return stats.reduce<SystemSummary>(
    (acc, row) => ({
      monitoredUsers: acc.monitoredUsers + 1,
      totalReadings: acc.totalReadings + row.totalReadings,
      criticalReadings: acc.criticalReadings + row.criticalCount,
      lowReadings: acc.lowReadings + row.lowCount,
    }),
    EMPTY_SUMMARY,
  );
}

@Component({
  selector: 'app-dashboard',
  imports: [AsyncPipe, UIChart, Message, BpmWidget, WearableCallout],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, OnDestroy {
  private readonly telemetryService = inject(TelemetryService);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private pollingSubscription?: Subscription;

  readonly adminRequiredNotice = signal(false);

  // Un ADMIN recibe en /recent las lecturas de todo el mundo, asi que el widget y la grafica
  // mezclarian usuarios. Para ese rol se muestra el agregado del sistema, sin datos individuales.
  readonly isAdmin = this.authService.currentUserSnapshot()?.role === 'ADMIN';

  readonly records$ = this.telemetryService.records$;
  readonly latest$ = this.telemetryService.latest$;

  readonly chartData$ = this.records$.pipe(map((records) => this.buildChartData(records)));

  // El catchError va dentro del switchMap para que un fallo de red no mate el sondeo: se conserva
  // el ultimo resumen y el siguiente tick vuelve a intentarlo.
  readonly summary$ = interval(POLL_INTERVAL_MS).pipe(
    startWith(0),
    switchMap(() =>
      this.telemetryService.fetchStats().pipe(
        catchError((err) => {
          console.error('Error al obtener el resumen de telemetría', err);
          return EMPTY;
        }),
      ),
    ),
    map(summarize),
    startWith(EMPTY_SUMMARY),
  );

  readonly chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 300 },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#111827',
        titleColor: '#ffffff',
        bodyColor: '#e5e7eb',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 10,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: TICK_COLOR, maxRotation: 0 },
      },
      y: {
        suggestedMin: 40,
        suggestedMax: 200,
        grid: { color: GRID_COLOR },
        ticks: { color: TICK_COLOR, stepSize: 40 },
      },
    },
  };

  ngOnInit(): void {
    this.readAdminRequiredNotice();
    if (this.isAdmin) {
      return;
    }
    this.telemetryService.fetchRecent();
    this.pollingSubscription = interval(POLL_INTERVAL_MS).subscribe(() =>
      this.telemetryService.fetchRecent(),
    );
  }

  ngOnDestroy(): void {
    this.pollingSubscription?.unsubscribe();
  }

  dismissAdminRequiredNotice(): void {
    this.adminRequiredNotice.set(false);
  }

  // adminGuard redirige aqui con ?notice=admin-required. Se limpia la URL enseguida para que
  // recargar la pagina no vuelva a mostrar el aviso.
  private readAdminRequiredNotice(): void {
    if (this.route.snapshot.queryParamMap.get('notice') !== 'admin-required') {
      return;
    }
    this.adminRequiredNotice.set(true);
    this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true });
  }

  private buildChartData(records: TelemetryRecord[]) {
    const chronological = [...records].reverse();

    return {
      labels: chronological.map((r) =>
        new Date(r.timestamp).toLocaleTimeString('es-MX', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      ),
      datasets: [
        {
          data: chronological.map((r) => r.heartRate),
          borderColor: SERIES_BLUE,
          backgroundColor: 'rgba(57, 135, 229, 0.1)',
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: chronological.map((r) =>
            isCritical(r.heartRate) ? STATUS_COLOR.critical : SERIES_BLUE,
          ),
          pointBorderColor: '#1f2937',
          pointBorderWidth: 2,
          tension: 0.35,
          fill: true,
          segment: {
            borderColor: (ctx: { p0: { parsed: { y: number } }; p1: { parsed: { y: number } } }) =>
              ctx.p0.parsed.y > CRITICAL_BPM || ctx.p1.parsed.y > CRITICAL_BPM
                ? STATUS_COLOR.critical
                : undefined,
          },
        },
      ],
    };
  }
}
