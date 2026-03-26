'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { MapPin } from 'lucide-react';

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
  onListingClick?: (listing: ListingMarker) => void;
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

export default function DynamicMap({ onStatsUpdate, city, onListingClick }: DynamicMapProps) {
  const [listings, setListings] = useState<ListingMarker[]>([]);

  const formatPrice = (n: number) => {
    if (n >= 1000000) return `$${(n / 1000000).toFixed(2)}M`;
    return `$${Math.round(n / 1000)}K`;
  };

  // Default coordinate center (Ottawa)
  const defaultCenter: [number, number] = [45.4215, -75.6972];

  const getPricePill = (price: number, isVowLocked: boolean) => {
    const displayPrice = isVowLocked ? "$850K" : formatPrice(price);
    const blurStyle = isVowLocked ? "filter: blur(2px);" : "";
    return L.divIcon({
      html: `<div style="background: #111; color: white; padding: 4px 10px; border-radius: 20px; font-weight: 800; font-size: 13px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2px solid white; white-space: nowrap; transition: all 0.2s; ${blurStyle}">${displayPrice}</div>`,
      className: 'custom-leaflet-pill',
      iconSize: [60, 24],
      iconAnchor: [30, 24],
    });
  };

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
          <Marker 
            key={l.listing_key} 
            position={[l.latitude, l.longitude]} 
            icon={getPricePill(l.list_price, !!l._vow_locked)}
            eventHandlers={{
              click: () => {
                if (onListingClick) onListingClick(l);
              }
            }}
          />
        ))}
      </MapContainer>
      
      {/* Required CSS to override default Leaflet popup styles to make it premium */}
      <style dangerouslySetInnerHTML={{__html: `
        .leaflet-popup-content-wrapper { padding: 0; border-radius: 8px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.15); border: 1px solid #eee; }
        .leaflet-popup-content { margin: 0; width: 220px !important; }
        .leaflet-container a.leaflet-popup-close-button { color: white; right: 4px; top: 4px; text-shadow: 0 1px 4px rgba(0,0,0,0.5); }
        .custom-leaflet-pill { display: flex; align-items: center; justify-content: center; background: none; border: none; z-index: 500 !important; }
        .custom-leaflet-pill:hover div { transform: scale(1.1); background: #da291c !important; }
      `}} />
    </div>
  );
}
