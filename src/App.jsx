import { FinanceProvider } from './context/FinanceContext'
import { Dashboard } from './components/Dashboard'
import { Modal } from './components/ui/Modal'
import { TransactionForm } from './components/forms/TransactionForm'
import { useState } from 'react'
import { format } from 'date-fns'

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

function AppContent() {
  const [isIncomeOpen, setIsIncomeOpen] = useState(false);
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <header className="app-header">
        <div>
          <h1 style={{ fontSize: '1.25rem', marginBottom: '0', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={seedData} title="Click para Demo">
            <span style={{ opacity: 0.8 }}>☰</span> Panel Financiero
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            className="btn"
            style={{ backgroundColor: 'white', color: 'var(--color-primary)', fontWeight: 'bold' }}
            onClick={() => setIsIncomeOpen(true)}
          >
            + Ingreso
          </button>
          <button
            className="btn"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.4)' }}
            onClick={() => setIsExpenseOpen(true)}
          >
            + Gasto
          </button>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', fontWeight: 'bold' }}>
            D
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
