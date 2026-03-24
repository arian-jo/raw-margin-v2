'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { X, DollarSign, Edit3, Calendar as CalendarIcon, Save, TrendingDown, TrendingUp, Plus } from 'lucide-react';
import { Expense, Category, Account } from '@/types/database';
import { getIconComponent } from '@/lib/icons';
import CategoryManagerModal from './CategoryManagerModal';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (expense: Omit<Expense, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  onAddCategory: (name: string, color: string, icon: string) => Promise<void>;
  categories: Category[];
  accounts: Account[];
  defaultDate?: Date;
  defaultAccountId?: string | null;
  expenseToEdit?: Expense | null;
  onEdit?: (id: string, updates: Partial<Expense>) => Promise<void>;
}

export default function AddExpenseModal({
  isOpen, onClose, onAdd, onAddCategory, categories, accounts, defaultDate, defaultAccountId, expenseToEdit, onEdit
}: AddTransactionModalProps) {
  const [description, setDescription] = useState(expenseToEdit?.description || '');
  const [amount, setAmount] = useState(expenseToEdit ? String(Math.abs(Number(expenseToEdit.amount))) : '');
  const [date, setDate] = useState(expenseToEdit ? expenseToEdit.date : format(defaultDate || new Date(), 'yyyy-MM-dd'));
  const [type, setType] = useState<'gasto' | 'ingreso'>(expenseToEdit?.type || 'gasto');
  const [status, setStatus] = useState<'realizado' | 'programado'>(expenseToEdit?.status || 'realizado');
  const [categoryId, setCategoryId] = useState<string | null>(expenseToEdit?.category_id || null);
  const [accountId, setAccountId] = useState<string | null>(expenseToEdit?.account_id ?? defaultAccountId ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCategoryManager, setShowCategoryManager] = useState(false);

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
    if (Number(amount) <= 0) {
      setError('El monto debe ser mayor a 0');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (expenseToEdit && onEdit) {
        await onEdit(expenseToEdit.id, {
          description,
          amount: Number(amount),
          date,
          type,
          status,
          category_id: categoryId,
          account_id: accountId,
        });
      } else {
        await onAdd({
          description,
          amount: Number(amount),
          date,
          type,
          status,
          category_id: categoryId,
          account_id: accountId,
        });
      }
      // Reset
      setDescription('');
      setAmount('');
      setDate(format(defaultDate || new Date(), 'yyyy-MM-dd'));
      setType('gasto');
      setStatus('realizado');
      setCategoryId(null);
      setCategoryId(null);
      onClose();
    } catch (err: any) {
      console.error('Error adding transaction:', err);
      setError(err?.message || 'Hubo un error de red guardando la transacción.');
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
          <h2>{expenseToEdit ? (isExpense ? 'Editar Gasto' : 'Editar Ingreso') : (isExpense ? 'Nuevo Gasto' : 'Nuevo Ingreso')}</h2>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && (
            <div style={{ color: 'var(--negative)', fontSize: '13px', textAlign: 'center', backgroundColor: 'var(--health-red-bg)', padding: '10px', borderRadius: '8px', marginBottom: '8px', fontWeight: '500' }}>
              {error}
            </div>
          )}

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
              min="0.01"
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

          {/* Modal Triggers Component Map -- Large Grid Selector */}
          <div className="form-group" style={{ marginTop: '16px' }}>
            <label className="form-label" style={{ marginBottom: '4px' }}>Categoría</label>
            <div className="category-grid-large">
              {categories.map(cat => {
                const IconComp = getIconComponent(cat.icon);
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={`expense-cat-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => setCategoryId(isSelected ? null : cat.id)}
                  >
                    <div 
                      className="expense-cat-circle" 
                      style={{ 
                        backgroundColor: isSelected ? cat.color : `${cat.color}25`,
                        borderColor: isSelected ? 'transparent' : cat.color,
                        border: isSelected ? 'none' : `1px solid ${cat.color}40`
                      }}
                    >
                      <IconComp size={24} color={isSelected ? '#fff' : cat.color} strokeWidth={isSelected ? 2 : 1.5} />
                    </div>
                    <span className="expense-cat-name" style={{ color: isSelected ? 'var(--text-primary)' : '' }}>
                      {cat.name}
                    </span>
                  </button>
                );
              })}
              <button
                type="button"
                className="expense-cat-btn"
                onClick={() => setShowCategoryManager(true)}
              >
                <div className="expense-cat-circle" style={{ backgroundColor: 'var(--bg-main)', border: '1px dashed var(--border-light)' }}>
                  <Plus size={24} color="var(--text-secondary)" strokeWidth={1.5} />
                </div>
                <span className="expense-cat-name text-muted">Añadir</span>
              </button>
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

      <CategoryManagerModal
        isOpen={showCategoryManager}
        onClose={() => setShowCategoryManager(false)}
        onAddCategory={onAddCategory}
      />
    </div>
  );
}
