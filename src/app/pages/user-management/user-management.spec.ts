import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserManagement } from './user-management';

describe('UserManagement', () => {
  let component: UserManagement;
  let fixture: ComponentFixture<UserManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserManagement],
    }).compileComponents();

    fixture = TestBed.createComponent(UserManagement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('prefills the edit dialog with the selected user', async () => {
    component.openEdit({ id: '7', username: 'ana', role: 'ADMIN', isEnabled: true });
    await fixture.whenStable();

    expect(component.editUsername).toBe('ana');
    expect(component.editRole).toBe('ADMIN');
    expect(component.editPin).toBe('');
    expect(document.body.textContent).toContain('Editar usuario');
  });

  it('rejects a PIN that does not match the backend rule', () => {
    component.openEdit({ id: '7', username: 'ana', role: 'USER', isEnabled: true });

    component.editPin = '12';
    expect(component.pinInvalid).toBe(true);

    component.editPin = '1234';
    expect(component.pinInvalid).toBe(false);

    component.editPin = '';
    expect(component.pinInvalid).toBe(false);
  });
});
