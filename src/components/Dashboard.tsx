'use client';

import { useBudget } from '@/hooks/useBudget';
import { getMonthsActive } from '@/lib/calculations';
import { useState } from 'react';
import CalendarHeader from './CalendarHeader';
import AccountBar from './AccountBar';
import MarginIndicator from './MarginIndicator';
import CalendarGrid from './CalendarGrid';
import DailyTransactions from './DailyTransactions';
import AddExpenseModal from './AddExpenseModal';
import SettingsModal from './SettingsModal';
import MonthlySummary from './MonthlySummary';
import StatisticsView from './StatisticsView';
import BottomNav from './BottomNav';

export default function Dashboard() {
  const {
    profile, expenses, categories, accounts, budget, loading,
    currentMonth, selectedDate, selectedAccountId,
    setSelectedDate, setSelectedAccountId, navigateMonth,
    addExpense, deleteExpense, updateExpense, updateProfile, addCategory
  } = useBudget();

  const [showSettings, setShowSettings] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<any>(null); // Type Expense
  const [activeTab, setActiveTab] = useState<'calendar' | 'stats'>('calendar');

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
      </div>
    );
  }

  // Calculate balance for AccountBar
  const filteredExpenses = selectedAccountId
    ? expenses.filter(e => e.account_id === selectedAccountId)
    : expenses;
    
  const monthsActive = profile ? getMonthsActive(profile, filteredExpenses, selectedDate || new Date()) : 1;
  const lifetimeIncome = (profile?.monthly_income || 0) * Math.max(1, monthsActive);
  const lifetimeSavings = (profile?.savings_goal || 0) * Math.max(1, monthsActive);
  
  const totalSpent = filteredExpenses.reduce((acc, e) => acc + (e.type === 'ingreso' ? -Number(e.amount) : Number(e.amount)), 0);
  const balance = lifetimeIncome - lifetimeSavings - totalSpent;

  return (
    <div className="app-container" style={{ paddingBottom: '90px' }}>
      <CalendarHeader
        currentMonth={currentMonth}
        onNavigate={navigateMonth}
        onOpenSettings={() => setShowSettings(true)}
      />

      <AccountBar
        accounts={accounts}
        selectedAccountId={selectedAccountId}
        onSelectAccount={setSelectedAccountId}
        balance={balance}
      />

      {activeTab === 'calendar' ? (
        <>
          <div className="monthly-summary-wrapper">
            <MonthlySummary 
              expenses={expenses} 
              currentMonth={currentMonth} 
              selectedAccountId={selectedAccountId} 
            />
          </div>
          
          {budget && <MarginIndicator budget={budget} />}

          <CalendarGrid
            profile={profile}
            expenses={expenses}
            currentMonth={currentMonth}
            selectedDate={selectedDate}
            selectedAccountId={selectedAccountId}
            onSelectDate={setSelectedDate}
          />

          <DailyTransactions
            selectedDate={selectedDate}
            expenses={expenses}
            categories={categories}
            selectedAccountId={selectedAccountId}
            onAddExpense={() => {
              setExpenseToEdit(null);
              setShowAddExpense(true);
            }}
            onEditExpense={(expense) => {
              setExpenseToEdit(expense);
              setShowAddExpense(true);
            }}
            onDeleteExpense={deleteExpense}
          />
        </>
      ) : (
        <StatisticsView 
          expenses={expenses} 
          categories={categories} 
          currentMonth={currentMonth} 
          selectedAccountId={selectedAccountId} 
        />
      )}

      <BottomNav 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onOpenSettings={() => setShowSettings(true)} 
      />

      {/* Modals */}
      {showAddExpense && (
        <AddExpenseModal
          isOpen={showAddExpense}
          onClose={() => {
            setShowAddExpense(false);
            setExpenseToEdit(null);
          }}
          onAdd={addExpense}
          onEdit={updateExpense as any}
          onAddCategory={addCategory}
          expenseToEdit={expenseToEdit}
          categories={categories}
          accounts={accounts}
          defaultDate={selectedDate}
          defaultAccountId={selectedAccountId}
        />
      )}
      {showSettings && (
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          profile={profile}
          onSave={updateProfile}
        />
      )}
    </div>
  );
}
