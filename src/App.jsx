import { FinanceProvider, useFinance } from './context/FinanceContext'
import { Dashboard } from './components/Dashboard'
import { Modal } from './components/ui/Modal'
import { TransactionForm } from './components/forms/TransactionForm'
import { TransactionHistory } from './components/TransactionHistory'
import { Auth } from './components/Auth'
import { useState, useRef, useEffect } from 'react'
import { Download, Plus, List, TrendingUp, TrendingDown, LogOut } from 'lucide-react'
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
  }

  const handleEnableBiometrics = async () => {
    try {
      // NOTE: Supabase WebAuthn (Passkeys) requires the user to be logged in.
      // This will trigger the browser's Face ID prompt to register a 'Passkey'.
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'webauthn',
        friendlyName: 'Mi Dispositivo'
      });

      if (error) throw error;

      // In a full implementation, you'd confirm the challenge here.
      // For general "Face ID Login" we use the Passkeys API if available.
      alert('¡Configuración iniciada! Sigue las instrucciones de tu navegador para registrar Face ID.');
    } catch (error) {
      console.error(error);
      alert('Error al configurar: ' + error.message);
    }
  }

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '6rem' }}>
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
        padding: '0.5rem 0',
        borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}>
        {/* Logo Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            background: 'var(--grad-primary)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(59, 130, 246, 0.3)'
          }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white' }}>F</span>
          </div>
          <h1 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            margin: 0
          }}>
            FinPress
          </h1>
        </div>

        {/* User / Actions Desktop Only */}
        <div className="desktop-only" style={{ gap: '1rem', alignItems: 'center' }}>
          <button
            onClick={handleEnableBiometrics}
            className="btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Fingerprint size={14} /> Activar Face ID
          </button>

          <span className="text-secondary" style={{ fontSize: '0.8rem' }}>{session?.user?.email}</span>
          <button onClick={handleLogout} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}>Salir</button>

          <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)', margin: '0 0.5rem' }}></div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={exportData}
              className="flex-center"
              title="Respaldo"
              style={{ color: 'var(--text-secondary)', background: 'none', padding: '0.25rem' }}
            >
              <Download size={18} />
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setIsHistoryOpen(true)}
              style={{ height: '36px', padding: '0 1rem' }}
            >
              Movimientos
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setIsIncomeOpen(true)}
              style={{ height: '36px', padding: '0 1rem' }}
            >
              + Ingreso
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setIsExpenseOpen(true)}
              style={{ height: '36px', padding: '0 1rem', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#f87171' }}
            >
              + Gasto
            </button>
          </div>
        </div>

        {/* Mobile Header Icons */}
        <div className="mobile-only" style={{ gap: '0.5rem' }}>
          <button onClick={handleEnableBiometrics} style={{ background: 'none', color: 'var(--text-secondary)', padding: '0.5rem' }}>
            <Fingerprint size={20} />
          </button>
          <button onClick={handleLogout} style={{ background: 'none', color: 'var(--text-secondary)', padding: '0.5rem' }}>
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main style={{ minHeight: 'calc(100vh - 200px)' }}>
        <Dashboard />
      </main>

      {/* MOBILE BOTTOM NAVIGATION - PROFESSIONAL UX */}
      <nav className="mobile-only mobile-nav">
        <button className="nav-item" onClick={() => setIsHistoryOpen(true)}>
          <List size={24} />
          <span>Historial</span>
        </button>

        <button className="nav-item" onClick={() => setIsIncomeOpen(true)} style={{ color: 'var(--color-success)' }}>
          <TrendingUp size={24} />
          <span>Ingreso</span>
        </button>

        <button className="nav-item" onClick={() => setIsExpenseOpen(true)} style={{ color: 'var(--color-danger)' }}>
          <TrendingDown size={24} />
          <span>Gasto</span>
        </button>
      </nav>

      {/* Modals */}
      <Modal isOpen={isIncomeOpen} onClose={() => setIsIncomeOpen(false)} title="Registrar Ingreso">
        <TransactionForm type="INCOME" onSuccess={() => setIsIncomeOpen(false)} />
      </Modal>

      <Modal isOpen={isExpenseOpen} onClose={() => setIsExpenseOpen(false)} title="Registrar Gasto">
        <TransactionForm type="EXPENSE" onSuccess={() => setIsExpenseOpen(false)} />
      </Modal>

      <Modal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} title="Historial de Movimientos">
        <TransactionHistory onEdit={handleEdit} />
      </Modal>

      <Modal isOpen={!!editingTransaction} onClose={() => setEditingTransaction(null)} title="Editar Movimiento">
        {editingTransaction && <TransactionForm initialData={editingTransaction} type={editingTransaction.type} onSuccess={() => setEditingTransaction(null)} />}
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
