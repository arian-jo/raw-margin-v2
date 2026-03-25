'use client';

import { useState } from 'react';
import { BudgetResult } from '@/types/database';
import { Flame, TrendingUp, Shield, Target, X } from 'lucide-react';

interface MarginIndicatorProps {
  budget: BudgetResult;
}

const METRIC_INFO = {
  rawMargin: {
    title: 'Margen Neto',
    desc: 'Diferencia acumulada entre tu presupuesto diario y lo que realmente gastaste este mes. Positivo = vas ahorrando más de lo planeado. Negativo = gastaste más de lo que tenías asignado.',
    emoji: '📊',
  },
  racha: {
    title: 'Racha 🔥',
    desc: 'Cantidad de días consecutivos en los que gastaste menos que tu presupuesto diario. Mantener una racha alta indica hábitos financieros consistentes.',
    emoji: '🔥',
  },
  salud: {
    title: 'Salud Financiera',
    desc: '🟢 Saludable: tu margen acumulado es positivo.\n🟡 Ajustado: estás cerca del límite, cuidado.\n🔴 Peligro: has superado tu presupuesto acumulado significativamente.',
    emoji: '🛡️',
  },
  proyeccion: {
    title: 'Proyección Fin de Mes',
    desc: 'Estimación de cuánto habrás ahorrado al final del mes si mantenés el ritmo de gasto de los últimos 7 días. Calcula: meta de ahorro ± tendencia actual.',
    emoji: '🔮',
  },
};

type MetricKey = keyof typeof METRIC_INFO;

export default function MarginIndicator({ budget }: MarginIndicatorProps) {
  const [activeInfo, setActiveInfo] = useState<MetricKey | null>(null);

  const healthColors = {
    healthy: { bg: 'var(--health-green-bg)', text: 'var(--health-green)', icon: '🟢', label: 'Saludable' },
    tight:   { bg: 'var(--health-yellow-bg)', text: 'var(--health-yellow)', icon: '🟡', label: 'Ajustado' },
    danger:  { bg: 'var(--health-red-bg)', text: 'var(--health-red)', icon: '🔴', label: 'Peligro' },
  };
  const health = healthColors[budget.healthStatus];

  const fmt = (n: number) =>
    `${n >= 0 ? '' : '-'}$${Math.abs(n).toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const openInfo = (key: MetricKey) => setActiveInfo(key);
  const closeInfo = () => setActiveInfo(null);

  return (
    <div className="margin-indicator">
      {/* Compact header row: icon + Gd + disponible */}
      <div className="margin-compact-card">
        <div className="margin-compact-left">
          <div className="margin-compact-icon">
            <Target size={16} />
          </div>
          <div>
            <div className="margin-compact-label">Presupuesto Hoy</div>
            <div className="margin-compact-value">
              {fmt(budget.dailyBudget)}
            </div>
          </div>
        </div>
        <div className="margin-compact-right">
          <div className="margin-compact-label" style={{ textAlign: 'right' }}>Disponible</div>
          <div
            className="margin-compact-value"
            style={{ color: budget.remainingForToday >= 0 ? 'var(--positive)' : 'var(--negative)' }}
          >
            {fmt(budget.remainingForToday)}
          </div>
        </div>
      </div>

      {/* Stats row — 4 clickable cards */}
      <div className="margin-stats">
        {/* Margen Neto */}
        <button className="margin-stat" onClick={() => openInfo('rawMargin')}>
          <div className="margin-stat-icon"
            style={{ background: budget.rawMarginAccumulated >= 0 ? 'var(--health-green-bg)' : 'var(--health-red-bg)' }}>
            <TrendingUp size={13} style={{ color: budget.rawMarginAccumulated >= 0 ? 'var(--health-green)' : 'var(--health-red)' }} />
          </div>
          <div className="margin-stat-content">
            <span className="margin-stat-label">Margen Neto</span>
            <span className={`margin-stat-value ${budget.rawMarginAccumulated >= 0 ? 'text-positive' : 'text-negative'}`}>
              {fmt(budget.rawMarginAccumulated)}
            </span>
          </div>
        </button>

        {/* Racha */}
        <button className="margin-stat" onClick={() => openInfo('racha')}>
          <div className="margin-stat-icon" style={{ background: 'var(--streak-bg)' }}>
            <Flame size={13} style={{ color: 'var(--streak-color)' }} />
          </div>
          <div className="margin-stat-content">
            <span className="margin-stat-label">Racha</span>
            <span className="margin-stat-value" style={{ color: 'var(--streak-color)' }}>
              {budget.streak} 🔥
            </span>
          </div>
        </button>

        {/* Salud */}
        <button className="margin-stat" onClick={() => openInfo('salud')}>
          <div className="margin-stat-icon" style={{ background: health.bg }}>
            <Shield size={13} style={{ color: health.text }} />
          </div>
          <div className="margin-stat-content">
            <span className="margin-stat-label">Salud</span>
            <span className="margin-stat-value">{health.icon}</span>
          </div>
        </button>

        {/* Proyección */}
        <button className="margin-stat" onClick={() => openInfo('proyeccion')}>
          <div className="margin-stat-icon"
            style={{ background: budget.projectedSavings >= 0 ? 'var(--health-green-bg)' : 'var(--health-red-bg)' }}>
            <TrendingUp size={13} style={{ color: budget.projectedSavings >= 0 ? 'var(--health-green)' : 'var(--health-red)' }} />
          </div>
          <div className="margin-stat-content">
            <span className="margin-stat-label">Proyección</span>
            <span className={`margin-stat-value ${budget.projectedSavings >= 0 ? 'text-positive' : 'text-negative'}`}>
              {fmt(budget.projectedSavings)}
            </span>
          </div>
        </button>
      </div>

      {/* Info popup */}
      {activeInfo && (
        <div className="metric-popup-overlay" onClick={closeInfo}>
          <div className="metric-popup" onClick={e => e.stopPropagation()}>
            <div className="metric-popup-header">
              <span className="metric-popup-emoji">{METRIC_INFO[activeInfo].emoji}</span>
              <h3 className="metric-popup-title">{METRIC_INFO[activeInfo].title}</h3>
              <button className="metric-popup-close" onClick={closeInfo}>
                <X size={18} />
              </button>
            </div>
            <p className="metric-popup-desc">{METRIC_INFO[activeInfo].desc}</p>
          </div>
        </div>
      )}
    </div>
  );
}
