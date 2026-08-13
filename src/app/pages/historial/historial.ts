import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Fuse from 'fuse.js';
import { InputText } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { BehaviorSubject, combineLatest, debounceTime, map, startWith } from 'rxjs';
import { TelemetryRecord, TelemetryService } from '../../services/telemetry.service';
import { statusLabel, statusSeverity } from '../../shared/bpm-status';

const ANONYMOUS = 'Dispositivo anonimo';

const FUSE_OPTIONS = {
  keys: [{ name: 'username', getFn: (r: TelemetryRecord) => r.username ?? ANONYMOUS }],
  threshold: 0.35,
  ignoreLocation: true,
};

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [AsyncPipe, DatePipe, FormsModule, InputText, TableModule, Tag],
  templateUrl: './historial.html',
  styleUrl: './historial.css',
})
export class Historial implements OnInit {
  private readonly telemetryService = inject(TelemetryService);

  searchTerm = '';
  private readonly searchTerm$ = new BehaviorSubject<string>('');

  readonly statusLabel = statusLabel;
  readonly statusSeverity = statusSeverity;

  // Buscador reactivo (Practicas 3/4): filtra en el cliente con Fuse.js, sin recargar la pagina
  // ni volver a pedir datos al backend. La busqueda difusa tolera errores de tipeo.
  readonly filteredRecords$ = combineLatest([
    this.telemetryService.records$,
    this.searchTerm$.pipe(debounceTime(150), startWith('')),
  ]).pipe(
    map(([records, term]) => {
      const needle = term.trim();
      if (!needle) {
        return records;
      }
      return new Fuse(records, FUSE_OPTIONS).search(needle).map((result) => result.item);
    }),
  );

  ngOnInit(): void {
    this.telemetryService.fetchRecent();
  }

  onSearchChange(value: string): void {
    this.searchTerm$.next(value);
  }
}
