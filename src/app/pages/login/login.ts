import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { Button } from 'primeng/button';
import { Message } from 'primeng/message';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, InputText, Password, Button, Message],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  username = '';
  password = '';
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  submit(): void {
    if (!this.username || !this.password || this.loading()) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(this.resolveErrorMessage(err));
      },
    });
  }

  // El backend responde 401 generico para cualquier motivo (cuenta inexistente, deshabilitada,
  // bloqueada o contraseña incorrecta) a proposito -- no revela cual de esas causas aplica.
  private resolveErrorMessage(err: HttpErrorResponse): string {
    switch (err.status) {
      case 429:
        return 'Demasiados intentos desde esta red. Espera un momento antes de volver a intentar.';
      case 401:
        return 'Usuario o contraseña incorrectos.';
      default:
        return 'No se pudo iniciar sesion. Verifica tu conexion con el servidor.';
    }
  }
}
