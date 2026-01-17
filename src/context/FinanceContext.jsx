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





    const exportData = () => {
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `finpress_backup_${format(new Date(), 'yyyy-MM-dd')}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const importData = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const parsed = JSON.parse(e.target.result);
                // Basic Validation
                if (parsed.transactions && parsed.categories && parsed.goals) {
                    setData(parsed);
                    alert('¡Datos restaurados exitosamente!');
                } else {
                    alert('Error: El archivo no es válido.');
                }
            } catch (err) {
                alert('Error al leer el archivo.');
            }
        };
        reader.readAsText(file);
    };

    const addGoal = (goal) => {
        setData(prev => ({
            ...prev,
            goals: [...prev.goals, { ...goal, id: crypto.randomUUID(), accumulated: 0 }]
        }));
    };

    const addCategory = (name, type) => {
        const id = 'c-' + Date.now();
        setData(prev => ({
            ...prev,
            categories: [...prev.categories, { id, name, type }]
        }));
        return id;
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
            updateGoal,
            addCategory,
            exportData,
            importData
        }}>
            {children}
        </FinanceContext.Provider>
    );
};

export const useFinance = () => useContext(FinanceContext);
