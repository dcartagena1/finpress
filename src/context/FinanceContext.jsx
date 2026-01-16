import { createContext, useContext, useState, useEffect } from 'react';
import { calculateConservativeBalance, detectRisks } from '../utils/finance';
import { startOfMonth, format } from 'date-fns';

const FinanceContext = createContext();

const STORAGE_KEY = 'finpress_data_v1';

const INITIAL_DATA = {
    transactions: [],
    categories: [
        { id: 'c1', name: 'Vivienda', type: 'EXPENSE' },
        { id: 'c2', name: 'Alimentación', type: 'EXPENSE' },
        { id: 'c3', name: 'Transporte', type: 'EXPENSE' },
        { id: 'c4', name: 'Servicios', type: 'EXPENSE' },
        { id: 'c5', name: 'Salud', type: 'EXPENSE' },
        { id: 'c6', name: 'Ocio', type: 'EXPENSE' },
        { id: 'i1', name: 'Sueldo', type: 'INCOME' },
        { id: 'i2', name: 'Extras', type: 'INCOME' }
    ],
    goals: []
};

export const FinanceProvider = ({ children }) => {
    const [data, setData] = useState(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : INITIAL_DATA;
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }, [data]);

    const addTransaction = (transaction) => {
        setData(prev => ({
            ...prev,
            transactions: [...prev.transactions, { ...transaction, id: crypto.randomUUID(), createdAt: new Date().toISOString() }]
        }));
    };

    const updateTransaction = (id, updates) => {
        setData(prev => ({
            ...prev,
            transactions: prev.transactions.map(t => t.id === id ? { ...t, ...updates } : t)
        }));
    };

    const deleteTransaction = (id) => {
        setData(prev => ({
            ...prev,
            transactions: prev.transactions.filter(t => t.id !== id)
        }));
    };

    const addGoal = (goal) => {
        setData(prev => ({
            ...prev,
            goals: [...prev.goals, { ...goal, id: crypto.randomUUID(), accumulated: 0 }]
        }));
    };

    const updateGoal = (id, updates) => {
        setData(prev => ({
            ...prev,
            goals: prev.goals.map(g => g.id === id ? { ...g, ...updates } : g)
        }));
    };

    // Derived State
    const stats = calculateConservativeBalance(data.transactions, data.goals);
    const risks = detectRisks(data.transactions);

    return (
        <FinanceContext.Provider value={{
            transactions: data.transactions,
            categories: data.categories,
            goals: data.goals,
            stats,
            risks,
            addTransaction,
            updateTransaction,
            deleteTransaction,
            addGoal,
            updateGoal
        }}>
            {children}
        </FinanceContext.Provider>
    );
};

export const useFinance = () => useContext(FinanceContext);
