import { FinanceProvider, useFinance } from './context/FinanceContext'
import { Dashboard } from './components/Dashboard'
import { Modal } from './components/ui/Modal'
import { TransactionForm } from './components/forms/TransactionForm'
import { TransactionHistory } from './components/TransactionHistory'
import { Auth } from './components/Auth'
import { useState, useRef, useEffect } from 'react'
import { format } from 'date-fns'
import { Download, Upload } from 'lucide-react'
import { supabase } from './lib/supabaseClient'
import { SpeedInsights } from '@vercel/speed-insights/react'

function AppContent({ session }) {
  const financeData = useFinance() || {};
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <SpeedInsights />
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
          <span className="text-secondary" style={{ fontSize: '0.8rem' }}>{session?.user?.email}</span>
          <button onClick={handleLogout} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}>Salir</button>

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
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (!session) {
    return <Auth />
  }

  return (
    <FinanceProvider session={session}>
      <AppContent session={session} />
    </FinanceProvider>
  )
}

export default App
