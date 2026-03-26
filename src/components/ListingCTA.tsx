'use client';

import { useState } from 'react';
import RequestShowingModal from '@/components/RequestShowingModal';
import { createClient } from '@/lib/supabase/browser';

interface Props {
  listingKey: string;
  address: string;
  price: string;
  agentName?: string | null;
  brokerage?: string | null;
  virtualTourUrl?: string | null;
}

export default function ListingCTA({ listingKey, address, price, agentName, brokerage, virtualTourUrl }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'showing' | 'info' | 'ai'>('showing');
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const supabase = createClient();

  function openShowing() { setModalType('showing'); setModalOpen(true); }
  function openInfo() { setModalType('info'); setModalOpen(true); }
  function openAI() { setModalType('ai'); setModalOpen(true); }

  async function generateClientLink() {
    setSharing(true);
    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingKey })
      });
      const data = await response.json();
      if (data.url) {
        await navigator.clipboard.writeText(data.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSharing(false);
    }
  }

  return (
    <>
      <div style={{ background: 'white', border: '1.5px solid #eee', borderRadius: '20px', padding: '32px', boxShadow: '0 8px 32px rgba(0,0,0,0.06)', marginBottom: '16px' }}>
        <p style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: 900, color: '#111', letterSpacing: '-0.5px' }}>{price}</p>
        <p style={{ margin: '0 0 24px', fontSize: '13px', color: '#888', fontWeight: 500 }}>{address}</p>

        <button
          onClick={openShowing}
          style={{ width: '100%', padding: '16px', background: '#da291c', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 800, cursor: 'pointer', marginBottom: '12px', letterSpacing: '0.02em' }}
        >
          📅 Book a Showing
        </button>
        <button
          onClick={openAI}
          style={{ width: '100%', padding: '16px', background: '#111', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 800, cursor: 'pointer', marginBottom: '12px' }}
        >
          🤖 Talk to AI Concierge
        </button>
        <button
          onClick={openInfo}
          style={{ width: '100%', padding: '16px', background: 'white', color: '#111', border: '1.5px solid #e5e5e5', borderRadius: '10px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', marginBottom: '16px' }}
        >
          💬 Request Info
        </button>

        {/* Generate Client Link - The Collaboration Moat */}
        <button
          onClick={generateClientLink}
          disabled={sharing}
          style={{ width: '100%', padding: '16px', background: '#eef2ff', color: '#4f46e5', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 800, cursor: sharing ? 'wait' : 'pointer', transition: 'all 0.2s', marginBottom: '24px' }}
        >
          {copied ? '✅ Link Copied!' : sharing ? 'Generating...' : '🔗 Generate Client Link'}
        </button>

        {/* Agent info */}
        {agentName && (
          <div style={{ borderTop: '1px solid #f5f5f5', paddingTop: '20px' }}>
            <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Listing Agent</p>
            <p style={{ margin: '0 0 2px', fontSize: '16px', fontWeight: 700, color: '#111' }}>{agentName}</p>
            {brokerage && <p style={{ margin: 0, fontSize: '13px', color: '#888' }}>{brokerage}</p>}
          </div>
        )}

        {/* Virtual tour */}
        {virtualTourUrl && (
          <a href={virtualTourUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginTop: '16px', textAlign: 'center', color: '#da291c', fontSize: '14px', fontWeight: 700, textDecoration: 'none' }}>
            🥽 Virtual Tour →
          </a>
        )}
      </div>

      <RequestShowingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        listingKey={listingKey}
        address={address}
        price={price}
        type={modalType}
      />
    </>
  );
}
