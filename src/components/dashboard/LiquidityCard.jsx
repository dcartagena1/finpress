import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/finance';
import { GlowingCard } from '../ui/GlowingCard';

export const LiquidityCard = () => {
    const { stats } = useFinance();
    const { availableBalance, pendingCommitments, reservedForGoals } = stats;

    return (
        <GlowingCard style={{ padding: 0, overflow: 'hidden', background: 'transparent', boxShadow: 'none' }}>
            {/* Blue Hero Banner */}
            <div style={{
                background: 'linear-gradient(90deg, #003366 0%, #0052cc 100%)',
                borderRadius: 'var(--radius-lg)',
                padding: '2rem',
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: 'var(--shadow-card)'
            }}>
                <div className="flex-col">
                    <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>Liquidez del mes</span>
                    <span style={{ fontSize: '2.5rem', fontWeight: 700 }}>{formatCurrency(availableBalance)}</span>
                </div>

                <div className="flex-col" style={{ borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '2rem' }}>
                    <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Riesgo Activo</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 600, color: '#ffbdad' }}>
                        {formatCurrency(pendingCommitments)}
                    </span>
                </div>

                <div className="flex-col" style={{ borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '2rem' }}>
                    <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Reserva Ahorro</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 600, color: '#b3d4ff' }}>
                        {formatCurrency(reservedForGoals)}
                    </span>
                </div>
            </div>
        </GlowingCard>
    );
};
