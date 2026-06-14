import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export default function MapboxMap({ coordinates }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!MAPBOX_TOKEN || !coordinates || mapRef.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const [lng, lat] = coordinates;

    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom: 12,
    });

    new mapboxgl.Marker({ color: '#f43f5e' }).setLngLat([lng, lat]).addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [coordinates]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
        Map unavailable — MAPBOX_TOKEN not configured
      </div>
    );
  }

  if (!coordinates) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
        No location data
      </div>
    );
  }

  return <div ref={mapContainer} className="h-64 w-full rounded-lg" />;
}
