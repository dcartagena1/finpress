import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

export const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return createPortal(
        <div style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 9999,
            backdropFilter: 'blur(4px)', padding: '1rem', overflowY: 'auto'
        }}>
            <div className="card" style={{
                width: '100%',
                maxWidth: '500px',
                marginTop: '2rem',
                marginBottom: '5rem', // Extra space for mobile nav
                height: 'auto',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{title}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)' }}>
                        <X size={24} />
                    </button>
                </div>
                <div style={{ flex: 1 }}>
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};


