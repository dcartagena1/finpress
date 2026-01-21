import React from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export const WelcomeModal = ({ isOpen, onStart }) => {
    if (!isOpen) return null;

    const features = [
        {
            title: "Control Total",
            description: "Registra ingresos y gastos en segundos.",
            icon: <CheckCircle2 className="text-success" size={20} />
        },
        {
            title: "Metas Claras",
            description: "Visualiza y alcanza tus objetivos de ahorro.",
            icon: <CheckCircle2 className="text-success" size={20} />
        },
        {
            title: "Seguridad",
            description: "Protege tu información con autenticación biométrica.",
            icon: <CheckCircle2 className="text-success" size={20} />
        },
        {
            title: "Perspectiva",
            description: "Analiza tu historial de movimientos detalladamente.",
            icon: <CheckCircle2 className="text-success" size={20} />
        }
    ];

    return createPortal(
        <div style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000,
            backdropFilter: 'blur(10px)', padding: '1.5rem'
        }}>
            <div className="card" style={{
                width: '100%',
                maxWidth: '600px',
                padding: '0',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.1)',
                position: 'relative'
            }}>
                <div style={{
                    width: '100%',
                    height: '240px',
                    backgroundImage: 'url("/assets/welcome_hero.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                }} />

                <div style={{ padding: '2rem' }}>
                    <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', fontWeight: '700' }}>
                            Bienvenido a <span style={{ background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>FinPress</span>
                        </h2>
                        <p className="text-secondary">Tu plataforma inteligente para el control financiero personal.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
                        {features.map((f, i) => (
                            <div key={i} style={{ display: 'flex', gap: '0.75rem' }}>
                                <div style={{ marginTop: '2px' }}>{f.icon}</div>
                                <div>
                                    <h4 style={{ fontSize: '0.95rem', marginBottom: '0.25rem' }}>{f.title}</h4>
                                    <p className="text-muted" style={{ fontSize: '0.8rem', lineHeight: '1.3' }}>{f.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={onStart}
                        className="btn btn-primary"
                        style={{ width: '100%', height: '50px', fontSize: '1.1rem', gap: '0.75rem' }}
                    >
                        Comenzar Express <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};
