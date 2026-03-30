export function generateTrackingCode(year: number = new Date().getFullYear(), sequence?: number) {
  const suffix = sequence ?? Math.floor(1000 + Math.random() * 9000);
  return `DK-${year}-${String(suffix).padStart(4, '0')}`;
}
