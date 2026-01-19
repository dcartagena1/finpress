import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatCompactCurrency } from '../../utils/finance';
import { GlowingCard } from '../ui/GlowingCard';

export const LiquidityCard = () => {
    const { stats } = useFinance();
    const { availableBalance, pendingCommitments, reservedForGoals } = stats;

    return (
        <GlowingCard className="col-span-12" style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Decorative ambient glow */}
            <div style={{ position: 'absolute', top: -100, left: '20%', width: 300, height: 300, background: 'var(--color-primary-glow)', filter: 'blur(100px)', opacity: 0.2 }}></div>

            <div className="flex-col" style={{ gap: '1.5rem', position: 'relative', zIndex: 1 }}>
                {/* Top Section: Main Balance */}
                <div className="flex-col">
                    <span className="text-secondary" style={{ fontSize: '0.8rem', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Liquidez Disponible</span>
                    <span style={{
                        fontSize: 'clamp(2.5rem, 12vw, 4rem)',
                        fontWeight: 700,
                        letterSpacing: '-0.03em',
                        background: 'linear-gradient(to right, #fff, #bbb)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        lineHeight: 1
                    }}>
                        {availableBalance > 999999999 ? formatCompactCurrency(availableBalance) : formatCurrency(availableBalance)}
                    </span>
                </div>

                {/* Bottom Section: Secondary Metrics */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1rem',
                    paddingTop: '1.25rem',
                    borderTop: '1px solid rgba(255,255,255,0.08)'
                }}>
                    <div className="flex-col">
                        <span className="text-secondary" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Riesgo Activo</span>
                        <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-danger)' }}>
                            {formatCurrency(pendingCommitments)}
                        </span>
                    </div>

                    <div className="flex-col">
                        <span className="text-secondary" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Reserva Metas</span>
                        <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                            {formatCurrency(reservedForGoals)}
                        </span>
                    </div>
                </div>
            </div>
        </GlowingCard>
    );
};
