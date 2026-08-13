import { ComponentFixture, TestBed } from '@angular/core/testing';
import { lastValueFrom, of, take, toArray } from 'rxjs';

import { TelemetryRecord, TelemetryService } from '../../services/telemetry.service';
import { Historial } from './historial';

function record(username: string): TelemetryRecord {
  return {
    id: username,
    username,
    heartRate: 80,
    timestamp: new Date().toISOString(),
    isCritical: false,
    isLow: false,
  };
}

const records = [record('mariana'), record('luis'), record('ana')];

describe('Historial', () => {
  let component: Historial;
  let fixture: ComponentFixture<Historial>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Historial],
      providers: [
        {
          provide: TelemetryService,
          useValue: { records$: of(records), fetchRecent: () => {} },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Historial);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // El termino esta mal escrito a proposito: la busqueda difusa debe encontrarlo igual.
  it('matches usernames despite typos', async () => {
    component.onSearchChange('marianna');
    const emissions = await lastValueFrom(component.filteredRecords$.pipe(take(2), toArray()));

    expect(emissions[0]).toEqual(records);
    expect(emissions[1].map((r) => r.username)).toEqual(['mariana']);
  });
});
