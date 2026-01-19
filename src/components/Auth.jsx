import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Loader2, Fingerprint, Mail, Lock, ArrowLeft } from 'lucide-react'

// Helper for translation
const translateError = (errorMsg) => {
    if (!errorMsg) return '';
    if (errorMsg.includes('Invalid login credentials')) return 'Correo o contraseña incorrectos.';
    if (errorMsg.includes('User already registered')) return 'Este correo ya está registrado.';
    if (errorMsg.includes('Rate limit')) return 'Demasiados intentos. Intenta más tarde.';
    if (errorMsg.includes('Password should be')) return 'La contraseña es muy débil (mínimo 6 caracteres).';
    if (errorMsg.includes('Signups not allowed')) return 'El registro está deshabilitado temporalmente.';
    return errorMsg;
}

export function Auth() {
    const [view, setView] = useState('LOGIN'); // 'LOGIN', 'REGISTER', 'FORGOT_PASSWORD'
    const [isLoading, setIsLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState({ text: '', type: '' })
    const [webAuthnSupported, setWebAuthnSupported] = useState(false)

    useEffect(() => {
        // Check if browser supports WebAuthn
        if (window.PublicKeyCredential) {
            setWebAuthnSupported(true)
        }
    }, [])

    const handleAuth = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setMessage({ text: '', type: '' })

        try {
            let result;
            if (view === 'REGISTER') {
                result = await supabase.auth.signUp({ email, password })
                if (result.error) throw result.error
                // If email confirmation is enabled, session might be null
                if (!result.data.session) {
                    setMessage({ text: '¡Cuenta creada! Revisa tu correo para confirmar.', type: 'success' })
                } else {
                    setMessage({ text: '¡Bienvenido!', type: 'success' })
                }
            } else if (view === 'LOGIN') {
                result = await supabase.auth.signInWithPassword({ email, password })
                if (result.error) throw result.error
            } else if (view === 'FORGOT_PASSWORD') {
                result = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: window.location.origin + '/reset-password', // Simplified redirect
                })
                if (result.error) throw result.error
                setMessage({ text: 'Se ha enviado un correo para restablecer tu contraseña.', type: 'success' })
            }
        } catch (error) {
            setMessage({ text: translateError(error.message), type: 'error' })
        } finally {
            setIsLoading(false)
        }
    }

    const handleBiometricLogin = async () => {
        try {
            setIsLoading(true)
            const { data, error } = await supabase.auth.signInWithWebAuthn({ email })
            if (error) throw error
        } catch (error) {
            // Often "The user cancelled the operation" or "Not allowed"
            setMessage({ text: 'No se pudo iniciar con Face ID. Intenta con contraseña.', type: 'error' })
            console.error(error)
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
            <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '2.5rem', textAlign: 'center', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>

                {view === 'FORGOT_PASSWORD' && (
                    <button onClick={() => { setView('LOGIN'); setMessage({ text: '', type: '' }); }} style={{ position: 'absolute', top: '20px', left: '20px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                        <ArrowLeft size={24} />
                    </button>
                )}

                <div style={{ marginBottom: '2rem' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        background: 'var(--grad-primary)',
                        borderRadius: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem auto',
                        boxShadow: '0 0 30px rgba(59, 130, 246, 0.3)'
                    }}>
                        <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>F</span>
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '700', letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
                        {view === 'REGISTER' ? 'Crear Cuenta' : view === 'FORGOT_PASSWORD' ? 'Recuperar Clave' : 'FinPress'}
                    </h1>
                    <p className="text-secondary" style={{ fontSize: '0.95rem' }}>
                        {view === 'REGISTER' ? 'Comienza tu control financiero' : view === 'FORGOT_PASSWORD' ? 'Ingresa tu correo para continuar' : 'Tu bóveda financiera personal'}
                    </p>
                </div>

                <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="input-group" style={{ position: 'relative' }}>
                        <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            className="input-field"
                            type="email"
                            placeholder="Correo electrónico"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{ width: '100%', paddingLeft: '48px', height: '50px', fontSize: '1rem' }}
                        />
                    </div>

                    {view !== 'FORGOT_PASSWORD' && (
                        <div className="input-group" style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                className="input-field"
                                type="password"
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                style={{ width: '100%', paddingLeft: '48px', height: '50px', fontSize: '1rem' }}
                            />
                        </div>
                    )}

                    <button className="btn btn-primary flex-center" disabled={isLoading} style={{ justifyContent: 'center', height: '50px', marginTop: '0.5rem', fontSize: '1rem', fontWeight: '600' }}>
                        {isLoading ? <Loader2 className="animate-spin" /> : (
                            view === 'REGISTER' ? 'Registrarse' : view === 'FORGOT_PASSWORD' ? 'Enviar Correo' : 'Iniciar Sesión'
                        )}
                    </button>
                </form>

                {view === 'LOGIN' && (
                    <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                        <button
                            type="button"
                            onClick={() => { setView('FORGOT_PASSWORD'); setMessage({ text: '', type: '' }); }}
                            className="text-secondary"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
                        >
                            ¿Olvidaste tu contraseña?
                        </button>
                    </div>
                )}

                {/* Biometric Button - Only if supported and safely handled */}
                {view === 'LOGIN' && webAuthnSupported && (
                    <>
                        <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', flex: 1 }}></div>
                            <span className="text-secondary" style={{ fontSize: '0.8rem' }}>O</span>
                            <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', flex: 1 }}></div>
                        </div>

                        <button
                            type="button"
                            onClick={handleBiometricLogin}
                            disabled={!email}
                            className="btn btn-secondary flex-center"
                            style={{ width: '100%', justifyContent: 'center', gap: '0.5rem', height: '50px', fontSize: '0.95rem' }}
                            title={!email ? 'Ingresa tu correo primero' : 'Iniciar con Face ID'}
                        >
                            <Fingerprint size={20} />
                            <span>Face ID / Passkey</span>
                        </button>
                    </>
                )}

                {message.text && (
                    <div style={{
                        marginTop: '1.5rem',
                        padding: '1rem',
                        borderRadius: '12px',
                        background: message.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                        color: message.type === 'error' ? '#ef4444' : '#22c55e',
                        fontSize: '0.9rem',
                        border: message.type === 'error' ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(34, 197, 94, 0.2)'
                    }}>
                        {message.text}
                    </div>
                )}

                <div style={{ marginTop: '2.5rem' }}>
                    <button
                        className="text-secondary"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--primary)' }}
                        onClick={() => {
                            setView(view === 'LOGIN' ? 'REGISTER' : 'LOGIN');
                            setMessage({ text: '', type: '' });
                        }}
                    >
                        {view === 'LOGIN' ? (
                            <span>¿No tienes cuenta? <strong style={{ color: 'white' }}>Regístrate</strong></span>
                        ) : view === 'REGISTER' ? (
                            <span>¿Ya tienes cuenta? <strong style={{ color: 'white' }}>Inicia Sesión</strong></span>
                        ) : null}
                    </button>
                </div>
            </div>
        </div>
    )
}
