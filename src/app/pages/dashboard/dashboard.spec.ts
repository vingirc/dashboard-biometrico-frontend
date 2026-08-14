import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { AuthService, Role } from '../../services/auth.service';
import {
  TelemetryRecord,
  TelemetryService,
  TelemetryUserStats,
} from '../../services/telemetry.service';
import { Dashboard } from './dashboard';

const records: TelemetryRecord[] = [
  {
    id: '1',
    username: 'mariana',
    heartRate: 80,
    timestamp: new Date().toISOString(),
    isCritical: false,
    isLow: false,
  },
];

const stats: TelemetryUserStats[] = [
  {
    username: 'mariana',
    totalReadings: 12,
    avgHeartRate: 81.25,
    minHeartRate: 62,
    maxHeartRate: 170,
    criticalCount: 2,
    lowCount: 1,
    lastReadingAt: new Date().toISOString(),
  },
  {
    username: 'luis',
    totalReadings: 8,
    avgHeartRate: 70,
    minHeartRate: 60,
    maxHeartRate: 90,
    criticalCount: 0,
    lowCount: 3,
    lastReadingAt: new Date().toISOString(),
  },
];

async function createFixture(role: Role): Promise<ComponentFixture<Dashboard>> {
  await TestBed.configureTestingModule({
    imports: [Dashboard],
    providers: [
      provideRouter([]),
      {
        provide: TelemetryService,
        useValue: {
          records$: of(records),
          latest$: of(records[0]),
          fetchRecent: () => {},
          fetchStats: () => of(stats),
        },
      },
      {
        provide: AuthService,
        useValue: { currentUserSnapshot: () => ({ username: 'mariana', role }) },
      },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(Dashboard);
  await fixture.whenStable();
  return fixture;
}

describe('Dashboard', () => {
  it('should create', async () => {
    const fixture = await createFixture('USER');
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shows the live heart rate widget for a non-admin', async () => {
    const fixture = await createFixture('USER');
    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('Historial de pulsaciones');
    expect(element.textContent).not.toContain('Resumen del sistema');
  });

  // Un ADMIN recibe en /recent lecturas de varios usuarios: mostrarlas mezcladas no tiene sentido.
  it('shows aggregated system totals instead of individual readings for an admin', async () => {
    const fixture = await createFixture('ADMIN');
    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('Resumen del sistema');
    expect(element.textContent).not.toContain('Historial de pulsaciones');

    const tiles = Array.from(element.querySelectorAll('dl div')).map((tile) => [
      tile.querySelector('dt')?.textContent?.trim(),
      tile.querySelector('dd')?.textContent?.trim(),
    ]);
    expect(tiles).toEqual([
      ['Usuarios monitoreados', '2'],
      ['Lecturas totales', '20'],
      ['Lecturas críticas', '2'],
      ['Lecturas bajas', '4'],
    ]);
  });
});
