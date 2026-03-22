'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';

// Create a custom modern red map pin icon
const customIcon = L.divIcon({
  html: renderToStaticMarkup(<MapPin color="#da291c" fill="white" size={32} />),
  className: 'custom-leaflet-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

interface Bounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

interface ListingMarker {
  listing_key: string;
  latitude: number;
  longitude: number;
  list_price: number;
  sold_price: number | null;
  property_type: string;
  bedrooms_total: number;
  bathrooms_total: number;
  photo_urls: string[];
  address_street: string;
  listing_status: string;
  _vow_locked?: boolean;
}

interface DynamicMapProps {
  onStatsUpdate: (count: number) => void;
  city: string;
}

function BoundsFetcher({ setListings, onStatsUpdate, city }: { setListings: any, onStatsUpdate: any, city: string }) {
  const map = useMapEvents({
    moveend() {
      fetchListings();
    },
    zoomend() {
      fetchListings();
    }
  });

  const fetchListings = async () => {
    const bounds = map.getBounds();
    const payload = {
      minLat: bounds.getSouth(),
      maxLat: bounds.getNorth(),
      minLng: bounds.getWest(),
      maxLng: bounds.getEast(),
      cityFilter: city === 'All' ? null : city
    };

    try {
      const res = await fetch('/api/listings/bounds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.results) {
        setListings(data.results);
        onStatsUpdate(data.count);
      }
    } catch (err) {
      console.error('Failed to fetch bounds map data:', err);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchListings();
  }, [city]);

  return null;
}

export default function DynamicMap({ onStatsUpdate, city }: DynamicMapProps) {
  const [listings, setListings] = useState<ListingMarker[]>([]);

  const formatPrice = (n: number) => {
    if (n >= 1000000) return `$${(n / 1000000).toFixed(2)}M`;
    return `$${Math.round(n / 1000)}K`;
  };

  // Default coordinate center (Ottawa)
  const defaultCenter: [number, number] = [45.4215, -75.6972];

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <MapContainer 
        center={defaultCenter} 
        zoom={13} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%' }}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <BoundsFetcher setListings={setListings} onStatsUpdate={onStatsUpdate} city={city} />

        {listings.map(l => (
          <Marker key={l.listing_key} position={[l.latitude, l.longitude]} icon={customIcon}>
            <Popup className="premium-popup">
              <div style={{ width: '220px', padding: '0' }}>
                {l.photo_urls && l.photo_urls[0] && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={l.photo_urls[0]} alt="Property" style={{ width: '100%', height: '120px', objectFit: 'cover', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }} />
                )}
                <div style={{ padding: '12px' }}>
                  {l._vow_locked ? (
                    <p style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 900, color: '#111', filter: 'blur(4px)' }}>$850,000</p>
                  ) : (
                    <p style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 900, color: '#111' }}>
                      {l.sold_price ? <><span style={{color: '#22c55e'}}>SOLD</span> {formatPrice(l.sold_price)}</> : formatPrice(l.list_price)}
                    </p>
                  )}
                  <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#555', fontWeight: 600 }}>
                    {l.bedrooms_total} bd | {l.bathrooms_total} ba | {l.property_type}
                  </p>
                  <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {l.address_street}
                  </p>
                  
                  {l._vow_locked ? (
                    <a href="/?auth=1" style={{ display: 'block', textAlign: 'center', background: '#111', color: 'white', textDecoration: 'none', padding: '8px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
                      Unlock Sold Data
                    </a>
                  ) : (
                    <Link href={`/listing/${l.listing_key}`} style={{ display: 'block', textAlign: 'center', background: '#da291c', color: 'white', textDecoration: 'none', padding: '8px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
                      View Details
                    </Link>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Required CSS to override default Leaflet popup styles to make it premium */}
      <style dangerouslySetInnerHTML={{__html: `
        .leaflet-popup-content-wrapper { padding: 0; border-radius: 8px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.15); border: 1px solid #eee; }
        .leaflet-popup-content { margin: 0; width: 220px !important; }
        .leaflet-container a.leaflet-popup-close-button { color: white; right: 4px; top: 4px; text-shadow: 0 1px 4px rgba(0,0,0,0.5); }
        .custom-leaflet-icon { display: flex; align-items: center; justify-content: center; background: none; border: none; }
      `}} />
    </div>
  );
}
