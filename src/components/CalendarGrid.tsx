'use client';

import { Expense, Profile } from '@/types/database';
import { calculateBudget, getMonthsActive } from '@/lib/calculations';
import {
  startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday,
  parseISO, isBefore, getDay
} from 'date-fns';

interface CalendarGridProps {
  profile: Profile | null;
  expenses: Expense[];
  currentMonth: Date;
  selectedDate: Date;
  selectedAccountId: string | null;
  onSelectDate: (date: Date) => void;
}

export default function CalendarGrid({
  profile, expenses, currentMonth, selectedDate, selectedAccountId, onSelectDate
}: CalendarGridProps) {
  const start = startOfMonth(currentMonth);
  const end = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start, end });
  const today = new Date();

  // Calculate starting offset (Sunday = 0)
  const startDayOfWeek = getDay(start); // 0=Sun, 1=Mon...

  // Filter expenses by account
  const filteredExpenses = selectedAccountId
    ? expenses.filter(e => e.account_id === selectedAccountId)
    : expenses;

  // Calculate running balance for the month
  // We compute total disposable based on months active up to the start of this month
  const runningBalances: Map<string, number> = new Map();
  const monthlyIncome = profile?.monthly_income || 0;
  const savingsGoal = profile?.savings_goal || 0;
  const monthsActive = profile ? getMonthsActive(profile, filteredExpenses, start) : 1;
  const disposable = (monthlyIncome - savingsGoal) * Math.max(1, monthsActive);

  // We find exactly what the user net-spent before the 1st of this month
  const pastExpenses = filteredExpenses.filter(e => isBefore(parseISO(e.date), start));
  const pastNet = pastExpenses.reduce((acc, e) => acc + (e.type === 'ingreso' ? -Number(e.amount) : Number(e.amount)), 0);

  // The starting debt/surplus for this month
  let cumulativeSpent = pastNet;

  for (const day of days) {
    const dayExpenses = filteredExpenses.filter(e => isSameDay(parseISO(e.date), day));
    const dayNet = dayExpenses.reduce((acc, e) => {
      const amount = Number(e.amount);
      return acc + (e.type === 'ingreso' ? -amount : amount); // ingreso reduces "spent"
    }, 0);
    cumulativeSpent += dayNet;
    const balance = disposable - cumulativeSpent;
    runningBalances.set(day.toISOString(), balance);
  }

  // Get number of transactions per day
  const getTransactionCount = (day: Date): number => {
    return filteredExpenses.filter(e => isSameDay(parseISO(e.date), day)).length;
  };

  // Get spending for a day (only gastos, not ingresos)
  const getDaySpending = (day: Date): number => {
    return filteredExpenses
      .filter(e => isSameDay(parseISO(e.date), day) && e.type !== 'ingreso')
      .reduce((acc, e) => acc + Number(e.amount), 0);
  };

  // Determine cell color based on margin
  const getCellClass = (day: Date): string => {
    const isSelected = isSameDay(day, selectedDate);
    const isTodayDay = isToday(day);
    const spending = getDaySpending(day);
    const isPast = isBefore(day, today) && !isTodayDay;

    let baseClass = 'cal-cell';

    // Incomes visually highlight the day green
    if (spending < 0) {
      baseClass = 'cal-cell cal-cell--income';
    } 
    // Past days with actual expenses are colored based on budget
    else if (isPast && spending > 0 && profile) {
      const budget = calculateBudget(profile, expenses, day, selectedAccountId);
      if (spending > budget.dailyBudget) {
        baseClass = 'cal-cell cal-cell--over';
      } else {
        baseClass = 'cal-cell cal-cell--under';
      }
    }

    if (isSelected) return `${baseClass} cal-cell--selected`;
    if (isTodayDay) return `${baseClass} cal-cell--today`;

    return baseClass;
  };

  const formatBalance = (value: number): string => {
    if (Math.abs(value) >= 1000) {
      return `${(value / 1000).toFixed(0)}k`;
    }
    return value.toFixed(0);
  };

  return (
    <div className="calendar-grid-container">
      {/* Weekday headers */}
      <div className="calendar-weekdays">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
          <div key={day} className="weekday-label">{day}</div>
        ))}
      </div>

      {/* Calendar cells */}
      <div className="calendar-cells">
        {/* Empty cells for offset */}
        {Array.from({ length: startDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="cal-cell cal-cell--empty" />
        ))}

        {days.map((day) => {
          const txCount = getTransactionCount(day);
          const balance = runningBalances.get(day.toISOString()) || 0;
          const spending = getDaySpending(day);

          return (
            <button
              key={day.toISOString()}
              className={getCellClass(day)}
              onClick={() => onSelectDate(day)}
            >
              <span className="cal-day-number">
                {day.getDate()}
              </span>
              {txCount > 0 && (
                <span className="cal-tx-count">{txCount}</span>
              )}
              <span className={`cal-balance ${balance < 0 ? 'cal-balance--negative' : ''}`}>
                {spending > 0
                  ? `${formatBalance(balance)}`
                  : balance !== disposable ? formatBalance(balance) : '0.0'
                }
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
