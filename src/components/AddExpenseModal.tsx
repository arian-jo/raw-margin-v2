'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { X, DollarSign, Edit3, Calendar as CalendarIcon, Save, TrendingDown, TrendingUp } from 'lucide-react';
import { Expense, Category, Account } from '@/types/database';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (expense: Omit<Expense, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  categories: Category[];
  accounts: Account[];
  defaultDate?: Date;
  defaultAccountId?: string | null;
}

export default function AddExpenseModal({
  isOpen, onClose, onAdd, categories, accounts, defaultDate, defaultAccountId
}: AddTransactionModalProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(format(defaultDate || new Date(), 'yyyy-MM-dd'));
  const [type, setType] = useState<'gasto' | 'ingreso'>('gasto');
  const [status, setStatus] = useState<'realizado' | 'programado'>('realizado');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(defaultAccountId || null);
  const [loading, setLoading] = useState(false);

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    if (newDate > format(new Date(), 'yyyy-MM-dd')) {
      setStatus('programado');
    } else {
      setStatus('realizado');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onAdd({
        description,
        amount: Number(amount),
        date,
        type,
        status,
        category_id: categoryId,
        account_id: accountId,
      });
      // Reset
      setDescription('');
      setAmount('');
      setDate(format(defaultDate || new Date(), 'yyyy-MM-dd'));
      setType('gasto');
      setStatus('realizado');
      setCategoryId(null);
      onClose();
    } catch (error) {
      console.error('Error adding transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isExpense = type === 'gasto';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isExpense ? 'Nuevo Gasto' : 'Nuevo Ingreso'}</h2>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Type toggle — Gasto / Ingreso */}
          <div className="type-toggle">
            <button
              type="button"
              className={`type-btn ${isExpense ? 'type-btn--expense' : ''}`}
              onClick={() => setType('gasto')}
            >
              <TrendingDown size={16} />
              Gasto
            </button>
            <button
              type="button"
              className={`type-btn ${!isExpense ? 'type-btn--income' : ''}`}
              onClick={() => setType('ingreso')}
            >
              <TrendingUp size={16} />
              Ingreso
            </button>
          </div>

          {/* Amount */}
          <div className="form-field">
            <div className="form-field-icon" style={{ color: isExpense ? 'var(--negative)' : 'var(--positive)' }}>
              <DollarSign size={20} />
            </div>
            <input
              type="number"
              required
              step="any"
              className="form-input form-input--large"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{ color: isExpense ? 'var(--negative)' : 'var(--positive)' }}
            />
          </div>

          {/* Description */}
          <div className="form-field">
            <div className="form-field-icon"><Edit3 size={18} /></div>
            <input
              type="text"
              required
              className="form-input"
              placeholder={isExpense ? 'Descripción (ej. Supermercado)' : 'Descripción (ej. Sueldo)'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Date */}
          <div className="form-field">
            <div className="form-field-icon"><CalendarIcon size={18} /></div>
            <input
              type="date"
              required
              className="form-input"
              value={date}
              onChange={(e) => handleDateChange(e.target.value)}
            />
          </div>

          {/* Category selector */}
          <div className="form-group">
            <label className="form-label">Categoría</label>
            <div className="category-grid">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  className={`category-chip ${categoryId === cat.id ? 'category-chip--selected' : ''}`}
                  style={{
                    '--chip-color': cat.color,
                    borderColor: categoryId === cat.id ? cat.color : 'transparent',
                    backgroundColor: categoryId === cat.id ? `${cat.color}15` : undefined,
                  } as React.CSSProperties}
                  onClick={() => setCategoryId(categoryId === cat.id ? null : cat.id)}
                >
                  <span className="category-chip-dot" style={{ backgroundColor: cat.color }} />
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Account selector */}
          <div className="form-group">
            <label className="form-label">Cuenta</label>
            <select
              className="form-select"
              value={accountId || ''}
              onChange={(e) => setAccountId(e.target.value || null)}
            >
              <option value="">Sin cuenta</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>
          </div>

          {/* Status toggle */}
          <div className="status-toggle">
            <button
              type="button"
              className={`status-btn ${status === 'realizado' ? 'status-btn--active' : ''}`}
              onClick={() => setStatus('realizado')}
            >
              Realizado
            </button>
            <button
              type="button"
              className={`status-btn ${status === 'programado' ? 'status-btn--active' : ''}`}
              onClick={() => setStatus('programado')}
            >
              Programado
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="submit-btn"
            style={{ background: isExpense ? undefined : 'var(--positive)' }}
          >
            <Save size={20} />
            {loading ? 'Guardando...' : isExpense ? 'Guardar Gasto' : 'Guardar Ingreso'}
          </button>
        </form>
      </div>
    </div>
  );
}
