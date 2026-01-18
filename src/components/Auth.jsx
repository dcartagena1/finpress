```
import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Loader2, Fingerprint, Mail, Lock } from 'lucide-react'

export function Auth() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false) // Toggle between Login/Register
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState({ text: '', type: '' })

  const handleAuth = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage({ text: '', type: '' })

    try {
        let result;
        if (isSignUp) {
            result = await supabase.auth.signUp({ email, password })
        } else {
            result = await supabase.auth.signInWithPassword({ email, password })
        }

        const { error, data } = result;

        if (error) throw error

        if (isSignUp && !data.session) {
            setMessage({ text: '¡Cuenta creada! Por favor verifica tu correo para continuar.', type: 'success' })
        }
    } catch (error) {
        setMessage({ text: error.message, type: 'error' })
    } finally {
        setIsLoading(false)
    }
  }

  const handleBiometricLogin = async () => {
      // NOTE: User must have registered a passkey first in settings.
      // This button attempts to sign in with an existing passkey.
      try {
          setIsLoading(true)
          const { data, error } = await supabase.auth.signInWithWebAuthn({ email })
          if (error) throw error
      } catch(error) {
           setMessage({ text: 'Error Face ID: ' + error.message, type: 'error' })
      } finally {
          setIsLoading(false)
      }
  }

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'var(--bg-app)',
      color: 'white',
      padding: '1rem'
    }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '2rem', textAlign: 'center', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ marginBottom: '2rem' }}>
             <div style={{ 
                width: '60px', 
                height: '60px', 
                background: 'var(--grad-primary)', 
                borderRadius: '16px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto 1rem auto',
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)'
            }}>
                <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>F</span>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '600' }}>FinPress</h1>
            <p className="text-secondary">{isSignUp ? 'Crea tu cuenta profesional' : 'Bienvenido de nuevo'}</p>
        </div>
        
        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="input-group" style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}/>
              <input
                className="input-field"
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%', paddingLeft: '40px' }}
              />
          </div>
          
          <div className="input-group" style={{ position: 'relative' }}>
               <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}/>
              <input
                className="input-field"
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                style={{ width: '100%', paddingLeft: '40px' }}
              />
          </div>

          <button className="btn btn-primary flex-center" disabled={isLoading} style={{ justifyContent: 'center', height: '44px', marginTop: '0.5rem' }}>
            {isLoading ? <Loader2 className="animate-spin" /> : (isSignUp ? 'Registrarse' : 'Iniciar Sesión')}
          </button>
        </form>

        <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', flex: 1 }}></div>
            <span className="text-secondary" style={{ fontSize: '0.8rem' }}>O continúa con</span>
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', flex: 1 }}></div>
        </div>

        <button 
            type="button"
            onClick={handleBiometricLogin}
            disabled={!email} 
            className="btn btn-secondary flex-center" 
            style={{ width: '100%', justifyContent: 'center', gap: '0.5rem', height: '44px' }}
            title={!email ? 'Ingresa tu correo primero' : 'Iniciar con Face ID'}
        >
            <Fingerprint size={20} />
            <span>Face ID / Passkey</span>
        </button>

        {message.text && (
            <div style={{ 
                marginTop: '1.5rem', 
                padding: '0.75rem', 
                borderRadius: '8px', 
                background: message.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)', 
                color: message.type === 'error' ? '#ef4444' : '#22c55e',
                fontSize: '0.9rem'
            }}>
                {message.text}
            </div>
        )}

        <div style={{ marginTop: '2rem' }}>
            <button 
                className="text-secondary" 
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline' }}
                onClick={() => { setIsSignUp(!isSignUp); setMessage({text:'', type:''}); }}
            >
                {isSignUp ? '¿Ya tienes cuenta? Inicia Sesión' : '¿No tienes cuenta? Regístrate'}
            </button>
        </div>
      </div>
    </div>
  )
}
```
