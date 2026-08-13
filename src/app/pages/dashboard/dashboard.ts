import { AsyncPipe } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { UIChart } from 'primeng/chart';
import { Subscription, interval, map } from 'rxjs';
import { BpmWidget } from '../../components/bpm-widget/bpm-widget';
import { WearableCallout } from '../../components/wearable-callout/wearable-callout';
import { TelemetryRecord, TelemetryService } from '../../services/telemetry.service';
import { CRITICAL_BPM, STATUS_COLOR, isCritical } from '../../shared/bpm-status';

const POLL_INTERVAL_MS = 3000;

const SERIES_BLUE = '#3987e5';
const GRID_COLOR = 'rgba(255, 255, 255, 0.08)';
const TICK_COLOR = '#9ca3af';

@Component({
  selector: 'app-dashboard',
  imports: [AsyncPipe, UIChart, BpmWidget, WearableCallout],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, OnDestroy {
  private readonly telemetryService = inject(TelemetryService);
  private pollingSubscription?: Subscription;

  readonly records$ = this.telemetryService.records$;
  readonly latest$ = this.telemetryService.latest$;

  readonly chartData$ = this.records$.pipe(map((records) => this.buildChartData(records)));

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
    this.telemetryService.fetchRecent();
    this.pollingSubscription = interval(POLL_INTERVAL_MS).subscribe(() =>
      this.telemetryService.fetchRecent(),
    );
  }

  ngOnDestroy(): void {
    this.pollingSubscription?.unsubscribe();
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
