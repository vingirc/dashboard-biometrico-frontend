import { ComponentFixture, TestBed } from '@angular/core/testing';
import { lastValueFrom, of, take, toArray } from 'rxjs';

import { AuditLogEntry, AuditLogService } from '../../services/audit-log.service';
import { AuditLog } from './audit-log';

const entries: AuditLogEntry[] = [
  {
    id: '1',
    eventType: 'LOGIN_FAILURE',
    actorUsername: 'mariana',
    targetUsername: null,
    ipAddress: '10.0.0.4',
    detail: 'PIN incorrecto',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    eventType: 'USER_ROLE_CHANGED',
    actorUsername: 'luis',
    targetUsername: 'ana',
    ipAddress: '10.0.0.9',
    detail: 'USER -> ADMIN',
    createdAt: new Date().toISOString(),
  },
];

describe('AuditLog', () => {
  let component: AuditLog;
  let fixture: ComponentFixture<AuditLog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditLog],
      providers: [{ provide: AuditLogService, useValue: { fetchRecent: () => of(entries) } }],
    }).compileComponents();

    fixture = TestBed.createComponent(AuditLog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('translates the raw event type into a readable label', () => {
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Inicio de sesión fallido',
    );
  });

  it('filters by actor despite typos', async () => {
    component.onSearchChange('marianna');
    const emissions = await lastValueFrom(component.filteredEntries$.pipe(take(2), toArray()));

    expect(emissions[0]).toEqual(entries);
    expect(emissions[1].map((entry) => entry.id)).toEqual(['1']);
  });

  // Se busca por la etiqueta que se ve en pantalla, no por el enum crudo del backend.
  it('filters by the readable event label', async () => {
    component.onSearchChange('rol modificado');
    const emissions = await lastValueFrom(component.filteredEntries$.pipe(take(2), toArray()));

    expect(emissions[1].map((entry) => entry.id)).toEqual(['2']);
  });
});
