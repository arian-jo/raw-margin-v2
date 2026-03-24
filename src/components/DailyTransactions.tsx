'use client';

import { Expense, Category } from '@/types/database';
import { format, isSameDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus } from 'lucide-react';
import TransactionRow from './TransactionRow';

interface DailyTransactionsProps {
  selectedDate: Date;
  expenses: Expense[];
  categories: Category[];
  selectedAccountId: string | null;
  onAddExpense: () => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
}

export default function DailyTransactions({
  selectedDate, expenses, categories, selectedAccountId, onAddExpense, onEditExpense, onDeleteExpense
}: DailyTransactionsProps) {
  const dayExpenses = expenses
    .filter(e => isSameDay(parseISO(e.date), selectedDate))
    .filter(e => !selectedAccountId || e.account_id === selectedAccountId);

  // Net total: income positive, expenses negative
  const dailyNet = dayExpenses.reduce((acc, e) => {
    const amount = Number(e.amount);
    return acc + (e.type === 'ingreso' ? amount : -amount);
  }, 0);

  const getCategoryForExpense = (expense: Expense) =>
    categories.find(c => c.id === expense.category_id);

  return (
    <div className="daily-transactions">
      <div className="daily-header">
        <span className="daily-date">
          {format(selectedDate, "MMM d, yyyy", { locale: es })}
        </span>

        <button className="fab-button" onClick={onAddExpense} aria-label="Agregar transacción">
          <Plus size={24} />
        </button>

        <div className="daily-total">
          <span className="daily-total-label">Total del día:</span>
          <span className={`daily-total-value ${dailyNet >= 0 ? 'text-positive' : 'text-negative'}`}>
            {dailyNet >= 0 ? '+' : ''}${Math.abs(dailyNet).toLocaleString('es-CL', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <div className="transactions-list">
        {dayExpenses.length === 0 ? (
          <div className="no-transactions">
            <p>No hay transacciones este día</p>
          </div>
        ) : (
          dayExpenses.map(expense => (
            <TransactionRow
              key={expense.id}
              expense={expense}
              category={getCategoryForExpense(expense)}
              onDelete={async (id) => {
                try {
                  await onDeleteExpense(id);
                } catch (err) {
                  window.alert('Hubo un error de conexión al intentar eliminar la transacción.');
                }
              }}
              onEdit={() => onEditExpense(expense)}
            />
          ))
        )}
      </div>
    </div>
  );
}
