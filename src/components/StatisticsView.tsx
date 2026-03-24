'use client';

import { Expense, Category } from '@/types/database';
import { format, isSameMonth, parseISO } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { es } from 'date-fns/locale';

interface StatisticsViewProps {
  expenses: Expense[];
  categories: Category[];
  currentMonth: Date;
  selectedAccountId: string | null;
}

export default function StatisticsView({ expenses, categories, currentMonth, selectedAccountId }: StatisticsViewProps) {
  const monthExpenses = expenses
    .filter(e => isSameMonth(parseISO(e.date), currentMonth))
    .filter(e => !selectedAccountId || e.account_id === selectedAccountId);

  const gastos = monthExpenses.filter(e => e.type === 'gasto');
  const totalGasto = gastos.reduce((acc, e) => acc + Number(e.amount), 0);

  // Group by category manually
  const grouped = gastos.reduce((acc, e) => {
    const catId = e.category_id || 'unassigned';
    if (!acc[catId]) acc[catId] = 0;
    acc[catId] += Number(e.amount);
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(grouped)
    .map(([catId, amount]) => {
      const category = categories.find(c => c.id === catId);
      return {
        name: category?.name || 'Sin Categoría',
        value: amount,
        color: category?.color || '#9ca3af',
        id: catId,
      };
    })
    .sort((a, b) => b.value - a.value);

  const formatMoney = (n: number) => `$${n.toLocaleString('es-CL', { minimumFractionDigits: 0 })}`;

  return (
    <div className="statistics-view">
      <div className="stats-header">
        <h2 className="stats-title">Gastos de {format(currentMonth, 'MMMM', { locale: es })}</h2>
        <div className="stats-total">{formatMoney(totalGasto)}</div>
      </div>

      {totalGasto === 0 ? (
        <div className="no-transactions" style={{ margin: '32px' }}>
          No hay gastos registrados en este mes.
        </div>
      ) : (
        <>
          <div className="chart-container" style={{ height: 260, width: '100%', marginTop: '16px' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={chartData}
                  innerRadius={75}
                  outerRadius={105}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.id} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: number) => formatMoney(val)}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="category-breakdown">
            {chartData.map(item => {
              const perc = ((item.value / totalGasto) * 100).toFixed(0);
              return (
                <div key={item.id} className="category-bar-row">
                  <div className="cat-bar-info">
                    <div className="cat-bar-left">
                      <div className="cat-bar-dot" style={{ backgroundColor: item.color }} />
                      <span className="cat-bar-name">{item.name}</span>
                    </div>
                    <div className="cat-bar-right">
                      <span className="cat-bar-perc">{perc}%</span>
                      <span className="cat-bar-val">{formatMoney(item.value)}</span>
                    </div>
                  </div>
                  <div className="cat-bar-track">
                    <div className="cat-bar-fill" style={{ width: `${perc}%`, backgroundColor: item.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
