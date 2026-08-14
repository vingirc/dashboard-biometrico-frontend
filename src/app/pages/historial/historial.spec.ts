import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AuthService, Role } from '../../services/auth.service';
import {
  TelemetryRecord,
  TelemetryService,
  TelemetryUserStats,
} from '../../services/telemetry.service';
import { Historial } from './historial';

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
    lowCount: 0,
    lastReadingAt: new Date().toISOString(),
  },
];

async function createFixture(role: Role): Promise<ComponentFixture<Historial>> {
  await TestBed.configureTestingModule({
    imports: [Historial],
    providers: [
      {
        provide: TelemetryService,
        useValue: {
          records$: of(records),
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

  const fixture = TestBed.createComponent(Historial);
  await fixture.whenStable();
  return fixture;
}

describe('Historial', () => {
  it('should create', async () => {
    const fixture = await createFixture('USER');
    expect(fixture.componentInstance).toBeTruthy();
  });

  // El backend ya limita a un USER a sus propias lecturas, asi que el buscador no filtraba nada.
  it('shows a plain record list without a search box for a non-admin', async () => {
    const fixture = await createFixture('USER');
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('input[type="search"]')).toBeNull();
    expect(element.textContent).toContain('mariana');
    expect(element.textContent).toContain('80');
  });

  it('shows the per-user stats table for an admin', async () => {
    const fixture = await createFixture('ADMIN');
    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('Estadísticas por usuario');
    expect(element.textContent).toContain('81.3');
    expect(element.textContent).toContain('170');
  });
});
