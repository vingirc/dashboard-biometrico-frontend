import { ComponentFixture, TestBed } from '@angular/core/testing';
import { lastValueFrom, of, take, toArray } from 'rxjs';

import { AppUser, UserManagementService } from '../../services/user-management.service';
import { UserManagement } from './user-management';

const users: AppUser[] = [
  { id: '1', username: 'mariana', role: 'USER', isEnabled: true },
  { id: '2', username: 'luis', role: 'ADMIN', isEnabled: true },
];

describe('UserManagement', () => {
  let component: UserManagement;
  let fixture: ComponentFixture<UserManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserManagement],
      providers: [
        {
          provide: UserManagementService,
          useValue: { users$: of(users), fetchUsers: () => {} },
        },
      ],
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

  // El termino esta mal escrito a proposito: la busqueda difusa debe encontrarlo igual.
  it('matches usernames despite typos', async () => {
    component.onSearchChange('marianna');
    const emissions = await lastValueFrom(component.filteredUsers$.pipe(take(2), toArray()));

    expect(emissions[0]).toEqual(users);
    expect(emissions[1].map((u) => u.username)).toEqual(['mariana']);
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
