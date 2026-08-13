import { DatePipe, NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Knob } from 'primeng/knob';
import { TelemetryRecord } from '../../services/telemetry.service';
import { knobValueColor, statusClasses, statusIcon, statusLabel } from '../../shared/bpm-status';

@Component({
  selector: 'app-bpm-widget',
  standalone: true,
  imports: [DatePipe, NgClass, FormsModule, Knob],
  templateUrl: './bpm-widget.html',
})
export class BpmWidget {
  @Input() record: TelemetryRecord | null = null;

  readonly statusLabel = statusLabel;
  readonly statusClasses = statusClasses;
  readonly statusIcon = statusIcon;
  readonly knobValueColor = knobValueColor;
}
