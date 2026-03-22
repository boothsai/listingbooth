'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'vabot';
  content: string;
  timestamp: Date;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'vabot',
      content: "Hello! I'm VABOT, your personal real estate concierge from BOOTHS.AI. Looking for a specific property or want to know your home's value?",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  async function handleSend() {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Ping our Next.js backend relay which talks to core_logic.unity_messages
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.content }),
      });
      
      const data = await res.json();
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'vabot',
        content: data.reply || "I've alerted an eXp Realty agent. They will contact you shortly!",
        timestamp: new Date(),
      }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'vabot',
        content: "Oops, my processors are a bit overloaded. Please try again or use the Request Info button!",
        timestamp: new Date(),
      }]);
    } finally {
      setIsTyping(false);
    }
  }

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed', bottom: '32px', right: '32px', zIndex: 9999,
          width: '64px', height: '64px', borderRadius: '50%',
          backgroundColor: '#da291c', color: 'white',
          border: 'none', cursor: 'pointer',
          boxShadow: '0 8px 32px rgba(218,41,28,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.2s, background-color 0.2s',
          transform: isOpen ? 'scale(0.9)' : 'scale(1)',
        }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#b81e13')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#da291c')}
      >
        {isOpen ? (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed', bottom: '112px', right: '32px', zIndex: 9998,
          width: '380px', height: '600px', maxHeight: 'calc(100vh - 140px)',
          backgroundColor: '#fff', borderRadius: '16px',
          boxShadow: '0 12px 48px rgba(0,0,0,0.15)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          border: '1px solid rgba(0,0,0,0.08)',
          fontFamily: 'var(--font-inter), sans-serif',
        }}>
          {/* Header */}
          <div style={{
            padding: '20px 24px', backgroundColor: '#111', color: 'white',
            display: 'flex', alignItems: 'center', gap: '12px'
          }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#222', border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🤖</div>
            <div>
              <p style={{ margin: '0 0 2px', fontSize: '16px', fontWeight: 800 }}>VABOT Concierge</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#888', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }}></span>
                Online — Powered by BOOTHS.AI
              </p>
            </div>
          </div>

          {/* Messages Area */}
          <div style={{
            flex: 1, padding: '20px', overflowY: 'auto', backgroundColor: '#fafafa',
            display: 'flex', flexDirection: 'column', gap: '16px'
          }}>
            {messages.map((msg) => (
              <div key={msg.id} style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
              }}>
                {msg.role === 'vabot' && (
                  <p style={{ margin: '0 0 4px 4px', fontSize: '11px', fontWeight: 700, color: '#888' }}>VABOT</p>
                )}
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: msg.role === 'user' ? '#da291c' : '#fff',
                  color: msg.role === 'user' ? '#fff' : '#111',
                  borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  border: msg.role === 'user' ? 'none' : '1px solid #eaeaea',
                  fontSize: '14px', lineHeight: 1.5,
                  boxShadow: msg.role === 'user' ? '0 4px 12px rgba(218,41,28,0.2)' : '0 2px 8px rgba(0,0,0,0.02)',
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div style={{ alignSelf: 'flex-start', maxWidth: '85%' }}>
                <p style={{ margin: '0 0 4px 4px', fontSize: '11px', fontWeight: 700, color: '#888' }}>VABOT</p>
                <div style={{
                  padding: '12px 16px', backgroundColor: '#fff', borderRadius: '16px 16px 16px 4px',
                  border: '1px solid #eaeaea', display: 'flex', gap: '4px', alignItems: 'center'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ccc', animation: 'pulse 1.4s infinite ease-in-out' }}></span>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ccc', animation: 'pulse 1.4s infinite ease-in-out 0.2s' }}></span>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ccc', animation: 'pulse 1.4s infinite ease-in-out 0.4s' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{ padding: '16px', borderTop: '1px solid rgba(0,0,0,0.08)', backgroundColor: '#fff', display: 'flex', gap: '8px' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask a question..."
              style={{
                flex: 1, padding: '12px 16px', borderRadius: '100px', border: '1px solid #e5e5e5',
                fontSize: '14px', outline: 'none', backgroundColor: '#f9f9f9',
                transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = '#da291c'}
              onBlur={e => e.target.style.borderColor = '#e5e5e5'}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              style={{
                width: '44px', height: '44px', borderRadius: '50%', backgroundColor: input.trim() ? '#111' : '#e5e5e5',
                color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: input.trim() ? 'pointer' : 'default', transition: 'background-color 0.2s'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </div>
        </div>
      )}
      
      {/* Required Keyframes for typing animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0%, 100% { transform: scale(0.8); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 1; }
        }
      `}} />
    </>
  );
}
