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

    // Helper to map DB (snake_case) to App (camelCase)
    const mapToApp = (item) => {
        if (!item) return item;
        return {
            ...item,
            categoryId: item.category_id,
            isRecurring: item.is_recurring,
            userId: item.user_id,
            targetAmount: item.target_amount
        };
    };

    // Helper to map App (camelCase) to DB (snake_case)
    const mapToDB = (item) => {
        if (!item) return item;
        const mapped = { ...item };
        if ('categoryId' in mapped) { mapped.category_id = mapped.categoryId; delete mapped.categoryId; }
        if ('isRecurring' in mapped) { mapped.is_recurring = mapped.isRecurring; delete mapped.isRecurring; }
        if ('userId' in mapped) { mapped.user_id = mapped.userId; delete mapped.userId; }
        if ('targetAmount' in mapped) { mapped.target_amount = mapped.targetAmount; delete mapped.targetAmount; }
        return mapped;
    };

    // Fetch initial data & Listen for changes
    useEffect(() => {
        if (!session?.user) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const { data: txs, error: txErr } = await supabase.from('transactions').select('*').order('date', { ascending: false });
                const { data: gls, error: glErr } = await supabase.from('goals').select('*');
                const { data: cats, error: catErr } = await supabase.from('categories').select('*');

                if (txErr) console.error("Error tx:", txErr);
                if (glErr) console.error("Error gls:", glErr);
                if (catErr) console.error("Error cats:", catErr);

                if (txs) setTransactions(txs.map(mapToApp));
                if (gls) setGoals(gls.map(mapToApp));
                if (cats && cats.length > 0) setCategories([...INITIAL_CATEGORIES, ...cats.map(mapToApp)]);
            } catch (err) {
                console.error("Fetch data general error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // REALTIME SUBSCRIPTIONS
        const txChannel = supabase
            .channel('db-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${session.user.id}` },
                payload => {
                    const mapped = mapToApp(payload.new || payload.old);
                    if (payload.eventType === 'INSERT') setTransactions(prev => [mapped, ...prev]);
                    if (payload.eventType === 'UPDATE') setTransactions(prev => prev.map(t => t.id === mapped.id ? mapped : t));
                    if (payload.eventType === 'DELETE') setTransactions(prev => prev.filter(t => t.id !== mapped.id));
                }
            )
            .on('postgres_changes', { event: '*', schema: 'public', table: 'goals', filter: `user_id=eq.${session.user.id}` },
                payload => {
                    const mapped = mapToApp(payload.new || payload.old);
                    if (payload.eventType === 'INSERT') setGoals(prev => [...prev, mapped]);
                    if (payload.eventType === 'UPDATE') setGoals(prev => prev.map(g => g.id === mapped.id ? mapped : g));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(txChannel);
        };
    }, [session]);

    const addTransaction = async (transaction) => {
        const dbData = mapToDB({
            ...transaction,
            user_id: session.user.id
        });

        const { data, error } = await supabase
            .from('transactions')
            .insert([dbData])
            .select();

        if (error) {
            console.error("Error adding transaction:", error);
            alert("Error al guardar: " + error.message);
            return;
        }

        if (data && data.length > 0) {
            const mapped = mapToApp(data[0]);
            setTransactions(prev => [mapped, ...prev]);
        }
    };

    const updateTransaction = async (id, updates) => {
        const dbUpdates = mapToDB(updates);
        const { error } = await supabase
            .from('transactions')
            .update(dbUpdates)
            .eq('id', id);

        if (error) {
            console.error("Error updating transaction:", error);
            alert("Error al actualizar: " + error.message);
            return;
        }

        setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    };

    const deleteTransaction = async (id) => {
        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Error deleting transaction:", error);
            return;
        }

        setTransactions(prev => prev.filter(t => t.id !== id));
    };

    const addGoal = async (goal) => {
        const dbGoal = mapToDB({
            ...goal,
            user_id: session.user.id,
            accumulated: 0
        });

        const { data, error } = await supabase
            .from('goals')
            .insert([dbGoal])
            .select();

        if (error) {
            console.error("Error adding goal:", error);
            return;
        }

        if (data) {
            setGoals(prev => [...prev, mapToApp(data[0])]);
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

        if (error) {
            console.error("Error adding category:", error);
            return null;
        }

        if (data) {
            const mapped = mapToApp(data[0]);
            setCategories(prev => [...prev, mapped]);
            return mapped.id;
        }
        return null;
    };

    const updateGoal = async (id, updates) => {
        const dbUpdates = mapToDB(updates);
        const { error } = await supabase
            .from('goals')
            .update(dbUpdates)
            .eq('id', id);

        if (error) {
            console.error("Error updating goal:", error);
            return;
        }

        setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
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
