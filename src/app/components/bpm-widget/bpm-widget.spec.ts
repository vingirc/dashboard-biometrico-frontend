import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BpmWidget } from './bpm-widget';

describe('BpmWidget', () => {
  let component: BpmWidget;
  let fixture: ComponentFixture<BpmWidget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BpmWidget],
    }).compileComponents();

    fixture = TestBed.createComponent(BpmWidget);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows the waiting state when there is no record', () => {
    expect(fixture.nativeElement.textContent).toContain('Esperando datos del sensor');
  });

  it('renders the status badge for a critical reading', async () => {
    fixture.componentRef.setInput('record', {
      id: '1',
      username: 'ana',
      heartRate: 180,
      timestamp: new Date().toISOString(),
      isCritical: true,
      isLow: false,
    });
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Crítico');
  });
});
