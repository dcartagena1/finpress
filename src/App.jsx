import { FinanceProvider, useFinance } from './context/FinanceContext'
import { Dashboard } from './components/Dashboard'
import { Modal } from './components/ui/Modal'
import { TransactionForm } from './components/forms/TransactionForm'
import { TransactionHistory } from './components/TransactionHistory'
import { useState, useRef } from 'react'
import { format } from 'date-fns'
import { Download, Upload } from 'lucide-react'

const seedData = () => {
  if (confirm('¿Cargar datos de prueba? Esto borrará tus datos actuales.')) {
    const now = new Date();
    const demoTransactions = [
      { id: crypto.randomUUID(), type: 'INCOME', amount: 1500000, date: format(now, 'yyyy-MM-dd'), confirmed: true, description: 'Sueldo', categoryId: 'i1' },
      { id: crypto.randomUUID(), type: 'EXPENSE', amount: 450000, date: format(new Date().setDate(now.getDate() - 1), 'yyyy-MM-dd'), confirmed: false, isRecurring: true, description: 'Arriendo (Vencido)', categoryId: 'c1' }, // RISK
      { id: crypto.randomUUID(), type: 'EXPENSE', amount: 15000, date: format(new Date().setDate(now.getDate() + 5), 'yyyy-MM-dd'), confirmed: false, isRecurring: true, description: 'Netflix', categoryId: 'c6' },
      { id: crypto.randomUUID(), type: 'EXPENSE', amount: 50000, date: format(now, 'yyyy-MM-dd'), confirmed: true, description: 'Supermercado', categoryId: 'c2' },
      { id: crypto.randomUUID(), type: 'EXPENSE', amount: 120000, date: format(now, 'yyyy-MM-dd'), confirmed: true, description: 'Cena Lujo', categoryId: 'c6' } // Deviation
    ];
    const demoGoals = [
      { id: crypto.randomUUID(), name: 'Vacaciones', targetAmount: 1000000, accumulated: 200000, deadline: '2026-12-31' },
      { id: crypto.randomUUID(), name: 'Auto Nuevo', targetAmount: 5000000, accumulated: 1500000, deadline: '2027-06-01' }
    ];
    localStorage.setItem('finpress_data_v1', JSON.stringify({
      transactions: demoTransactions,
      categories: [
        { id: 'c1', name: 'Vivienda', type: 'EXPENSE' },
        { id: 'c2', name: 'Alimentación', type: 'EXPENSE' },
        { id: 'c3', name: 'Transporte', type: 'EXPENSE' },
        { id: 'c4', name: 'Servicios', type: 'EXPENSE' },
        { id: 'c5', name: 'Salud', type: 'EXPENSE' },
        { id: 'c6', name: 'Ocio', type: 'EXPENSE' },
        { id: 'i1', name: 'Sueldo', type: 'INCOME' },
        { id: 'i2', name: 'Extras', type: 'INCOME' }
      ],
      goals: demoGoals
    }));
    window.location.reload();
  }
};

// ... existing imports ...
// (Removed duplicate import of Download, Upload, Settings)

// ... seedData ...

function AppContent() {
  const financeData = useFinance() || {}; // Safety fallback
  const { exportData = () => { }, importData = () => { } } = financeData;

  const [isIncomeOpen, setIsIncomeOpen] = useState(false);
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const fileInputRef = useRef(null);

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setIsHistoryOpen(false);
  };

  const handleImportClick = () => {
    if (confirm('IMPORTANTE: Al importar se reemplazarán todos tus datos actuales. ¿Deseas continuar?')) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      importData(file);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".json"
        onChange={handleFileChange}
      />

      <header className="app-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        padding: '1rem 0',
        borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'var(--grad-primary)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(59, 130, 246, 0.3)'
          }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>F</span>
          </div>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            margin: 0
          }}>
            FinPress
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {/* Utility Group */}
          <div style={{ display: 'flex', gap: '0.5rem', paddingRight: '1rem', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
            <button
              onClick={exportData}
              className="flex-center icon-btn"
              title="Exportar Respaldo"
              style={{ color: 'var(--text-secondary)', padding: '0.5rem' }}
            >
              <Download size={20} />
            </button>
            <button
              onClick={handleImportClick}
              className="flex-center icon-btn"
              title="Importar Respaldo"
              style={{ color: 'var(--text-secondary)', padding: '0.5rem' }}
            >
              <Upload size={20} />
            </button>
          </div>

          {/* Action Group */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setIsHistoryOpen(true)}
              style={{ height: '40px', padding: '0 1.25rem' }}
            >
              Movimientos
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setIsIncomeOpen(true)}
              style={{ height: '40px', padding: '0 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <span>+</span> Ingreso
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setIsExpenseOpen(true)}
              style={{ height: '40px', padding: '0 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#f87171' }}
            >
              <span>+</span> Gasto
            </button>
          </div>
        </div>
      </header>

      <main>
        <Dashboard />
      </main>

      <Modal
        isOpen={isIncomeOpen}
        onClose={() => setIsIncomeOpen(false)}
        title="Registrar Ingreso"
      >
        <TransactionForm type="INCOME" onSuccess={() => setIsIncomeOpen(false)} />
      </Modal>

      <Modal
        isOpen={isExpenseOpen}
        onClose={() => setIsExpenseOpen(false)}
        title="Registrar Gasto"
      >
        <TransactionForm type="EXPENSE" onSuccess={() => setIsExpenseOpen(false)} />
      </Modal>

      <Modal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        title="Historial de Movimientos"
      >
        <TransactionHistory onEdit={handleEdit} />
      </Modal>

      <Modal
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
        title="Editar Movimiento"
      >
        {editingTransaction && (
          <TransactionForm
            initialData={editingTransaction}
            type={editingTransaction.type}
            onSuccess={() => setEditingTransaction(null)}
          />
        )}
      </Modal>
    </div>
  );
}

function App() {
  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  )
}

export default App
