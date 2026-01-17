import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/finance';
import { addDays, format, parseISO, isSameDay } from 'date-fns';
import { GlowingCard } from '../ui/GlowingCard';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export const ProjectionCard = () => {
    const { transactions, stats } = useFinance();
    const { availableBalance, realBalance } = stats;

    // Calculate Projection
    const projectionData = [];
    const today = new Date();
    let currentBalance = realBalance;

    // Find active recurring expenses
    // We assume recurring expenses happen on the same day of month
    const recurringExpenses = transactions.filter(t => t.type === 'EXPENSE' && t.isRecurring);

    for (let i = 0; i <= 30; i++) {
        const date = addDays(today, i);
        const dayOfMonth = date.getDate();

        // Subtract recurring expenses that fall on this day
        // (Simplified logic: if expense date day matches today's day)
        // Ideally we check if they are already paid for this specific month, but for projection we assume they will hit.
        // Better logic: if the user hasn't confirmed it yet for this month/future.

        // For this "Survival" chart, we just simply subtract any recurring commitment that falls on this day of month
        // regardless of month. It's a rough projection.
        let dailyImpact = 0;
        recurringExpenses.forEach(exp => {
            const expDay = parseISO(exp.date).getDate();
            if (expDay === dayOfMonth) {
                dailyImpact += exp.amount;
            }
        });

        // We don't project income to add "Pressure" (Pessimistic view)
        // unless it's a confirmed recurring income? User instructions said "Active Pressure".
        // Let's stick to pessimist: Balance only goes down unless manual income added.

        currentBalance -= dailyImpact;

        projectionData.push({
            date: format(date, 'dd/MM'),
            balance: currentBalance,
            impact: dailyImpact > 0 ? dailyImpact : null
        });
    }

    const minBalance = Math.min(...projectionData.map(d => d.balance));
    const isDanger = minBalance < 0;

    return (
        <GlowingCard className="col-span-12">
            <div className="flex-between" style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Proyección a 30 Días</h3>
                {isDanger && (
                    <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '12px', background: 'rgba(239,68,68,0.2)', color: 'var(--color-danger)', border: '1px solid rgba(239,68,68,0.3)' }}>
                        ⚠ Alerta de Liquidez
                    </span>
                )}
            </div>

            <div style={{ width: '100%', height: '200px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={projectionData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={isDanger ? 'var(--color-danger)' : 'var(--color-primary)'} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={isDanger ? 'var(--color-danger)' : 'var(--color-primary)'} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} stroke="var(--text-muted)" interval={4} />
                        <Tooltip
                            formatter={(value) => formatCurrency(value)}
                            contentStyle={{ backgroundColor: '#1f2937', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                        />
                        <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" />
                        <Area
                            type="monotone"
                            dataKey="balance"
                            stroke={isDanger ? 'var(--color-danger)' : 'var(--color-primary)'}
                            fillOpacity={1}
                            fill="url(#colorBalance)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '1rem', fontStyle: 'italic' }}>
                * Proyección pesimista basada en tus gastos recurrentes sin considerar futuros ingresos no registrados.
            </p>
        </GlowingCard>
    );
};
