import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/finance';
import { TrendingDown } from 'lucide-react';
import { startOfMonth, endOfMonth, parseISO, isWithinInterval } from 'date-fns';
import { GlowingCard } from '../ui/GlowingCard';

export const DeviationsCard = () => {
    const { transactions } = useFinance();
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);

    const deviations = transactions
        .filter(t => {
            const d = parseISO(t.date);
            return t.type === 'EXPENSE' && !t.isRecurring && isWithinInterval(d, { start, end });
        })
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 3);

    return (
        <GlowingCard>
            <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', margin: 0 }}>Principales Desviaciones</h3>
            </div>

            <div className="flex-col" style={{ gap: '0.75rem' }}>
                {deviations.length === 0 ? (
                    <p className="text-muted" style={{ fontSize: '0.875rem' }}>Sin gastos extraordinarios.</p>
                ) : (
                    deviations.map((d, index) => (
                        <div key={d.id} className="flex-between" style={{
                            background: 'rgba(255,255,255,0.03)',
                            padding: '0.75rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '0.4rem', borderRadius: '8px' }}>
                                    <TrendingDown size={16} className="text-danger" />
                                </div>
                                <div className="flex-col">
                                    <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{d.description}</span>
                                    <span className="text-secondary" style={{ fontSize: '0.75rem' }}>Sobre presupuesto</span>
                                </div>
                            </div>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatCurrency(d.amount)}</span>
                        </div>
                    ))
                )}
            </div>
        </GlowingCard>
    );
};
