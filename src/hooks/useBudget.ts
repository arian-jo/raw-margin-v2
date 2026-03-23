'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Expense, Profile, Category, Account, BudgetResult } from '@/types/database';
import { calculateBudget } from '@/lib/calculations';
import { startOfMonth, endOfMonth, format, addMonths, subMonths } from 'date-fns';

export function useBudget() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // V2: Navigation state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  const fetchUserData = useCallback(async (userId: string, month: Date = currentMonth) => {
    try {
      // Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      setProfile(profileData || null);

      // Categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .order('name');
      setCategories(categoriesData || []);

      // Accounts
      const { data: accountsData } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at');
      setAccounts(accountsData || []);

      // Set default account if none selected
      if (!selectedAccountId && accountsData && accountsData.length > 0) {
        setSelectedAccountId(accountsData[0].id);
      }

      // Expenses for the displayed month
      const start = format(startOfMonth(month), 'yyyy-MM-dd');
      const end = format(endOfMonth(month), 'yyyy-MM-dd');

      const { data: expensesData } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId)
        .gte('date', start)
        .lte('date', end)
        .order('created_at', { ascending: false });
      setExpenses(expensesData || []);
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  }, [currentMonth, selectedAccountId]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchUserData(session.user.id);
        } else {
          setLoading(false);
          setProfile(null);
          setExpenses([]);
          setCategories([]);
          setAccounts([]);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchUserData]);

  // Realtime subscriptions
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => {
        fetchUserData(user.id, currentMonth);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchUserData(user.id, currentMonth);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
        fetchUserData(user.id, currentMonth);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'accounts' }, () => {
        fetchUserData(user.id, currentMonth);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, currentMonth, fetchUserData]);

  // Re-fetch when month changes
  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchUserData(user.id, currentMonth);
    }
  }, [currentMonth, user?.id]);

  // Navigation
  const navigateMonth = (direction: 'prev' | 'next' | 'prevYear' | 'nextYear' | 'today') => {
    switch (direction) {
      case 'prev':
        setCurrentMonth(prev => subMonths(prev, 1));
        break;
      case 'next':
        setCurrentMonth(prev => addMonths(prev, 1));
        break;
      case 'prevYear':
        setCurrentMonth(prev => subMonths(prev, 12));
        break;
      case 'nextYear':
        setCurrentMonth(prev => addMonths(prev, 12));
        break;
      case 'today':
        setCurrentMonth(new Date());
        setSelectedDate(new Date());
        break;
    }
  };

  // CRUD Operations
  const addExpense = async (expense: Omit<Expense, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;
    const { error } = await supabase
      .from('expenses')
      .insert([{ ...expense, user_id: user.id }])
      .select()
      .single();
    if (error) throw error;
  };

  const deleteExpense = async (id: string) => {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) throw error;
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);
    if (error) throw error;
  };

  const addCategory = async (name: string, color: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('categories')
      .insert([{ user_id: user.id, name, color }]);
    if (error) throw error;
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
  };

  const addAccount = async (name: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('accounts')
      .insert([{ user_id: user.id, name }]);
    if (error) throw error;
  };

  const deleteAccount = async (id: string) => {
    const { error } = await supabase.from('accounts').delete().eq('id', id);
    if (error) throw error;
  };

  // Calculate budget for today
  const budget: BudgetResult | null = profile
    ? calculateBudget(profile, expenses, new Date(), selectedAccountId)
    : null;

  return {
    user,
    profile,
    expenses,
    categories,
    accounts,
    loading,
    budget,
    // Navigation
    currentMonth,
    selectedDate,
    selectedAccountId,
    setSelectedDate,
    setSelectedAccountId,
    navigateMonth,
    // CRUD
    addExpense,
    deleteExpense,
    updateProfile,
    addCategory,
    deleteCategory,
    addAccount,
    deleteAccount,
    refresh: () => user && fetchUserData(user.id, currentMonth),
  };
}
