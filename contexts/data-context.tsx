"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { Trip, Expense, Engineer } from '@/types';
import { 
  engineers as initialEngineers, 
  trips as initialTrips, 
  expenses as initialExpenses 
} from '@/lib/data';

interface DataContextType {
  engineers: Engineer[];
  trips: Trip[];
  expenses: Expense[];
  currentUser: {
    email: string;
    name: string;
    domain: string;
  } | null;
  addTrip: (trip: Omit<Trip, 'id'>) => void;
  updateTrip: (id: string, trip: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  addEngineer: (engineer: Omit<Engineer, 'id'>) => void;
  updateEngineer: (id: string, engineer: Partial<Engineer>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ 
  children, 
  session 
}: { 
  children: ReactNode;
  session: any;
}) {
  const currentUser = useMemo(() => {
    if (!session?.user?.email) return null;
    return {
      email: session.user.email,
      name: session.user.name || '',
      domain: session.user.domain || session.user.email.split('@')[1] || '',
    };
  }, [session]);

  // Generate a consistent color for user based on their email
  const getUserColor = (email: string): string => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];
    const hash = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // Initialize engineers with current user if not exists
  const initializeEngineers = useMemo(() => {
    if (!currentUser) return initialEngineers;
    
    // Filter engineers by matching email domain
    const teamEngineers = initialEngineers.filter(eng => 
      eng.email.endsWith(`@${currentUser.domain}`)
    );
    
    // Check if current user exists in team engineers
    const userExists = teamEngineers.some(eng => eng.email === currentUser.email);
    
    if (!userExists) {
      // Add current user as an engineer
      const newEngineer: Engineer = {
        id: `eng-${Date.now()}`,
        name: currentUser.name,
        email: currentUser.email,
        role: 'Team Member',
        dailyRate: 0, // Default, can be updated later
        color: getUserColor(currentUser.email),
      };
      return [newEngineer, ...teamEngineers];
    }
    
    return teamEngineers;
  }, [currentUser]);

  const [engineers, setEngineers] = useState<Engineer[]>(initializeEngineers);
  const [trips, setTrips] = useState<Trip[]>(initialTrips);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);

  const addTrip = (trip: Omit<Trip, 'id'>) => {
    const newTrip: Trip = {
      ...trip,
      id: `trip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setTrips(prev => [...prev, newTrip]);
  };

  const updateTrip = (id: string, updatedTrip: Partial<Trip>) => {
    setTrips(prev => prev.map(trip => 
      trip.id === id ? { ...trip, ...updatedTrip } : trip
    ));
  };

  const deleteTrip = (id: string) => {
    setTrips(prev => prev.filter(trip => trip.id !== id));
  };

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expense,
      id: `expense-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setExpenses(prev => [...prev, newExpense]);
  };

  const updateExpense = (id: string, updatedExpense: Partial<Expense>) => {
    setExpenses(prev => prev.map(expense => 
      expense.id === id ? { ...expense, ...updatedExpense } : expense
    ));
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
  };

  const addEngineer = (engineer: Omit<Engineer, 'id'>) => {
    const newEngineer: Engineer = {
      ...engineer,
      id: `eng-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setEngineers(prev => [...prev, newEngineer]);
  };

  const updateEngineer = (id: string, updatedEngineer: Partial<Engineer>) => {
    setEngineers(prev => prev.map(eng => 
      eng.id === id ? { ...eng, ...updatedEngineer } : eng
    ));
  };

  return (
    <DataContext.Provider
      value={{
        engineers,
        trips,
        expenses,
        currentUser,
        addTrip,
        updateTrip,
        deleteTrip,
        addExpense,
        updateExpense,
        deleteExpense,
        addEngineer,
        updateEngineer,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

