import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

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
});
