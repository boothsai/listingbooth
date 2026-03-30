'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { MapContainer, TileLayer, Marker, CircleMarker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { ListingMarker, Filters } from './MapExplorer';

interface ExplorerMapProps {
  center: [number, number];
  zoom: number;
  listings: ListingMarker[];
  selectedKey: string | null;
  onMarkerClick: (key: string) => void;
  onBoundsChange: (bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }) => void;
  filters: Filters;
}

function getTypeColor(type: string): string {
  const t = (type || '').toLowerCase();
  if (t.includes('condo') || t.includes('apartment')) return '#8b5cf6';
  if (t.includes('town')) return '#3b82f6';
  if (t.includes('semi')) return '#f97316';
  return '#06b6d4';
}

function formatPriceShort(n: number) {
  if (!n) return '—';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  return `$${Math.round(n / 1000)}K`;
}

function createPricePill(price: number, type: string, isSelected: boolean) {
  const color = getTypeColor(type);
  const bg = isSelected ? '#da291c' : '#111';
  const displayPrice = formatPriceShort(price);
  const scale = isSelected ? 'transform: scale(1.15);' : '';
  const glow = isSelected ? `box-shadow: 0 0 0 3px rgba(218,41,28,0.3), 0 4px 12px rgba(0,0,0,0.3);` : `box-shadow: 0 2px 8px rgba(0,0,0,0.25);`;
  
  return L.divIcon({
    html: `<div style="
      background: ${bg}; color: white; padding: 4px 10px; border-radius: 20px; 
      font-weight: 800; font-size: 12px; white-space: nowrap;
      border: 2px solid white; border-left: 3px solid ${color};
      ${glow} ${scale} transition: all 0.2s;
      cursor: pointer; user-select: none;
    ">${displayPrice}</div>`,
    className: 'explorer-price-pill',
    iconSize: [70, 28],
    iconAnchor: [35, 28],
  });
}

// Component that syncs map center/zoom when city changes
function MapSync({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  const prevCenter = useRef(center);

  useEffect(() => {
    if (prevCenter.current[0] !== center[0] || prevCenter.current[1] !== center[1]) {
      map.flyTo(center, zoom, { duration: 1.2 });
      prevCenter.current = center;
    }
  }, [center, zoom, map]);

  return null;
}

// Component that handles bounds change events
function BoundsWatcher({ onBoundsChange, filters }: { onBoundsChange: ExplorerMapProps['onBoundsChange']; filters: Filters }) {
  const map = useMapEvents({
    moveend() { emitBounds(); },
    zoomend() { emitBounds(); },
  });

  const timeoutRef = useRef<NodeJS.Timeout>();

  const emitBounds = useCallback(() => {
    // Debounce to prevent rapid-fire API calls during pan
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      const b = map.getBounds();
      onBoundsChange({
        minLat: b.getSouth(),
        maxLat: b.getNorth(),
        minLng: b.getWest(),
        maxLng: b.getEast(),
      });
    }, 300);
  }, [map, onBoundsChange]);

  // Re-fetch when filters change
  useEffect(() => {
    emitBounds();
  }, [filters, emitBounds]);

  // Initial fetch
  useEffect(() => {
    emitBounds();
  }, []);

  return null;
}

function ZoomTracker({ onZoom }: { onZoom: (z: number) => void }) {
  const map = useMapEvents({
    zoomend() { onZoom(map.getZoom()); },
  });
  // Initialize on mount
  useEffect(() => { onZoom(map.getZoom()); }, [map, onZoom]);
  return null;
}

export default function ExplorerMap({ center, zoom, listings, selectedKey, onMarkerClick, onBoundsChange, filters }: ExplorerMapProps) {
  const [currentZoom, setCurrentZoom] = useState(zoom);

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        attributionControl={false}
        zoomControl={false}
      >
        {/* Premium Carto Voyager Tiles — neutral, clean, professional */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
        />

        <MapSync center={center} zoom={zoom} />
        <BoundsWatcher onBoundsChange={onBoundsChange} filters={filters} />
        <ZoomTracker onZoom={setCurrentZoom} />

        {/* Listing markers conditionally rendered based on zoom */}
        {listings.map(l => {
          const isSelected = l.listing_key === selectedKey;
          
          // Heatmap Mode (< 13): Compounding overlapping red zones
          if (currentZoom < 13 && !isSelected) {
            return (
              <CircleMarker
                key={l.listing_key}
                center={[l.latitude, l.longitude]}
                radius={8}
                fillColor="#da291c"
                color="transparent"
                fillOpacity={0.35}
                eventHandlers={{ click: () => onMarkerClick(l.listing_key) }}
              />
            );
          }
          
          // Dot Mode (< 15): Color-coded by property type
          if (currentZoom < 15 && !isSelected) {
            return (
              <CircleMarker
                key={l.listing_key}
                center={[l.latitude, l.longitude]}
                radius={6}
                fillColor={getTypeColor(l.property_type)}
                color="white"
                weight={1.5}
                fillOpacity={0.9}
                eventHandlers={{ click: () => onMarkerClick(l.listing_key) }}
              />
            );
          }

          // Price Pill Mode (>= 15 or selected)
          return (
            <Marker
              key={l.listing_key}
              position={[l.latitude, l.longitude]}
              icon={createPricePill(l.list_price, l.property_type, isSelected)}
              eventHandlers={{ click: () => onMarkerClick(l.listing_key) }}
              zIndexOffset={isSelected ? 1000 : 0}
            />
          );
        })}
      </MapContainer>

      {/* Zoom controls — custom positioned */}
      <div style={{
        position: 'absolute', top: 16, right: 16, zIndex: 1000,
        display: 'flex', flexDirection: 'column', gap: 2,
        background: 'white', borderRadius: 8, boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
        overflow: 'hidden',
      }}>
        <button
          id="map-zoom-in"
          onClick={() => {
            const container = document.querySelector('.leaflet-container') as any;
            if (container?._leaflet_id) {
              const map = (window as any).L?.map?.(container);
              // Use the leaflet internal reference
            }
          }}
          style={{ width: 36, height: 36, border: 'none', background: 'white', cursor: 'pointer', fontSize: 18, fontWeight: 700, color: '#333', borderBottom: '1px solid #eee' }}
        >+</button>
        <button
          id="map-zoom-out"
          style={{ width: 36, height: 36, border: 'none', background: 'white', cursor: 'pointer', fontSize: 18, fontWeight: 700, color: '#333' }}
        >−</button>
      </div>

      {/* Required CSS overrides */}
      <style dangerouslySetInnerHTML={{__html: `
        .explorer-price-pill { 
          display: flex; align-items: center; justify-content: center; 
          background: none; border: none; z-index: 500 !important; 
        }
        .explorer-price-pill:hover div { 
          transform: scale(1.1) !important; 
          background: #da291c !important; 
        }
        .leaflet-control-zoom { display: none; }
      `}} />
    </div>
  );
}
