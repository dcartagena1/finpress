import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/finance';
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

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                <div className="flex-col" style={{ flex: 1, minWidth: 0 }}>
                    <span className="text-secondary" style={{ fontSize: '0.9rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Liquidez Disponible</span>
                    <span style={{
                        fontSize: 'clamp(1.75rem, 8vw, 3.5rem)',
                        fontWeight: 700,
                        letterSpacing: '-0.02em',
                        background: 'linear-gradient(to right, #fff, #bbb)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: 'block'
                    }} title={availableBalance.toLocaleString('es-CL')}>
                        {availableBalance > 999999999 ? formatCompactCurrency(availableBalance) : formatCurrency(availableBalance)}
                    </span>
                </div>

                <div style={{ display: 'flex', gap: 'min(3rem, 5vw)', flexShrink: 0 }}>
                    <div className="flex-col" style={{ alignItems: 'flex-end' }}>
                        <span className="text-secondary" style={{ fontSize: '0.8rem' }}>Riesgo Activo</span>
                        <span style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)', fontWeight: 500, color: 'var(--color-danger)' }}>
                            {formatCompactCurrency(pendingCommitments)}
                        </span>
                    </div>

                    <div className="flex-col" style={{ alignItems: 'flex-end' }}>
                        <span className="text-secondary" style={{ fontSize: '0.8rem' }}>Reserva Metas</span>
                        <span style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)', fontWeight: 500, color: 'var(--color-primary)' }}>
                            {formatCompactCurrency(reservedForGoals)}
                        </span>
                    </div>
                </div>
            </div>
        </GlowingCard>
    );
};
