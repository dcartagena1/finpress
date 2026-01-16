import { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { format } from 'date-fns';

export const TransactionForm = ({ type, onSuccess }) => {
    const { addTransaction, categories } = useFinance();
    const [formData, setFormData] = useState({
        amount: '',
        description: '',
        categoryId: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        isRecurring: false,
        confirmed: true // Default to confirmed if it's today/past? Or force user to choose? 
        // "Nada se marca como pagado automáticamente" - usually means for recurrent occurrences. 
        // manual entry is usually confirmed unless user says otherwise.
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        addTransaction({
            ...formData,
            amount: Number(formData.amount),
            type: type, // 'INCOME' or 'EXPENSE' passed from prop
            confirmed: formData.confirmed // explicit
        });
        onSuccess();
    };

    const filteredCategories = categories.filter(c => c.type === type);

    return (
        <form onSubmit={handleSubmit} className="flex-col" style={{ gap: '1rem' }}>
            <div>
                <label className="text-secondary" style={{ fontSize: '0.875rem' }}>Monto</label>
                <input
                    type="number"
                    className="input"
                    placeholder="0"
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                    required
                    autoFocus
                />
            </div>

            <div>
                <label className="text-secondary" style={{ fontSize: '0.875rem' }}>Descripción</label>
                <input
                    type="text"
                    className="input"
                    placeholder={type === 'INCOME' ? 'Ej: Sueldo' : 'Ej: Compras Super'}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    required
                />
            </div>

            <div>
                <label className="text-secondary" style={{ fontSize: '0.875rem' }}>Categoría</label>
                <select
                    className="input"
                    value={formData.categoryId}
                    onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                    required
                >
                    <option value="">Seleccionar...</option>
                    {filteredCategories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                    <label className="text-secondary" style={{ fontSize: '0.875rem' }}>Fecha</label>
                    <input
                        type="date"
                        className="input"
                        value={formData.date}
                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                        required
                    />
                </div>
                <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem', marginTop: '1.5rem' }}>
                    <input
                        type="checkbox"
                        id="confirmed"
                        checked={formData.confirmed}
                        onChange={e => setFormData({ ...formData, confirmed: e.target.checked })}
                        style={{ width: '1.25rem', height: '1.25rem' }}
                    />
                    <label htmlFor="confirmed" style={{ cursor: 'pointer' }}>Confirmado</label>
                </div>
            </div>

            <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)' }}>
                <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem' }}>
                    <input
                        type="checkbox"
                        id="recurring"
                        checked={formData.isRecurring}
                        onChange={e => setFormData({ ...formData, isRecurring: e.target.checked })}
                        style={{ width: '1.25rem', height: '1.25rem' }}
                    />
                    <label htmlFor="recurring" style={{ cursor: 'pointer' }}>
                        {type === 'INCOME' ? 'Es Ingreso Mensual Fijo' : 'Es Gasto Recurrente'}
                    </label>
                </div>
                {formData.isRecurring && (
                    <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.5rem', marginLeft: '1.75rem' }}>
                        {type === 'INCOME'
                            ? 'Este ingreso se proyectará en los meses siguientes.'
                            : 'Se generará una alerta de riesgo si no se confirma en la fecha esperada.'}
                    </p>
                )}
            </div>

            <button className="btn btn-primary" type="submit" style={{ marginTop: '0.5rem' }}>
                Guardar {type === 'INCOME' ? 'Ingreso' : 'Gasto'}
            </button>
        </form>
    );
};
