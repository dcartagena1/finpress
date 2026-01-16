import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/finance';
import { startOfMonth, endOfMonth, parseISO, isWithinInterval } from 'date-fns';
import { GlowingCard } from '../ui/GlowingCard';

export const BudgetCard = () => {
    const { transactions } = useFinance();
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);

    const thisMonthTrans = transactions.filter(t => {
        const d = parseISO(t.date);
        return isWithinInterval(d, { start, end });
    });

    const income = thisMonthTrans.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
    const expense = thisMonthTrans.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);

    // Fake chart visual
    const bars = [40, 60, 45, 80, 55, 65, 30, 90, 70, 50, 60, 80];

    return (
        <GlowingCard>
            <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', margin: 0 }}>Resumen Mensual</h3>
                <select style={{ border: 'none', color: 'var(--text-secondary)', background: 'transparent' }}>
                    <option>Este Año</option>
                </select>
            </div>

            <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                <div className="flex-col">
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>Ingresos</span>
                    <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>{formatCurrency(income)}</span>
                </div>
                <div className="flex-col">
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>Gastos</span>
                    <span style={{ fontWeight: 600, color: 'var(--color-danger)' }}>{formatCurrency(expense)}</span>
                </div>
                <div className="flex-col">
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>Neto</span>
                    <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{income - expense > 0 ? '+' : ''}{formatCurrency(income - expense)}</span>
                </div>
            </div>

            {/* Fake Chart Area */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '100px', gap: '4px' }}>
                {bars.map((h, i) => (
                    <div key={i} style={{ width: '100%', height: `${h}%`, background: i === bars.length - 1 ? 'var(--color-success)' : '#ebecf0', borderRadius: '2px 2px 0 0' }}></div>
                ))}
            </div>
        </GlowingCard>
    );
};
