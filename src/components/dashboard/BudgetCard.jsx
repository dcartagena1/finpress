import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/finance';
import { startOfMonth, endOfMonth, parseISO, isWithinInterval, format } from 'date-fns';
import { GlowingCard } from '../ui/GlowingCard';
import { useState, useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

export const BudgetCard = () => {
    const { transactions, categories } = useFinance();
    const [viewMode, setViewMode] = useState('TREND'); // 'TREND' | 'CATEGORY'

    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);

    const thisMonthTrans = useMemo(() => transactions.filter(t => {
        const d = parseISO(t.date);
        return isWithinInterval(d, { start, end });
    }), [transactions]);

    const income = thisMonthTrans.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
    const expense = thisMonthTrans.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);

    // Prepare Data for Charts
    const trendData = useMemo(() => {
        // Group by day for the current month
        const days = {};
        thisMonthTrans.forEach(t => {
            const day = format(parseISO(t.date), 'dd');
            if (!days[day]) days[day] = { name: day, Ingreso: 0, Gasto: 0 };
            if (t.type === 'INCOME') days[day].Ingreso += t.amount;
            else days[day].Gasto += t.amount;
        });
        return Object.values(days).sort((a, b) => Number(a.name) - Number(b.name));
    }, [thisMonthTrans]);

    const categoryData = useMemo(() => {
        const cats = {};
        thisMonthTrans.filter(t => t.type === 'EXPENSE').forEach(t => {
            const catName = categories.find(c => c.id === t.categoryId)?.name || 'Otros';
            if (!cats[catName]) cats[catName] = { name: catName, value: 0 };
            cats[catName].value += t.amount;
        });
        return Object.values(cats);
    }, [thisMonthTrans, categories]);

    // Dark Mode Palette
    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6'];

    return (
        <GlowingCard>
            <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Resumen Mensual</h3>
                <select
                    className="input"
                    style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value)}
                >
                    <option value="TREND">Tendencia Diaria</option>
                    <option value="CATEGORY">Por Categorías</option>
                </select>
            </div>

            <div className="flex-between" style={{ marginBottom: '2rem' }}>
                <div className="flex-col" style={{ minWidth: 0 }}>
                    <span className="text-secondary" style={{ fontSize: '0.75rem' }}>Ingresos</span>
                    <span style={{ fontWeight: 600, color: 'var(--color-success)', fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{formatCompactCurrency(income)}</span>
                </div>
                <div className="flex-col" style={{ minWidth: 0 }}>
                    <span className="text-secondary" style={{ fontSize: '0.75rem' }}>Gastos</span>
                    <span style={{ fontWeight: 600, color: 'var(--color-danger)', fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{formatCompactCurrency(expense)}</span>
                </div>
                <div className="flex-col" style={{ minWidth: 0 }}>
                    <span className="text-secondary" style={{ fontSize: '0.75rem' }}>Neto</span>
                    <span style={{ fontWeight: 600, color: income - expense > 0 ? 'var(--color-primary)' : 'var(--text-primary)', fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{income - expense > 0 ? '+' : ''}{formatCompactCurrency(income - expense)}</span>
                </div>
            </div>

            {/* Chart Area */}
            <div style={{ width: '100%', height: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    {viewMode === 'TREND' ? (
                        <BarChart data={trendData}>
                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} stroke="var(--text-muted)" />
                            <Tooltip
                                formatter={(value) => formatCurrency(value)}
                                contentStyle={{ backgroundColor: '#1f2937', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            />
                            <Bar dataKey="Ingreso" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Gasto" fill="var(--color-danger)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    ) : (
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value) => formatCurrency(value)}
                                contentStyle={{ backgroundColor: '#1f2937', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    )}
                </ResponsiveContainer>
            </div>
        </GlowingCard>
    );
};
