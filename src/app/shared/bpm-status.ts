export const CRITICAL_BPM = 160;
export const LOW_BPM = 50;

export const STATUS_COLOR = {
  good: '#0ca30c',
  critical: '#d03b3b',
  low: '#3987e5',
  noSignal: '#6b7280',
};

export type BpmStatus = 'noSignal' | 'critical' | 'low' | 'normal';

type Bpm = number | null | undefined;

export function isCritical(heartRate: Bpm): boolean {
  return (heartRate ?? 0) > CRITICAL_BPM;
}

// 0 BPM no es un latido real -- es lo que manda el dispositivo cuando su sensor todavia no
// tiene una lectura valida (p. ej. el sensor virtual del emulador sin configurar). Sin este
// chequeo, esos registros se mostraban como "Normal" (0 < 160), lo cual es enganoso.
export function hasNoSignal(heartRate: Bpm): boolean {
  return (heartRate ?? 0) <= 0;
}

export function isLow(heartRate: Bpm): boolean {
  return !hasNoSignal(heartRate) && (heartRate ?? 0) < LOW_BPM;
}

export function bpmStatus(heartRate: Bpm): BpmStatus {
  if (hasNoSignal(heartRate)) return 'noSignal';
  if (isCritical(heartRate)) return 'critical';
  if (isLow(heartRate)) return 'low';
  return 'normal';
}

const LABELS: Record<BpmStatus, string> = {
  noSignal: 'Sin señal',
  critical: 'Crítico',
  low: 'Bajo',
  normal: 'Normal',
};

const BADGE_CLASSES: Record<BpmStatus, string> = {
  noSignal: 'bg-gray-500/10 text-gray-400',
  critical: 'bg-red-500/10 text-red-400',
  low: 'bg-blue-500/10 text-blue-400',
  normal: 'bg-green-500/10 text-green-400',
};

const ICONS: Record<BpmStatus, string> = {
  noSignal: 'pi-question-circle',
  critical: 'pi-exclamation-triangle',
  low: 'pi-arrow-circle-down',
  normal: 'pi-check-circle',
};

const KNOB_COLORS: Record<BpmStatus, string> = {
  noSignal: STATUS_COLOR.noSignal,
  critical: STATUS_COLOR.critical,
  low: STATUS_COLOR.low,
  normal: STATUS_COLOR.good,
};

const SEVERITIES: Record<BpmStatus, 'danger' | 'success' | 'secondary' | 'info'> = {
  noSignal: 'secondary',
  critical: 'danger',
  low: 'info',
  normal: 'success',
};

export function statusLabel(heartRate: Bpm): string {
  return LABELS[bpmStatus(heartRate)];
}

export function statusClasses(heartRate: Bpm): string {
  return BADGE_CLASSES[bpmStatus(heartRate)];
}

export function statusIcon(heartRate: Bpm): string {
  return ICONS[bpmStatus(heartRate)];
}

export function knobValueColor(heartRate: Bpm): string {
  return KNOB_COLORS[bpmStatus(heartRate)];
}

export function statusSeverity(heartRate: Bpm): 'danger' | 'success' | 'secondary' | 'info' {
  return SEVERITIES[bpmStatus(heartRate)];
}
