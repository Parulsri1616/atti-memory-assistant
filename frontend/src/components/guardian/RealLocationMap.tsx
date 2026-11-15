import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Navigation,
  Shield,
  Layers,
  Battery,
  Clock,
  Compass,
  AlertTriangle,
  RotateCw,
  ExternalLink,
  MapPin,
  CheckCircle2,
  Radio
} from 'lucide-react';
import { LocationLog, SafeZone } from '../../types';
import { patientTracker } from '../../services/patientTracker';

interface RealLocationMapProps {
  patientName: string;
  latestLocation: LocationLog | null;
  safeZone: SafeZone | null;
  isDark?: boolean;
  onRefresh?: () => void;
}

export const RealLocationMap: React.FC<RealLocationMapProps> = ({
  patientName,
  latestLocation,
  safeZone,
  isDark = false,
  onRefresh
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const safeZoneCircleRef = useRef<L.Circle | null>(null);
  const streetLayerRef = useRef<L.TileLayer | null>(null);
  const satelliteLayerRef = useRef<L.TileLayer | null>(null);

  const [mapType, setMapType] = useState<'street' | 'satellite'>('street');
  const [isSimulating, setIsSimulating] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Resolved coordinates
  const patientLat = latestLocation?.latitude ?? safeZone?.center_latitude ?? 28.5355;
  const patientLng = latestLocation?.longitude ?? safeZone?.center_longitude ?? 77.2100;
  const isInside = latestLocation?.is_inside_safe_zone ?? true;
  const safeZoneLat = safeZone?.center_latitude ?? 28.5355;
  const safeZoneLng = safeZone?.center_longitude ?? 77.2100;
  const safeZoneRadius = safeZone?.radius_meters ?? 500;

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [patientLat, patientLng],
        zoom: 15,
        zoomControl: false,
        attributionControl: false
      });

      // Standard OSM Tile Layer
      streetLayerRef.current = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap'
        }
      ).addTo(map);

      // Satellite Imagery (Esri World Imagery)
      satelliteLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19,
          attribution: '&copy; Esri World Imagery'
        }
      );

      // Add Zoom Control in top-right
      L.control.zoom({ position: 'topright' }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Toggle Map Type (Street vs Satellite)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !streetLayerRef.current || !satelliteLayerRef.current) return;

    if (mapType === 'satellite') {
      if (map.hasLayer(streetLayerRef.current)) {
        map.removeLayer(streetLayerRef.current);
      }
      if (!map.hasLayer(satelliteLayerRef.current)) {
        satelliteLayerRef.current.addTo(map);
      }
    } else {
      if (map.hasLayer(satelliteLayerRef.current)) {
        map.removeLayer(satelliteLayerRef.current);
      }
      if (!map.hasLayer(streetLayerRef.current)) {
        streetLayerRef.current.addTo(map);
      }
    }
  }, [mapType]);

  // Update Safe Zone Geofence Circle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (safeZoneCircleRef.current) {
      safeZoneCircleRef.current.remove();
      safeZoneCircleRef.current = null;
    }

    const circle = L.circle([safeZoneLat, safeZoneLng], {
      radius: safeZoneRadius,
      color: '#5E58E7',
      weight: 2.5,
      dashArray: '6, 8',
      fillColor: '#6366F1',
      fillOpacity: 0.12
    }).addTo(map);

    circle.bindTooltip(
      `<div class="font-bold text-xs text-indigo-900">${safeZone?.name || 'Safe Zone'} (${safeZoneRadius}m)</div>`,
      { permanent: false, direction: 'top' }
    );

    safeZoneCircleRef.current = circle;
  }, [safeZoneLat, safeZoneLng, safeZoneRadius, safeZone?.name]);

  // Update Patient Phone Marker with Custom Radar DivIcon
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }

    const statusColor = isInside ? '#10B981' : '#F43F5E';
    const statusBg = isInside ? 'bg-emerald-500' : 'bg-rose-500';
    const pulseRing = isInside ? 'rgba(16, 185, 129, 0.35)' : 'rgba(244, 63, 94, 0.45)';

    const customHtml = `
      <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
        <!-- Pulsing Radar Halo -->
        <div style="position: absolute; width: 44px; height: 44px; border-radius: 9999px; background: ${pulseRing}; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        
        <!-- Outer White Glow Border -->
        <div style="position: relative; width: 34px; height: 34px; border-radius: 12px; background: #3B36AC; border: 2.5px solid #FFFFFF; box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.4); display: flex; align-items: center; justify-content: center; color: white;">
          <!-- Inner icon -->
          <svg style="width: 18px; height: 18px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <rect width="14" height="20" x="5" y="2" rx="2" ry="2"/>
            <path d="M12 18h.01"/>
          </svg>
          <!-- Status dot -->
          <span style="position: absolute; top: -3px; right: -3px; width: 10px; height: 10px; border-radius: 9999px; background: ${statusColor}; border: 2px solid white;"></span>
        </div>
      </div>
    `;

    const customIcon = L.divIcon({
      html: customHtml,
      className: 'custom-patient-phone-marker',
      iconSize: [44, 44],
      iconAnchor: [22, 22],
      popupAnchor: [0, -22]
    });

    const marker = L.marker([patientLat, patientLng], { icon: customIcon }).addTo(map);

    const popupHtml = `
      <div style="font-family: system-ui, sans-serif; padding: 2px; min-width: 210px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
          <div style="width: 28px; height: 28px; border-radius: 8px; background: #EEF0FD; color: #3B36AC; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 11px;">
            ${patientName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div style="font-weight: 800; font-size: 13px; color: #1E293B; line-height: 1.2;">${patientName}'s Phone</div>
            <div style="font-size: 10px; font-weight: 600; color: ${isInside ? '#059669' : '#E11D48'};">
              ${isInside ? '● Inside Safe Zone' : '▲ OUTSIDE SAFE ZONE'}
            </div>
          </div>
        </div>
        <div style="font-size: 11px; color: #475569; margin-bottom: 6px; line-height: 1.3;">
          ${latestLocation?.address || '24, Green Park, New Delhi'}
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 10px; color: #64748B; border-top: 1px solid #E2E8F0; padding-top: 6px;">
          <span>GPS: ${patientLat.toFixed(4)}, ${patientLng.toFixed(4)}</span>
          <span style="font-weight: 700; color: #10B981;">${latestLocation?.battery_level || 88}% 🔋</span>
        </div>
      </div>
    `;

    marker.bindPopup(popupHtml);
    markerRef.current = marker;
  }, [patientLat, patientLng, isInside, patientName, latestLocation]);

  // Recenter on Patient
  const handleRecenterPatient = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    setIsLocating(true);
    map.flyTo([patientLat, patientLng], 16, { duration: 1.2 });
    if (markerRef.current) {
      setTimeout(() => {
        markerRef.current?.openPopup();
        setIsLocating(false);
      }, 1250);
    } else {
      setTimeout(() => setIsLocating(false), 1250);
    }
  };

  // Fit Bounds to Show Both Safe Zone and Patient
  const handleFitBounds = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const bounds = L.latLngBounds([
      [patientLat, patientLng],
      [safeZoneLat, safeZoneLng]
    ]);
    // Expand bounds by radius
    map.fitBounds(bounds.pad(0.35), { animate: true });
  };

  // Test simulation helper
  const handleSimulateOutside = async () => {
    setIsSimulating(true);
    // Offset patient ~850 meters North-East (outside 500m geofence)
    const outsideLat = safeZoneLat + 0.0075;
    const outsideLng = safeZoneLng + 0.008;
    await patientTracker.simulateLocation(
      outsideLat,
      outsideLng,
      'Near Hauz Khas Market, New Delhi (Outside Zone)',
      76
    );
    setIsSimulating(false);
    onRefresh?.();
    setTimeout(() => {
      handleFitBounds();
    }, 200);
  };

  const handleSimulateInside = async () => {
    setIsSimulating(true);
    // Back inside safe zone center
    await patientTracker.simulateLocation(
      safeZoneLat,
      safeZoneLng,
      safeZone?.address || '24, Green Park, New Delhi',
      88
    );
    setIsSimulating(false);
    onRefresh?.();
    setTimeout(() => {
      handleRecenterPatient();
    }, 200);
  };

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Real Map Canvas Container */}
      <div className="w-full h-64 sm:h-76 md:h-84 rounded-3xl overflow-hidden relative border border-slate-200/90 shadow-inner bg-slate-100 select-none">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Live Status Pill (Top Left) */}
        <div className="absolute top-3 left-3 z-[1000] flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-md">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isInside ? 'bg-emerald-400' : 'bg-rose-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isInside ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
          </span>
          <span className="text-[11px] font-extrabold text-slate-800">
            {isInside ? 'Inside Safe Zone' : 'Outside Perimeter Alert'}
          </span>
          <span className="text-[10px] font-medium text-slate-400">
            • ±{Math.round(latestLocation?.accuracy_meters || 10)}m
          </span>
        </div>

        {/* Map Type Switcher (Top Right next to zoom) */}
        <div className="absolute top-3 right-12 z-[1000] flex bg-white/95 backdrop-blur-md rounded-xl p-0.5 border border-slate-200/80 shadow-md text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setMapType('street')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              mapType === 'street'
                ? 'bg-[#5E58E7] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Street
          </button>
          <button
            type="button"
            onClick={() => setMapType('satellite')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              mapType === 'satellite'
                ? 'bg-[#5E58E7] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Satellite
          </button>
        </div>

        {/* Map Bottom Floating Controls */}
        <div className="absolute bottom-3 left-3 right-3 z-[1000] flex items-center justify-between pointer-events-none">
          {/* Quick Floating Address Pill */}
          <div className="pointer-events-auto bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-200/90 shadow-md text-xs font-bold text-slate-800 flex items-center gap-1.5 max-w-[65%] sm:max-w-[75%] truncate">
            <MapPin className="w-3.5 h-3.5 text-[#5E58E7] shrink-0" />
            <span className="truncate">{latestLocation?.address || '24, Green Park, New Delhi'}</span>
          </div>

          {/* Action Buttons */}
          <div className="pointer-events-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleFitBounds}
              title="Fit Geofence Safe Zone in View"
              className="w-8 h-8 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 flex items-center justify-center shadow-md active:scale-95 transition-transform cursor-pointer"
            >
              <Compass className="w-4 h-4 text-[#5E58E7]" />
            </button>
            <button
              type="button"
              onClick={handleRecenterPatient}
              title="Center on Patient Phone"
              className="px-3 py-1.5 rounded-xl bg-[#5E58E7] hover:bg-[#4E48D7] text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-transform cursor-pointer"
            >
              <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Center Patient</span>
            </button>
          </div>
        </div>
      </div>

      {/* Geofence Testing / Verification Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-50 border border-slate-200/70 rounded-2xl text-xs">
        <div className="flex items-center gap-2 text-slate-600 font-medium">
          <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span>Real-time GPS tracker active on {patientName}'s phone</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider hidden sm:inline">
            Test Geofence:
          </span>
          <button
            type="button"
            onClick={handleSimulateInside}
            disabled={isSimulating}
            className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-lg text-[11px] font-bold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
          >
            Inside Zone
          </button>
          <button
            type="button"
            onClick={handleSimulateOutside}
            disabled={isSimulating}
            className="px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 rounded-lg text-[11px] font-bold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
          >
            Outside Zone
          </button>
        </div>
      </div>
    </div>
  );
};
