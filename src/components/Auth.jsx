import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Loader2 } from 'lucide-react'

export function Auth({ onLogin }) {
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        // Attempt to sign in via Magic Link (simplest for now, or OTP)
        // Actually, user might prefer Email/Password for faster testing without email confirmation setup.
        // Let's stick to Magic Link as it's default Supabase, BUT requires email server config (default works though).
        // Better: Email/Password.

        // For this MVP, let's use Magic Link as it is safest, but if user wants password:
        // We need to know if they signed up.
        // Let's use simple Magic Link.

        const { error } = await supabase.auth.signInWithOtp({ email })

        if (error) {
            setMessage('Error: ' + error.message)
        } else {
            setMessage('¡Enlace mágico enviado! Revisa tu correo.')
        }
        setLoading(false)
    }

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-app)',
            color: 'white'
        }}>
            <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '2rem', textAlign: 'center' }}>
                <h1 style={{ marginBottom: '1rem' }}>FinPress</h1>
                <p className="text-secondary" style={{ marginBottom: '2rem' }}>Inicia sesión para sincronizar tus finanzas</p>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input
                        className="input-field"
                        type="email"
                        placeholder="tu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ width: '100%' }}
                    />
                    <button className="btn btn-primary flex-center" disabled={loading} style={{ justifyContent: 'center' }}>
                        {loading ? <Loader2 className="animate-spin" /> : 'Enviar Enlace de Acceso'}
                    </button>
                </form>
                {message && <p style={{ marginTop: '1rem', color: message.includes('Error') ? '#ef4444' : '#22c55e' }}>{message}</p>}
            </div>
        </div>
    )
}
