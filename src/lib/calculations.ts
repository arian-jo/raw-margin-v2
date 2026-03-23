import {
  startOfMonth, endOfMonth, differenceInDays, parseISO,
  isAfter, isBefore, isSameDay, eachDayOfInterval, isWeekend,
  subDays, format
} from 'date-fns';
import { Expense, Profile, BudgetResult, HealthStatus } from '@/types/database';

/**
 * Calcula el factor de peso para un día (weekend    vs weekday).
 * Weekends = 1.5x, Weekdays = factor calculado para balance.
 */
function getDayWeight(date: Date): number {
  return isWeekend(date) ? 1.5 : 0.85;
}

/**
 * Calcula el presupuesto diario dinámico mejorado con pesos weekend/weekday.
 * Gd_ponderado = ((I - free - G_futuros - G_realizados_antes) * peso_hoy) / sum(pesos_restantes)
 */
export function calculateWeightedDailyBudget(
  profile: Profile,
  expenses: Expense[],
  currentDate: Date = new Date(),
  accountId?: string | null
): number {
  const { monthly_income: I, savings_goal: A } = profile;
  const start = startOfMonth(currentDate);
  const end = endOfMonth(currentDate);

  // Filter by account if specified, and only count gastos (not ingresos)
  const filteredExpenses = (accountId
    ? expenses.filter(e => e.account_id === accountId)
    : expenses
  ).filter(e => e.type !== 'ingreso');

  // Gastos realizados ANTES de hoy (en el mes)
  const realizadosAntes = filteredExpenses.filter(e => {
    const d = parseISO(e.date);
    return isBefore(d, currentDate) && (isSameDay(d, start) || isAfter(d, start));
  });
  const sumRealizadosAntes = realizadosAntes.reduce((acc, e) => acc + Number(e.amount), 0);

  // Gastos futuros programados (después de hoy, en el mes)
  const futurosProgramados = filteredExpenses.filter(e => {
    const d = parseISO(e.date);
    return isAfter(d, currentDate) && (isSameDay(d, end) || isBefore(d, end));
  });
  const sumFuturos = futurosProgramados.reduce((acc, e) => acc + Number(e.amount), 0);

  // Disponible para distribuir
  const disponible = I - A - sumFuturos - sumRealizadosAntes;

  // Días restantes del mes (incluyendo hoy)
  const daysRemaining = differenceInDays(end, currentDate) + 1;

  // Calcular suma de pesos de días restantes
  const remainingDays = eachDayOfInterval({ start: currentDate, end });
  const totalWeight = remainingDays.reduce((acc, d) => acc + getDayWeight(d), 0);

  // Presupuesto p ponderado para hoy
  const todayWeight = getDayWeight(currentDate);
  const gd = (disponible * todayWeight) / totalWeight;

  return Math.max(0, gd);
}

/**
 * Calcula el gasto total de un día específico
 */
function getDaySpending(expenses: Expense[], date: Date, accountId?: string | null): number {
  const filtered = accountId
    ? expenses.filter(e => e.account_id === accountId)
    : expenses;
  return filtered
    .filter(e => isSameDay(parseISO(e.date), date) && e.type !== 'ingreso')
    .reduce((acc, e) => acc + Number(e.amount), 0);
}

/**
 * Calcula la racha de días consecutivos gastando bajo presupuesto
 */
export function calculateStreak(
  profile: Profile,
  expenses: Expense[],
  currentDate: Date = new Date(),
  accountId?: string | null
): number {
  let streak = 0;
  let checkDate = subDays(currentDate, 1); // Start from yesterday
  const start = startOfMonth(currentDate);

  while (isSameDay(checkDate, start) || isAfter(checkDate, start)) {
    const dayBudget = calculateWeightedDailyBudget(profile, expenses, checkDate, accountId);
    const daySpending = getDaySpending(expenses, checkDate, accountId);

    if (daySpending <= dayBudget && daySpending > 0) {
      streak++;
    } else if (daySpending > dayBudget) {
      break; // Streak broken
    }
    // If daySpending === 0, skip (no data for that day)

    checkDate = subDays(checkDate, 1);
  }

  // Check today too
  const todayBudget = calculateWeightedDailyBudget(profile, expenses, currentDate, accountId);
  const todaySpending = getDaySpending(expenses, currentDate, accountId);
  if (todaySpending > 0 && todaySpending <= todayBudget) {
    streak++;
  }

  return streak;
}

/**
 * Calcula el Raw Margin acumulado del mes
 */
export function calculateAccumulatedMargin(
  profile: Profile,
  expenses: Expense[],
  currentDate: Date = new Date(),
  accountId?: string | null
): number {
  const start = startOfMonth(currentDate);
  const days = eachDayOfInterval({ start, end: subDays(currentDate, 1) });

  let accumulated = 0;
  for (const day of days) {
    const budget = calculateWeightedDailyBudget(profile, expenses, day, accountId);
    const spent = getDaySpending(expenses, day, accountId);
    if (spent > 0) {
      accumulated += (budget - spent);
    }
  }

  return accumulated;
}

/**
 * Proyección de ahorro a fin de mes basado en velocidad de gasto últimos 7 días
 */
export function calculateProjectedSavings(
  profile: Profile,
  expenses: Expense[],
  currentDate: Date = new Date(),
  accountId?: string | null
): number {
  const { monthly_income: I, savings_goal: A } = profile;
  const end = endOfMonth(currentDate);
  const daysRemaining = differenceInDays(end, currentDate);

  // Promedio diario de últimos 7 días
  const last7Days = Array.from({ length: 7 }, (_, i) => subDays(currentDate, i));
  let totalLast7 = 0;
  let daysWithData = 0;

  for (const day of last7Days) {
    const spent = getDaySpending(expenses, day, accountId);
    if (spent > 0) {
      totalLast7 += spent;
      daysWithData++;
    }
  }

  const avgDaily = daysWithData > 0 ? totalLast7 / daysWithData : 0;

  // Total gastado en el mes hasta hoy
  const start = startOfMonth(currentDate);
  const filteredExpenses = accountId
    ? expenses.filter(e => e.account_id === accountId)
    : expenses;
  const totalSpentMonth = filteredExpenses
    .filter(e => {
      const d = parseISO(e.date);
      return (isSameDay(d, start) || isAfter(d, start)) && (isSameDay(d, currentDate) || isBefore(d, currentDate));
    })
    .reduce((acc, e) => acc + Number(e.amount), 0);

  // Gasto futuro programado
  const futurosProgramados = filteredExpenses
    .filter(e => isAfter(parseISO(e.date), currentDate) && (isSameDay(parseISO(e.date), end) || isBefore(parseISO(e.date), end)))
    .reduce((acc, e) => acc + Number(e.amount), 0);

  // Proyección: I - total_gastado - (avgDaily * días_restantes) - futuros
  const projected = I - totalSpentMonth - (avgDaily * daysRemaining) - futurosProgramados;

  return projected;
}

/**
 * Determina el estado de salud basado en el margin acumulado
 */
export function getHealthStatus(
  profile: Profile,
  expenses: Expense[],
  currentDate: Date = new Date(),
  accountId?: string | null
): HealthStatus {
  const accMargin = calculateAccumulatedMargin(profile, expenses, currentDate, accountId);
  const dayOfMonth = currentDate.getDate();

  if (dayOfMonth <= 1) return 'healthy';

  const avgMargin = accMargin / (dayOfMonth - 1);

  if (avgMargin > 0) return 'healthy';
  if (avgMargin > -5000) return 'tight'; // Margin ligeramente negativo
  return 'danger';
}

/**
 * Cálculo completo del presupuesto con todas las mejoras V2
 */
export function calculateBudget(
  profile: Profile,
  expenses: Expense[],
  currentDate: Date = new Date(),
  accountId?: string | null
): BudgetResult {
  const dailyBudget = calculateWeightedDailyBudget(profile, expenses, currentDate, accountId);
  const totalSpentToday = getDaySpending(expenses, currentDate, accountId);
  const remainingForToday = Math.max(0, dailyBudget - totalSpentToday);
  const end = endOfMonth(currentDate);
  const daysRemaining = differenceInDays(end, currentDate) + 1;

  const rawMarginToday = dailyBudget - totalSpentToday;
  const rawMarginAccumulated = calculateAccumulatedMargin(profile, expenses, currentDate, accountId);
  const projectedSavings = calculateProjectedSavings(profile, expenses, currentDate, accountId);
  const streak = calculateStreak(profile, expenses, currentDate, accountId);
  const healthStatus = getHealthStatus(profile, expenses, currentDate, accountId);

  return {
    dailyBudget,
    totalSpentToday,
    remainingForToday,
    daysRemaining,
    rawMarginToday,
    rawMarginAccumulated,
    projectedSavings,
    streak,
    healthStatus,
  };
}

/**
 * Calcula el presupuesto para un día específico del calendario (usado por CalendarGrid)
 */
export function calculateDailyBudget(
  profile: Profile,
  expenses: Expense[],
  currentDate: Date = new Date(),
  accountId?: string | null
) {
  return calculateBudget(profile, expenses, currentDate, accountId);
}
