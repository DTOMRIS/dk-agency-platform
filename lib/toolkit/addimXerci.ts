/**
 * Addım Xərci Kalkulyatoru — təmiz hesab (TASK-0450).
 *
 * Boş yola (artıq addıma) ödənən əmək haqqı:
 *   aylıq = artıq dəqiqə × işçi × saatlıq əmək haqqı ÷ 60 × iş günü
 *
 * Uydurma statistika yoxdur: bütün girişləri istifadəçi öz ölçməsindən qoyur
 * (spagetti diaqramı / 30 dəqiqəlik müşahidə).
 */

export interface AddimXerciInput {
  /** İzlənən vəzifədə işçi sayı */
  workers: number;
  /** Bir işçinin gündə artıq yola sərf etdiyi dəqiqə */
  extraMinutesPerDay: number;
  /** Saatlıq əmək haqqı (₼) */
  hourlyWage: number;
  /** Ayda iş günü */
  workDaysPerMonth: number;
}

export interface AddimXerciResult {
  monthlyCost: number;
  yearlyCost: number;
  lostHoursPerDay: number;
  lostHoursPerMonth: number;
}

const nonNegative = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0);

/** Gediş sayı × bir gedişin saniyəsi → dəqiqə */
export function tripsToMinutes(tripsPerDay: number, secondsPerTrip: number): number {
  return (nonNegative(tripsPerDay) * nonNegative(secondsPerTrip)) / 60;
}

/** Aylıq maaş ÷ ayda iş saatı → saatlıq əmək haqqı */
export function hourlyFromMonthly(monthlySalary: number, monthlyHours: number): number {
  const hours = nonNegative(monthlyHours);
  return hours > 0 ? nonNegative(monthlySalary) / hours : 0;
}

export function calculateAddimXerci(input: AddimXerciInput): AddimXerciResult {
  const workers = nonNegative(input.workers);
  const minutes = nonNegative(input.extraMinutesPerDay);
  const wage = nonNegative(input.hourlyWage);
  const days = nonNegative(input.workDaysPerMonth);

  const lostHoursPerDay = (minutes * workers) / 60;
  const lostHoursPerMonth = lostHoursPerDay * days;
  const monthlyCost = lostHoursPerMonth * wage;

  return { monthlyCost, yearlyCost: monthlyCost * 12, lostHoursPerDay, lostHoursPerMonth };
}
