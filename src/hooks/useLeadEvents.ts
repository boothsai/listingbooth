'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export interface LeadEventToast {
  id: string;
  token: string;
  event_type: string;
  created_at: string;
}

export function useLeadEvents() {
  const [toasts, setToasts] = useState<LeadEventToast[]>([]);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'core_logic',
          table: 'lead_events'
        },
        (payload) => {
          const newEvent = payload.new as LeadEventToast;
          // Only show 'view' or 'form_submit' events for simplicity
          if (['view', 'form_submit'].includes(newEvent.event_type)) {
            setToasts((prev) => [...prev, newEvent]);
            
            // Auto-remove toast after 5 seconds
            setTimeout(() => {
              setToasts((prev) => prev.filter((t) => t.id !== newEvent.id));
            }, 5000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, removeToast };
}
