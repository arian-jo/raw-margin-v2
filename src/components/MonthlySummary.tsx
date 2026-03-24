'use client';

import { Expense } from '@/types/database';
import { isSameMonth, parseISO } from 'date-fns';

interface MonthlySummaryProps {
  expenses: Expense[];
  currentMonth: Date;
  selectedAccountId: string | null;
}

export default function MonthlySummary({ expenses, currentMonth, selectedAccountId }: MonthlySummaryProps) {
  const monthExpenses = expenses
    .filter(e => isSameMonth(parseISO(e.date), currentMonth))
    .filter(e => !selectedAccountId || e.account_id === selectedAccountId);

  const totalIncome = monthExpenses
    .filter(e => e.type === 'ingreso')
    .reduce((acc, e) => acc + Number(e.amount), 0);

  const totalExpense = monthExpenses
    .filter(e => e.type === 'gasto')
    .reduce((acc, e) => acc + Number(e.amount), 0);

  const formatMoney = (n: number) => `$${n.toLocaleString('es-CL', { minimumFractionDigits: 0 })}`;

  return (
    <div className="monthly-summary-bar">
      <div className="summary-col">
        <span className="summary-label">Ingresos</span>
        <span className="summary-value text-positive">{formatMoney(totalIncome)}</span>
      </div>
      <div className="summary-divider" />
      <div className="summary-col">
        <span className="summary-label">Gastos</span>
        <span className="summary-value text-negative">{formatMoney(totalExpense)}</span>
      </div>
    </div>
  );
}
