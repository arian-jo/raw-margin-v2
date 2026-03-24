export type Profile = {
  id: string;
  monthly_income: number;
  savings_goal: number;
  updated_at: string;
};

export type Category = {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon?: string | null;
  created_at: string;
};

export type Account = {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
};

export type Expense = {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  date: string;
  type: 'gasto' | 'ingreso';
  status: 'realizado' | 'programado';
  category_id: string | null;
  account_id: string | null;
  created_at: string;
};

export type HealthStatus = 'healthy' | 'tight' | 'danger';

export type BudgetResult = {
  dailyBudget: number;
  totalSpentToday: number;
  remainingForToday: number;
  daysRemaining: number;
  rawMarginToday: number;
  rawMarginAccumulated: number;
  projectedSavings: number;
  streak: number;
  healthStatus: HealthStatus;
};
