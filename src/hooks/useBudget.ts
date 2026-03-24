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

  const fetchUserData = useCallback(async (userId: string) => {
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

      // Expenses: Fetch ALL history for instant navigation and rollover
      const { data: expensesData } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
      setExpenses(expensesData || []);
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedAccountId]);

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
        fetchUserData(user.id);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchUserData(user.id);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
        fetchUserData(user.id);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'accounts' }, () => {
        fetchUserData(user.id);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchUserData]);

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
    const { data, error } = await supabase
      .from('expenses')
      .insert([{ ...expense, user_id: user.id }])
      .select()
      .single();
    if (error) throw error;
    if (data) {
      setExpenses(prev => {
        const newExpenses = [data, ...prev];
        return newExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      });
    }
  };

  const deleteExpense = async (id: string) => {
    // Optimistic update
    setExpenses(prev => prev.filter(e => e.id !== id));
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) {
      if (user) fetchUserData(user.id); // Revert on failure
      throw error;
    }
  };

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    if (!user) return;
    // Optimistic update
    setExpenses(prev => {
      const newExpenses = prev.map(e => e.id === id ? { ...e, ...updates } as Expense : e);
      return newExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });
    
    const { error } = await supabase
      .from('expenses')
      .update(updates)
      .eq('id', id);
      
    if (error) {
      if (user) fetchUserData(user.id);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;
    // Optimistic update
    setProfile(prev => prev ? { ...prev, ...updates } : null);
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);
    if (error) {
      fetchUserData(user.id);
      throw error;
    }
  };

  const addCategory = async (name: string, color: string) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('categories')
      .insert([{ user_id: user.id, name, color }])
      .select()
      .single();
    if (error) throw error;
    if (data) {
      setCategories(prev => [...prev, data]);
    }
  };

  const deleteCategory = async (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      if (user) fetchUserData(user.id);
      throw error;
    }
  };

  const addAccount = async (name: string) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('accounts')
      .insert([{ user_id: user.id, name }])
      .select()
      .single();
    if (error) throw error;
    if (data) {
      setAccounts(prev => [...prev, data]);
    }
  };

  const deleteAccount = async (id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
    const { error } = await supabase.from('accounts').delete().eq('id', id);
    if (error) {
      if (user) fetchUserData(user.id);
      throw error;
    }
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
    updateExpense,
    updateProfile,
    addCategory,
    deleteCategory,
    addAccount,
    deleteAccount,
    refresh: () => user && fetchUserData(user.id),
  };
}
