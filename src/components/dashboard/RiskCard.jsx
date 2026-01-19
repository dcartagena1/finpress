import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatCompactCurrency } from '../../utils/finance';
import { GlowingCard } from '../ui/GlowingCard';
import { X } from 'lucide-react';

export const RiskCard = () => {
    const { risks } = useFinance();

    return (
        <GlowingCard>
            <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>Alertas de Riesgo</h3>

            {risks.length === 0 ? (
                <div className="text-secondary" style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>No hay alertas activas.</div>
            ) : (
                <div className="flex-col" style={{ gap: '1rem' }}>
                    {risks.map(risk => (
                        <div key={risk.id} className="flex-between" style={{ paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <div className="flex-col">
                                <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>{risk.description}</span>
                                <span className="text-danger" style={{ fontSize: '0.85rem' }}>Vencido: {risk.date}</span>
                            </div>
                            <div className="flex-center" style={{ gap: '1rem', minWidth: 0 }}>
                                <span style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{formatCompactCurrency(risk.amount)}</span>
                                <button className="flex-center" style={{ width: '24px', height: '24px', background: '#ffebe6', color: '#ff5630', borderRadius: '4px' }}>
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </GlowingCard>
    );
};
