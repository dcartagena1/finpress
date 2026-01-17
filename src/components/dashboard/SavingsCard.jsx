import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/finance';
import { Plus, Target, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { GlowingCard } from '../ui/GlowingCard';

const GoalCreateForm = ({ onClose }) => {
    const { addGoal } = useFinance();
    const [form, setForm] = useState({ name: '', target: '', deadline: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        addGoal({
            name: form.name,
            targetAmount: Number(form.target),
            deadline: form.deadline
        });
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="flex-col" style={{ gap: '1rem' }}>
            <div>
                <label className="text-secondary" style={{ fontSize: '0.875rem' }}>Nombre Meta</label>
                <input type="text" className="input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ej: Vacaciones" />
            </div>
            <div>
                <label className="text-secondary" style={{ fontSize: '0.875rem' }}>Monto Objetivo</label>
                <input type="number" className="input" required value={form.target} onChange={e => setForm({ ...form, target: e.target.value })} placeholder="0" />
            </div>
            <div>
                <label className="text-secondary" style={{ fontSize: '0.875rem' }}>Fecha Límite</label>
                <input type="date" className="input" required value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
            </div>
            <button className="btn btn-primary" type="submit">Crear Meta</button>
        </form>
    );
};

export const SavingsCard = () => {
    const { goals, updateGoal } = useFinance();
    const [isAdding, setIsAdding] = useState(false);

    // Logic to add funds
    const handleAddFunds = (goal) => {
        const amount = prompt(`Monto a transferir a ${goal.name}:`);
        if (amount && !isNaN(amount)) {
            updateGoal(goal.id, { accumulated: (goal.accumulated || 0) + Number(amount) });
        }
    };

    return (
        <GlowingCard className="h-full">
            <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', margin: 0 }}>Progreso de Ahorros</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {goals.length === 0 ? (
                    <p className="text-muted" style={{ fontSize: '0.875rem' }}>No hay metas definidas.</p>
                ) : (
                    goals.map(g => {
                        const progress = Math.min(100, (g.accumulated / g.targetAmount) * 100);
                        return (
                            <div key={g.id} style={{
                                padding: '1rem',
                                borderRadius: 'var(--radius-md)',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.05)'
                            }}>
                                <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{g.name}</span>
                                    <ChevronDown size={16} className="text-muted" />
                                </div>

                                <div style={{ width: '100%', height: '8px', background: '#ebecf0', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.75rem' }}>
                                    <div style={{ width: `${progress}%`, background: 'var(--color-primary)', height: '100%', borderRadius: '4px' }}></div>
                                </div>

                                <div className="flex-between">
                                    <div className="flex-col">
                                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{Math.round(progress)}%</span>
                                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>{formatCurrency(g.accumulated)} / {formatCurrency(g.targetAmount)}</span>
                                    </div>
                                    <div className="flex-col" style={{ alignItems: 'flex-end' }}>
                                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(g.targetAmount - g.accumulated)}</span>
                                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>Faltan meses...</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleAddFunds(g)}
                                    className="text-primary"
                                    style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.8rem', cursor: 'pointer', marginTop: '0.5rem', fontWeight: 500, padding: 0 }}
                                >
                                    + Agregar Fondos
                                </button>
                            </div>
                        );
                    })
                )}
            </div>

            <button className="btn btn-primary" style={{ marginTop: '1.5rem', width: '100%' }} onClick={() => setIsAdding(true)}>
                <Plus size={16} /> Nueva Meta
            </button>

            <Modal isOpen={isAdding} onClose={() => setIsAdding(false)} title="Nueva Meta de Ahorro">
                <GoalCreateForm onClose={() => setIsAdding(false)} />
            </Modal>
        </GlowingCard>
    );
};
