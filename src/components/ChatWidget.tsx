'use client';

import { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'vabot';
  text: string;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: 'welcome',
    sender: 'vabot',
    text: "Hi, I'm the ListingBooth Concierge. Tell me what kind of property you're looking for, or drop an MLS number to set up a private showing."
  }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isOpen]);

  async function handleSend(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput('');
    
    // Add User Message
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      
      // Artificial delay to make it feel extremely responsive and "human" (0.8s)
      setTimeout(() => {
        setIsTyping(false);
        if (data.reply) {
          setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'vabot', text: data.reply }]);
        } else {
          setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'vabot', text: "I'm having trouble connecting to the network right now. Please try again in a moment." }]);
        }
      }, 800);
      
      } catch (err) {
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'vabot', text: "It seems my link to the indexing mothership is temporarily down. Can you try again?" }]);
      }, 800);
    }
  }

  return (
    <>
      <div 
        style={{
          position: 'fixed',
          bottom: '32px',
          right: '32px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end'
        }}
      >
        {/* Chat Window */}
        {isOpen && (
          <div 
            style={{
              width: '380px',
              height: '560px',
              maxHeight: 'calc(100vh - 120px)',
              backgroundColor: 'rgba(255, 255, 255, 0.96)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              borderRadius: '24px',
              boxShadow: '0 24px 64px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)',
              marginBottom: '20px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              animation: 'vabotSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              transformOrigin: 'bottom right'
            }}
          >
            {/* Header */}
            <div style={{ padding: '20px 24px', backgroundColor: '#111', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#da291c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', boxShadow: '0 4px 12px rgba(218,41,28,0.4)' }}>🛎️</div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, letterSpacing: '0.02em' }}>ListingBooth Concierge</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
                    <span style={{ fontSize: '11px', color: '#aaa', fontWeight: 600 }}>Semantic AI Active</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: '6px', transition: 'color 0.2s', display: 'flex' }}
                onMouseEnter={e => e.currentTarget.style.color = 'white'}
                onMouseLeave={e => e.currentTarget.style.color = '#888'}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.02))' }}>
              <div style={{ textAlign: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#aaa', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Chat Secured by eXp Realty</span>
              </div>
              {messages.map((msg) => (
                <div key={msg.id} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '85%',
                    padding: '14px 18px',
                    borderRadius: msg.sender === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                    backgroundColor: msg.sender === 'user' ? '#da291c' : '#f4f4f4',
                    color: msg.sender === 'user' ? 'white' : '#111',
                    fontSize: '14.5px',
                    lineHeight: 1.5,
                    fontWeight: 500,
                    boxShadow: msg.sender === 'user' ? '0 8px 24px rgba(218,41,28,0.25)' : 'none',
                    border: msg.sender === 'user' ? 'none' : '1px solid rgba(0,0,0,0.04)',
                    fontFamily: 'var(--font-inter), sans-serif'
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{ padding: '16px 20px', borderRadius: '20px 20px 20px 4px', backgroundColor: '#f4f4f4', display: 'flex', gap: '6px', border: '1px solid rgba(0,0,0,0.04)' }}>
                    <div className="typing-dot" style={{ width: '6px', height: '6px', backgroundColor: '#aaa', borderRadius: '50%', animation: 'typingBounce 1.4s infinite ease-in-out both' }} />
                    <div className="typing-dot" style={{ width: '6px', height: '6px', backgroundColor: '#aaa', borderRadius: '50%', animation: 'typingBounce 1.4s infinite ease-in-out both', animationDelay: '0.15s' }} />
                    <div className="typing-dot" style={{ width: '6px', height: '6px', backgroundColor: '#aaa', borderRadius: '50%', animation: 'typingBounce 1.4s infinite ease-in-out both', animationDelay: '0.3s' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} style={{ padding: '20px', borderTop: '1px solid rgba(0,0,0,0.06)', backgroundColor: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f5f5f5', padding: '6px 6px 6px 20px', borderRadius: '100px', border: '1px solid #eaeaea', transition: 'border-color 0.2s' }}>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask ListingBooth Concierge anything..."
                  style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: '15px', fontWeight: 500, color: '#111', fontFamily: 'var(--font-inter), sans-serif' }}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    backgroundColor: input.trim() ? '#111' : '#ccc', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: 'none', cursor: input.trim() ? 'pointer' : 'default',
                    transition: 'all 0.2s',
                    boxShadow: input.trim() ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* FAB Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: '64px',
            height: '64px',
            borderRadius: isOpen ? '50%' : '20px',
            backgroundColor: isOpen ? '#111' : '#111',
            color: 'white',
            border: isOpen ? 'none' : '1px solid rgba(255,255,255,0.1)',
            boxShadow: isOpen ? '0 12px 32px rgba(0,0,0,0.2)' : '0 16px 32px rgba(0,0,0,0.24), 0 0 0 1px rgba(0,0,0,0.05)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: isOpen ? 'inherit' : '28px',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            transform: isOpen ? 'scale(0.95)' : 'scale(1)',
          }}
          onMouseEnter={e => {
            if (!isOpen) {
              e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)';
              e.currentTarget.style.boxShadow = '0 24px 48px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.05)';
            }
          }}
          onMouseLeave={e => {
            if (!isOpen) {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 16px 32px rgba(0,0,0,0.24), 0 0 0 1px rgba(0,0,0,0.05)';
            }
          }}
          aria-label="Toggle VABOT Chat"
        >
          {isOpen ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          ) : (
            '🛎️'
          )}
        </button>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes vabotSlideUp {
          0% { opacity: 0; transform: scale(0.95) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes typingBounce {
          0%, 80%, 100% { transform: translateY(0) scale(1); opacity: 0.6; }
          40% { transform: translateY(-4px) scale(1.1); opacity: 1; }
        }
      `}} />
    </>
  );
}
