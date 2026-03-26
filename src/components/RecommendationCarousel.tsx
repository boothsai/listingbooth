// src/components/RecommendationCarousel.tsx
import React from 'react';

interface Recommendation {
  listing_key: string;
  title: string;
  price: number;
  photo_url: string;
  address: string;
}

interface Props {
  recommendations: Recommendation[];
}

export default function RecommendationCarousel({ recommendations }: Props) {
  if (!recommendations || recommendations.length === 0) return null;
  return (
    <div style={{ marginTop: '40px' }}>
      <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#111', marginBottom: '16px' }}>
        Similar Listings You Might Like
      </h2>
      <div style={{ display: 'flex', overflowX: 'auto', gap: '12px', paddingBottom: '8px' }}>
        {recommendations.map((rec) => (
          <a
            key={rec.listing_key}
            href={`/share/${rec.listing_key}`}
            style={{
              minWidth: '200px',
              border: '1px solid #eee',
              borderRadius: '12px',
              overflow: 'hidden',
              textDecoration: 'none',
              background: 'white',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            }}
          >
            <img
              src={rec.photo_url}
              alt={rec.title}
              style={{ width: '100%', height: '120px', objectFit: 'cover' }}
            />
            <div style={{ padding: '8px' }}>
              <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 700, color: '#111' }}>
                {rec.title}
              </p>
              <p style={{ margin: 0, fontSize: '13px', color: '#555' }}>{rec.address}</p>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#da291c', fontWeight: 800 }}>
                {rec.price >= 1_000_000
                  ? `$${(rec.price / 1_000_000).toFixed(2)}M`
                  : `$${rec.price.toLocaleString()}`}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
