export function formatTime(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(clamped / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const seconds = clamped % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function formatQuantity(quantity: number, servingsRatio: number): string {
  const scaled = quantity * servingsRatio;
  if (Number.isInteger(scaled)) {
    return String(scaled);
  }
  const rounded = Math.round(scaled * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1).replace(/\.0$/, '');
}

export function formatTotalMinutes(prepMinutes: number, cookMinutes: number): string {
  const total = prepMinutes + cookMinutes;
  return `${total} min`;
}
