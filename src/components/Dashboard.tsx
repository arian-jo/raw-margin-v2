'use client';

import { useBudget } from '@/hooks/useBudget';
import { useState } from 'react';
import CalendarHeader from './CalendarHeader';
import AccountBar from './AccountBar';
import MarginIndicator from './MarginIndicator';
import CalendarGrid from './CalendarGrid';
import DailyTransactions from './DailyTransactions';
import AddExpenseModal from './AddExpenseModal';
import SettingsModal from './SettingsModal';

export default function Dashboard() {
  const {
    profile, expenses, categories, accounts, budget, loading,
    currentMonth, selectedDate, selectedAccountId,
    setSelectedDate, setSelectedAccountId, navigateMonth,
    addExpense, deleteExpense, updateProfile
  } = useBudget();

  const [showSettings, setShowSettings] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);

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
  const totalSpent = filteredExpenses.reduce((acc, e) => acc + Number(e.amount), 0);
  const balance = (profile?.monthly_income || 0) - (profile?.savings_goal || 0) - totalSpent;

  return (
    <div className="app-container">
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
        onAddExpense={() => setShowAddExpense(true)}
        onDeleteExpense={deleteExpense}
      />

      {/* Modals */}
      {showAddExpense && (
        <AddExpenseModal
          isOpen={showAddExpense}
          onClose={() => setShowAddExpense(false)}
          onAdd={addExpense}
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
