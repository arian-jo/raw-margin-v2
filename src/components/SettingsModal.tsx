'use client';

import { useState, useEffect } from 'react';
import { X, Save, Target, PiggyBank } from 'lucide-react';
import { Profile } from '@/types/database';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile | null;
  onSave: (updates: Partial<Profile>) => Promise<void>;
}

export default function SettingsModal({ isOpen, onClose, profile, onSave }: SettingsModalProps) {
  const [monthlyIncome, setMonthlyIncome] = useState(profile?.monthly_income?.toString() || '0');
  const [savingsGoal, setSavingsGoal] = useState(profile?.savings_goal?.toString() || '0');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setMonthlyIncome(profile.monthly_income.toString());
      setSavingsGoal(profile.savings_goal.toString());
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        monthly_income: Number(monthlyIncome),
        savings_goal: Number(savingsGoal),
      });
      onClose();
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Configuración</h2>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        <p className="settings-hint">
          Estos valores fijos definen tu presupuesto base mensual. Los ingresos variables los registrás desde el formulario de transacciones.
        </p>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Ingreso base mensual */}
          <div className="settings-field">
            <div className="settings-field-icon" style={{ background: 'var(--cell-today-bg)', color: 'var(--cell-today-border)' }}>
              <Target size={18} />
            </div>
            <div className="settings-field-body">
              <label className="form-label">Ingreso base mensual</label>
              <p className="settings-field-hint">Tu sueldo fijo u otros ingresos recurrentes</p>
              <div className="form-field" style={{ marginTop: 8 }}>
                <div className="form-field-icon">$</div>
                <input
                  type="number"
                  required
                  step="any"
                  min="0"
                  className="form-input"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Meta de ahorro */}
          <div className="settings-field">
            <div className="settings-field-icon" style={{ background: 'var(--health-green-bg)', color: 'var(--health-green)' }}>
              <PiggyBank size={18} />
            </div>
            <div className="settings-field-body">
              <label className="form-label">Meta de ahorro mensual</label>
              <p className="settings-field-hint">Cuánto querés reservar cada mes sin gastar</p>
              <div className="form-field" style={{ marginTop: 8 }}>
                <div className="form-field-icon">$</div>
                <input
                  type="number"
                  required
                  step="any"
                  min="0"
                  className="form-input"
                  value={savingsGoal}
                  onChange={(e) => setSavingsGoal(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Calculated disposable */}
          <div className="settings-summary">
            <span className="settings-summary-label">Disponible para gastar</span>
            <span className="settings-summary-value">
              ${Math.max(0, Number(monthlyIncome) - Number(savingsGoal)).toLocaleString('es-CL', { minimumFractionDigits: 0 })}
              <span className="settings-summary-sub"> / mes</span>
            </span>
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            <Save size={18} />
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </form>
      </div>
    </div>
  );
}
