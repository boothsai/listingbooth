'use client';

import { useLeadEvents } from '@/hooks/useLeadEvents';

export default function LeadToast() {
  const { toasts, removeToast } = useLeadEvents();

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      zIndex: 9999
    }}>
      {toasts.map((t) => (
        <div 
          key={t.id}
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0,0,0,0.05)',
            borderRadius: '16px',
            padding: '16px 20px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px',
            width: '320px',
            animation: 'slideIn 0.3s ease-out forwards',
            position: 'relative'
          }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: t.event_type === 'view' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
            color: t.event_type === 'view' ? '#3b82f6' : '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px'
          }}>
            {t.event_type === 'view' ? '👀' : '📝'}
          </div>
          
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 800, color: '#111' }}>
              {t.event_type === 'view' ? 'New Property View' : 'New Lead Capture'}
            </h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#666', lineHeight: 1.4 }}>
              Someone just {t.event_type === 'view' ? 'opened' : 'submitted a form on'} your magic link.
            </p>
            <div style={{ marginTop: '8px', fontSize: '11px', color: '#999', fontFamily: 'monospace' }}>
              Token: {t.token.slice(0,8)}...
            </div>
          </div>
          
          <button 
            onClick={() => removeToast(t.id)}
            style={{
              background: 'none',
              border: 'none',
              color: '#999',
              cursor: 'pointer',
              padding: '4px',
              fontSize: '16px'
            }}
          >
            ×
          </button>
        </div>
      ))}
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
