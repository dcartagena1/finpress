import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/finance';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { useState } from 'react';
import { Edit2, Trash2, Calendar } from 'lucide-react';

export const TransactionHistory = ({ onEdit }) => {
    const { transactions, deleteTransaction, categories } = useFinance();
    const [filterDate, setFilterDate] = useState(format(new Date(), 'yyyy-MM'));

    // Filter Logic
    const filteredTransactions = transactions.filter(t => {
        if (!filterDate) return true;
        const date = parseISO(t.date);
        const start = startOfMonth(parseISO(filterDate + '-01'));
        const end = endOfMonth(parseISO(filterDate + '-01'));
        return isWithinInterval(date, { start, end });
    }).sort((a, b) => new Date(b.date) - new Date(a.date));

    const getCategoryName = (id) => categories.find(c => c.id === id)?.name || 'Sin Categoría';

    const handleDelete = (id) => {
        if (confirm('¿Estás seguro de eliminar este movimiento?')) {
            deleteTransaction(id);
        }
    };

    return (
        <div className="flex-col" style={{ gap: '1.5rem' }}>
            {/* Controls */}
            <div className="flex-between" style={{ background: 'white', padding: '1rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="flex-center" style={{ gap: '0.5rem' }}>
                    <Calendar size={20} className="text-secondary" />
                    <span style={{ fontWeight: 500 }}>Periodo:</span>
                </div>
                <input
                    type="month"
                    className="input"
                    style={{ width: 'auto' }}
                    value={filterDate}
                    onChange={e => setFilterDate(e.target.value)}
                />
            </div>

            {/* List */}
            <div className="flex-col" style={{ gap: '1rem' }}>
                {filteredTransactions.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No hay movimientos en este periodo.
                    </div>
                ) : (
                    filteredTransactions.map(t => (
                        <div key={t.id} className="card flex-between" style={{ padding: '1rem', borderLeft: `4px solid ${t.type === 'INCOME' ? 'var(--color-success)' : 'var(--color-danger)'}` }}>
                            <div className="flex-col">
                                <span style={{ fontWeight: 600, fontSize: '1rem' }}>{t.description}</span>
                                <div className="flex-center" style={{ gap: '0.5rem', fontSize: '0.85rem' }}>
                                    <span className="text-secondary">{format(parseISO(t.date), 'dd/MM/yyyy')}</span>
                                    <span style={{ color: '#ddd' }}>|</span>
                                    <span className="text-secondary">{getCategoryName(t.categoryId)}</span>
                                    {!t.confirmed && <span className="text-danger" style={{ fontWeight: 'bold' }}> (Pendiente)</span>}
                                </div>
                            </div>

                            <div className="flex-center" style={{ gap: '1.5rem' }}>
                                <span style={{
                                    fontWeight: 700,
                                    fontSize: '1.1rem',
                                    color: t.type === 'INCOME' ? 'var(--color-success)' : 'var(--text-primary)'
                                }}>
                                    {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
                                </span>
                                <div className="flex-center" style={{ gap: '0.5rem' }}>
                                    <button onClick={() => onEdit(t)} style={{ padding: '0.5rem', background: '#f4f5f7', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(t.id)} style={{ padding: '0.5rem', background: '#ffebe6', borderRadius: '4px', color: 'var(--color-danger)' }}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
