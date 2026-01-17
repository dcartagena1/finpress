import { createContext, useContext, useState, useEffect } from 'react';
import { calculateConservativeBalance, detectRisks } from '../utils/finance';
import { startOfMonth, format } from 'date-fns';
import { supabase } from '../lib/supabaseClient';

const FinanceContext = createContext();

const INITIAL_CATEGORIES = [
    { id: 'c1', name: 'Vivienda', type: 'EXPENSE' },
    { id: 'c2', name: 'Alimentación', type: 'EXPENSE' },
    { id: 'c3', name: 'Transporte', type: 'EXPENSE' },
    { id: 'c4', name: 'Servicios', type: 'EXPENSE' },
    { id: 'c5', name: 'Salud', type: 'EXPENSE' },
    { id: 'c6', name: 'Ocio', type: 'EXPENSE' },
    { id: 'i1', name: 'Sueldo', type: 'INCOME' },
    { id: 'i2', name: 'Extras', type: 'INCOME' }
];

export const FinanceProvider = ({ children, session }) => {
    const [transactions, setTransactions] = useState([]);
    const [goals, setGoals] = useState([]);
    const [categories, setCategories] = useState(INITIAL_CATEGORIES);
    const [loading, setLoading] = useState(true);

    // Fetch initial data
    useEffect(() => {
        if (!session?.user) return;

        const fetchData = async () => {
            setLoading(true);

            // Fetch Transactions
            const { data: txs, error: txError } = await supabase
                .from('transactions')
                .select('*')
                .order('date', { ascending: false });

            // Fetch Goals
            const { data: gls, error: glError } = await supabase
                .from('goals')
                .select('*');

            // Fetch Custom Categories (if any)
            const { data: cats, error: catError } = await supabase
                .from('categories')
                .select('*');

            if (txs) setTransactions(txs);
            if (gls) setGoals(gls);
            if (cats && cats.length > 0) {
                // Merge default and custom, or just use custom + default
                // For MVP, just append custom to default
                setCategories([...INITIAL_CATEGORIES, ...cats]);
            }

            setLoading(false);
        };

        fetchData();
    }, [session]);

    const addTransaction = async (transaction) => {
        const { data, error } = await supabase
            .from('transactions')
            .insert([{
                ...transaction,
                user_id: session.user.id
            }])
            .select();

        if (data) {
            setTransactions(prev => [data[0], ...prev]);
        }
    };

    const updateTransaction = async (id, updates) => {
        const { error } = await supabase
            .from('transactions')
            .update(updates)
            .eq('id', id);

        if (!error) {
            setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
        }
    };

    const deleteTransaction = async (id) => {
        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id);

        if (!error) {
            setTransactions(prev => prev.filter(t => t.id !== id));
        }
    };

    const addGoal = async (goal) => {
        const { data, error } = await supabase
            .from('goals')
            .insert([{
                ...goal,
                user_id: session.user.id,
                accumulated: 0
            }])
            .select();

        if (data) {
            setGoals(prev => [...prev, data[0]]);
        }
    };

    const addCategory = async (name, type) => {
        const id = 'custom-' + Date.now();
        const { data, error } = await supabase
            .from('categories')
            .insert([{
                id,
                name,
                type,
                user_id: session.user.id
            }])
            .select();

        if (data) {
            setCategories(prev => [...prev, data[0]]);
            return id;
        }
        return null;
    };

    const updateGoal = async (id, updates) => {
        const { error } = await supabase
            .from('goals')
            .update(updates)
            .eq('id', id);

        if (!error) {
            setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
        }
    };

    // Derived State
    const stats = calculateConservativeBalance(transactions, goals);
    const risks = detectRisks(transactions);

    // Keep export data for manual backup if needed
    const exportData = () => {
        const data = { transactions, goals, categories };
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
        // Import Logic for Supabase is complex (batch insert).
        // For now, alert user this is manual only or implement batch insert.
        alert("La importación masiva está deshabilitada temporalmente en modo nube por seguridad. Por favor ingresa los datos manualmente o contacta soporte.");
    };

    return (
        <FinanceContext.Provider value={{
            transactions,
            categories,
            goals,
            stats,
            risks,
            loading,
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
