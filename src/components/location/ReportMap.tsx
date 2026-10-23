import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const OUAGA: [number, number] = [12.3714, -1.5197];

interface Props {
  latitude: number | null;
  longitude: number | null;
  onMove: (lat: number, lng: number) => void;
}

const ReportMap: React.FC<Props> = ({ latitude, longitude, onMove }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onMoveRef = useRef(onMove);
  onMoveRef.current = onMove;

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const start: [number, number] = latitude && longitude ? [latitude, longitude] : OUAGA;
    const map = L.map(ref.current).setView(start, latitude ? 17 : 12);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap', maxZoom: 19 }).addTo(map);
    const icon = L.divIcon({
      className: '',
      html: '<div style="width:22px;height:22px;border-radius:9999px;background:hsl(var(--primary));border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,.4)"></div>',
      iconSize: [22, 22], iconAnchor: [11, 11],
    });
    const marker = L.marker(start, { draggable: true, icon }).addTo(map);
    marker.on('drag', () => { const p = marker.getLatLng(); onMoveRef.current(p.lat, p.lng); });
    map.on('click', (e: L.LeafletMouseEvent) => { marker.setLatLng(e.latlng); onMoveRef.current(e.latlng.lat, e.latlng.lng); });
    mapRef.current = map; markerRef.current = marker;
    setTimeout(() => map.invalidateSize(), 150);
    return () => { map.remove(); mapRef.current = null; markerRef.current = null; };
  }, []);

  useEffect(() => {
    if (latitude == null || longitude == null || !markerRef.current || !mapRef.current) return;
    const cur = markerRef.current.getLatLng();
    if (Math.abs(cur.lat - latitude) > 1e-7 || Math.abs(cur.lng - longitude) > 1e-7) {
      markerRef.current.setLatLng([latitude, longitude]);
      mapRef.current.setView([latitude, longitude], 17);
    }
  }, [latitude, longitude]);

  return <div ref={ref} className="h-64 w-full rounded-lg overflow-hidden border bg-muted z-0" />;
};

export default ReportMap;
