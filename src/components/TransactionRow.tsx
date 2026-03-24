'use client';

import { Expense, Category } from '@/types/database';
import { Trash2 } from 'lucide-react';

interface TransactionRowProps {
  expense: Expense;
  category?: Category;
  onDelete: (id: string) => void;
}

export default function TransactionRow({ expense, category, onDelete }: TransactionRowProps) {
  const isIncome = expense.type === 'ingreso';
  const formattedAmount = `$${Number(expense.amount).toLocaleString('es-CL', { minimumFractionDigits: 2 })}`;

  return (
    <div className="transaction-row">
      <div
        className="transaction-avatar"
        style={{ backgroundColor: category?.color || (isIncome ? 'var(--positive)' : '#6b7280') }}
      >
        {category ? category.name.charAt(0).toUpperCase() : (isIncome ? 'I' : 'G')}
      </div>
      <div className="transaction-info">
        <span className="transaction-name">{expense.description}</span>
        <span className="transaction-category">
          {category?.name || 'Sin categoría'}
          {isIncome && ' • Ingreso'}
        </span>
      </div>
      <div className="transaction-actions">
        <button
          className="transaction-delete"
          onClick={() => onDelete(expense.id)}
          aria-label="Eliminar"
        >
          <Trash2 size={14} />
        </button>
        <span className={`transaction-amount ${isIncome ? 'transaction-amount--income' : ''}`}>
          {isIncome ? `+${formattedAmount}` : `(${formattedAmount})`}
        </span>
      </div>
    </div>
  );
}
