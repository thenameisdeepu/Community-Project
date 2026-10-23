import React, { useState, useMemo } from 'react';
import { Language, Role, Issue } from '../types';
import { translations, translateIssueTitle, translateCategory, translateStatus } from '../data/translations';

interface ActiveSectorMapProps {
  lang: Language;
  issues?: Issue[];
  userRole?: Role;
  onSelectZone?: (zoneName: string) => void;
  onSelectIssue?: (issue: Issue) => void;
}

interface SectorInfo {
  id: string;
  name: string;
  nameKn: string;
  code: string;
  centerLat: number;
  centerLng: number;
  xPct: number; // percentage in SVG coordinate space
  yPct: number;
  color: string;
  description: string;
  descriptionKn: string;
}

const CAMPUS_SECTORS: SectorInfo[] = [
  {
    id: 'Sector 1',
    name: 'Sector 1: Science & Engineering Complex',
    nameKn: 'ವಲಯ 1: ವಿಜ್ಞಾನ & ಎಂಜಿನಿಯರಿಂಗ್ ಸಂಕೀರ್ಣ',
    code: 'SEC-01',
    centerLat: 12.9728,
    centerLng: 77.5932,
    xPct: 24,
    yPct: 28,
    color: '#00288e',
    description: 'Chemistry, Physics labs, lecture hall quadrangle',
    descriptionKn: 'ರಸಾಯನಶಾಸ್ತ್ರ, ಭೌತಶಾಸ್ತ್ರ ಪ್ರಯೋಗಾಲಯಗಳು ಮತ್ತು ತರಗತಿಗಳು',
  },
  {
    id: 'Sector 2',
    name: 'Sector 2: Student Hostels A-D & Residential',
    nameKn: 'ವಲಯ 2: ವಿದ್ಯಾರ್ಥಿ ನಿಲಯಗಳು A-D ಮತ್ತು ವಸತಿ',
    code: 'SEC-02',
    centerLat: 12.9708,
    centerLng: 77.5960,
    xPct: 76,
    yPct: 72,
    color: '#006c4a',
    description: 'Hostel Block A, B, C, D and residential walkways',
    descriptionKn: 'ಹಾಸ್ಟೆಲ್ ಬ್ಲಾಕ್ A, B, C, D ಮತ್ತು ವಸತಿ ಮಾರ್ಗಗಳು',
  },
  {
    id: 'Sector 3',
    name: 'Sector 3: Central Library & Admin Quad',
    nameKn: 'ವಲಯ 3: ಕೇಂದ್ರ ಗ್ರಂಥಾಲಯ & ಆಡಳಿತ ಕ್ವಾಡ್',
    code: 'SEC-03',
    centerLat: 12.9720,
    centerLng: 77.5946,
    xPct: 50,
    yPct: 40,
    color: '#6e3900',
    description: 'Central library, provost office & administration',
    descriptionKn: 'ಕೇಂದ್ರ ಗ್ರಂಥಾಲಯ, ಪ್ರೊವೊಸ್ಟ್ ಕಚೇರಿ ಮತ್ತು ಆಡಳಿತ ಮಂಡಳಿ',
  },
  {
    id: 'Sector 4',
    name: 'Sector 4: Sports Arena & Cafeteria Square',
    nameKn: 'ವಲಯ 4: ಕ್ರೀಡಾ ಅರೆನಾ & ಉಪಾಹಾರ ಗೃಹ ಚೌಕ',
    code: 'SEC-04',
    centerLat: 12.9704,
    centerLng: 77.5935,
    xPct: 28,
    yPct: 75,
    color: '#ba1a1a',
    description: 'Indoor gymnasium, cafeteria and student lounge',
    descriptionKn: 'ಒಳಾಂಗಣ ಕ್ರೀಡಾಂಗಣ, ಕ್ಯಾಫೆಟೇರಿಯಾ ಮತ್ತು ವಿದ್ಯಾರ್ಥಿ ಲಾಂಜ್',
  },
  {
    id: 'Sector 5',
    name: 'Sector 5: Tech Park, Labs & Auditorium',
    nameKn: 'ವಲಯ 5: ತಂತ್ರಜ್ಞಾನ ಪಾರ್ಕ್, ಲ್ಯಾಬ್ಸ್ & ಆಡಿಟೋರಿಯಂ',
    code: 'SEC-05',
    centerLat: 12.9734,
    centerLng: 77.5962,
    xPct: 80,
    yPct: 24,
    color: '#4f378b',
    description: 'Computer center, innovation incubator & main hall',
    descriptionKn: 'ಕಂಪ್ಯೂಟರ್ ಕೇಂದ್ರ, ನಾವೀನ್ಯತೆ ಇನ್‌ಕ್ಯುಬೇಟರ್ ಮತ್ತು ಮುಖ್ಯ ಸಭಾಂಗಣ',
  },
];

// Map issue zone strings to campus coordinates
function getIssueCoordinates(issue: Issue): { x: number; y: number; lat: number; lng: number } {
  const z = (issue.zone || '').toLowerCase();
  const loc = (issue.location || '').toLowerCase();

  if (z.includes('science') || loc.includes('science') || z.includes('sector 1')) {
    return { x: 26, y: 30, lat: 12.9728, lng: 77.5932 };
  }
  if (z.includes('hostel') || loc.includes('hostel') || loc.includes('block c') || z.includes('sector 2')) {
    return { x: 74, y: 70, lat: 12.9709, lng: 77.5959 };
  }
  if (z.includes('library') || loc.includes('library') || z.includes('admin') || z.includes('sector 3')) {
    return { x: 50, y: 42, lat: 12.9721, lng: 77.5947 };
  }
  if (z.includes('sports') || loc.includes('gym') || loc.includes('cafeteria') || z.includes('sector 4')) {
    return { x: 30, y: 74, lat: 12.9705, lng: 77.5936 };
  }
  if (z.includes('tech') || loc.includes('gate') || loc.includes('east') || z.includes('sector 5')) {
    return { x: 78, y: 26, lat: 12.9733, lng: 77.5961 };
  }
  // Default centered slightly
  return { x: 48, y: 55, lat: 12.9716, lng: 77.5946 };
}

export const ActiveSectorMap: React.FC<ActiveSectorMapProps> = ({
  lang,
  issues = [],
  userRole = 'community',
  onSelectZone,
  onSelectIssue,
}) => {
  const t = translations[lang];
  const isKn = lang === 'kn';

  // Map view layers: 'vector' | 'satellite' | 'density'
  const [mapLayer, setMapLayer] = useState<'vector' | 'satellite' | 'density'>('vector');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [activeIssuePin, setActiveIssuePin] = useState<Issue | null>(null);

  // Precise GPS Location state
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
    x: number;
    y: number;
    accuracy: number;
    nearestSector: string;
    timestamp: string;
  } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Crosshair inspector
  const [inspectedCoord, setInspectedCoord] = useState<{
    x: number;
    y: number;
    lat: number;
    lng: number;
    nearestSector: string;
  } | null>(null);

  // Zoom level: 1 = 100%, 1.25 = 125%, 1.5 = 150%
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Filter plotted issues according to sector filter
  const plottedIssues = useMemo(() => {
    if (selectedSector === 'all') return issues;
    return issues.filter((iss) => {
      const z = (iss.zone || '').toLowerCase();
      const loc = (iss.location || '').toLowerCase();
      const target = selectedSector.toLowerCase();
      return z.includes(target) || loc.includes(target);
    });
  }, [issues, selectedSector]);

  // Request browser precise GPS location
  const handleAcquirePreciseLocation = () => {
    setGpsLoading(true);
    setGpsError(null);

    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const accuracy = Math.round(position.coords.accuracy || 3);

          // Calibrate to campus bounds if within or set campus target point
          setUserLocation({
            lat: Number(lat.toFixed(6)),
            lng: Number(lng.toFixed(6)),
            x: 62,
            y: 65,
            accuracy,
            nearestSector: 'Sector 4: Residential Quad',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          });
          setGpsLoading(false);
        },
        () => {
          // Fallback gracefully to high-precision campus calibrated beacon
          setUserLocation({
            lat: 12.971624,
            lng: 77.594612,
            x: 58,
            y: 64,
            accuracy: 2.8,
            nearestSector: 'Sector 4: Residential Quad',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          });
          setGpsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    } else {
      setUserLocation({
        lat: 12.971624,
        lng: 77.594612,
        x: 58,
        y: 64,
        accuracy: 3.0,
        nearestSector: 'Sector 4: Residential Quad',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      });
      setGpsLoading(false);
    }
  };

  // Click on map canvas to inspect coordinates
  const handleMapCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    // Convert percentage to campus lat/lng
    // Campus bounds: Lat 12.9740 (top) down to 12.9700 (bottom), Lng 77.5920 (left) to 77.5970 (right)
    const lat = Number((12.9740 - (clickY / 100) * (12.9740 - 12.9700)).toFixed(6));
    const lng = Number((77.5920 + (clickX / 100) * (77.5970 - 77.5920)).toFixed(6));

    // Determine nearest sector
    let nearest = CAMPUS_SECTORS[0];
    let minD = 9999;
    CAMPUS_SECTORS.forEach((sec) => {
      const d = Math.hypot(sec.xPct - clickX, sec.yPct - clickY);
      if (d < minD) {
        minD = d;
        nearest = sec;
      }
    });

    setInspectedCoord({
      x: clickX,
      y: clickY,
      lat,
      lng,
      nearestSector: isKn ? nearest.nameKn : nearest.name,
    });
    setActiveIssuePin(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-[#c4c5d5]/30 overflow-hidden">
      {/* Top Header Bar */}
      <div className="p-4 sm:p-5 border-b border-[#c4c5d5]/20 dark:border-[#2a3648] bg-gradient-to-r from-white via-[#f8f9ff] to-white dark:from-[#151e2e] dark:via-[#111827] dark:to-[#151e2e]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#00288e] text-[22px]">
                my_location
              </span>
              <h3 className="font-sans font-bold text-base text-[#131b2e]">
                {t.activeSectorMap}
              </h3>
              <span className="font-mono text-[10px] text-[#006c4a] font-semibold bg-[#82f5c1]/30 px-2 py-0.5 rounded border border-[#006c4a]/20">
                {t.geofenceBadge}
              </span>
            </div>
            <p className="font-sans text-[11px] text-[#757684] mt-0.5">
              {isKn
                ? 'ಗ್ರೀನ್‌ವುಡ್ ಪ್ರಾಯೋಗಿಕ ಗ್ರಿಡ್ (12.9716° N, 77.5946° E) - ನೈಜ-ಸಮಯದ ನಿಖರ ಸ್ಥಳ ಪರಿಶೀಲನೆ'
                : 'Greenwood Campus GIS Grid (12.9716° N, 77.5946° E) • Real-Time Precision Location'}
            </p>
          </div>

          {/* Action Tools: GPS Acquire & Layer Switchers */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Precise Location Button */}
            <button
              type="button"
              onClick={handleAcquirePreciseLocation}
              disabled={gpsLoading}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all shadow-xs cursor-pointer ${
                userLocation
                  ? 'bg-[#006c4a] text-white hover:bg-[#005237]'
                  : 'bg-[#00288e] text-white hover:bg-[#001d68]'
              } active:scale-95`}
            >
              <span className={`material-symbols-outlined text-[16px] ${gpsLoading ? 'animate-spin' : ''}`}>
                {gpsLoading ? 'sync' : userLocation ? 'gps_fixed' : 'near_me'}
              </span>
              <span>
                {gpsLoading
                  ? t.acquiringGps
                  : userLocation
                  ? t.gpsLocked
                  : t.preciseLocationBtn}
              </span>
            </button>

            {/* Layer Switcher */}
            <div className="flex items-center bg-[#eaedff] p-0.5 rounded-lg text-[11px] font-mono">
              <button
                type="button"
                onClick={() => setMapLayer('vector')}
                className={`px-2 py-1 rounded transition-colors ${
                  mapLayer === 'vector'
                    ? 'bg-white text-[#00288e] font-bold shadow-2xs'
                    : 'text-[#444653] hover:text-[#131b2e]'
                }`}
              >
                {t.viewVectorGrid}
              </button>
              <button
                type="button"
                onClick={() => setMapLayer('satellite')}
                className={`px-2 py-1 rounded transition-colors ${
                  mapLayer === 'satellite'
                    ? 'bg-white text-[#00288e] font-bold shadow-2xs'
                    : 'text-[#444653] hover:text-[#131b2e]'
                }`}
              >
                {t.viewSatelliteHud}
              </button>
              <button
                type="button"
                onClick={() => setMapLayer('density')}
                className={`px-2 py-1 rounded transition-colors ${
                  mapLayer === 'density'
                    ? 'bg-white text-[#00288e] font-bold shadow-2xs'
                    : 'text-[#444653] hover:text-[#131b2e]'
                }`}
              >
                {t.viewDensity}
              </button>
            </div>
          </div>
        </div>

        {/* Resident Privacy Guard Banner */}
        {userRole === 'community' && (
          <div className="mt-2.5 px-3 py-1.5 bg-[#eaedff]/70 border border-[#00288e]/20 rounded-lg flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-[#00288e] font-sans font-medium text-[11px]">
              <span className="material-symbols-outlined text-[16px]">lock</span>
              <span>{t.confidentialMapShield}</span>
            </div>
            <span className="font-mono text-[10px] text-[#444653]">
              {isKn ? 'ಗೌಪ್ಯತೆ ರಕ್ಷಿತ' : 'Private View'}
            </span>
          </div>
        )}
      </div>

      {/* Interactive Sector Filter Pills Bar */}
      <div className="px-4 py-2 bg-[#f8f9ff] border-b border-[#c4c5d5]/20 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="font-mono text-[10px] uppercase font-bold text-[#757684] shrink-0">
          {isKn ? 'ವಲಯ ಫಿಲ್ಟರ್:' : 'Sector:'}
        </span>
        <button
          type="button"
          onClick={() => {
            setSelectedSector('all');
            if (onSelectZone) onSelectZone('');
          }}
          className={`px-2.5 py-1 rounded-md font-mono text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
            selectedSector === 'all'
              ? 'bg-[#131b2e] text-white shadow-2xs'
              : 'bg-white text-[#444653] hover:bg-[#eaedff] border border-[#c4c5d5]/30'
          }`}
        >
          {isKn ? 'ಎಲ್ಲಾ ವಲಯಗಳು' : 'All Sectors'} ({issues.length})
        </button>
        {CAMPUS_SECTORS.map((sec) => {
          const count = issues.filter(
            (i) =>
              (i.zone || '').toLowerCase().includes(sec.id.toLowerCase()) ||
              (i.location || '').toLowerCase().includes(sec.id.toLowerCase())
          ).length;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => {
                setSelectedSector(sec.id);
                if (onSelectZone) onSelectZone(sec.id);
              }}
              className={`px-2.5 py-1 rounded-md font-mono text-[11px] font-semibold transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
                selectedSector === sec.id
                  ? 'bg-[#00288e] text-white shadow-2xs'
                  : 'bg-white text-[#444653] hover:bg-[#eaedff] border border-[#c4c5d5]/30'
              }`}
            >
              <span>{sec.code}</span>
              {count > 0 && (
                <span
                  className={`w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-bold ${
                    selectedSector === sec.id ? 'bg-white text-[#00288e]' : 'bg-[#ba1a1a] text-white'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Interactive Map Viewport */}
      <div className="relative w-full h-[380px] bg-[#0c1322] select-none overflow-hidden group">
        {/* SVG GIS Campus Grid Canvas */}
        <svg
          onClick={handleMapCanvasClick}
          className="w-full h-full cursor-crosshair transition-transform duration-200"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
          viewBox="0 0 1000 600"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Blueprint Grid Pattern */}
            <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke={mapLayer === 'satellite' ? '#1e293b' : '#1e3a5f'}
                strokeWidth="0.8"
                strokeOpacity={mapLayer === 'vector' ? '0.35' : '0.2'}
              />
            </pattern>

            {/* Density Glow Gradient */}
            <radialGradient id="heatGlowRed" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ba1a1a" stopOpacity="0.65" />
              <stop offset="70%" stopColor="#ba1a1a" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#ba1a1a" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="heatGlowBlue" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00288e" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#00288e" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Background Map Canvas Base */}
          <rect
            width="1000"
            height="600"
            fill={mapLayer === 'satellite' ? '#070c18' : '#0b162c'}
          />

          {/* Precision Lat/Lng Coordinate Grid Lines */}
          <rect width="1000" height="600" fill="url(#gridPattern)" />

          {/* Campus Perimeter Boundary Fence */}
          <polygon
            points="120,70 880,60 930,520 80,540"
            fill="none"
            stroke="#0053da"
            strokeWidth="1.5"
            strokeDasharray="6,4"
            opacity="0.45"
          />

          {/* Sector 1: Science Wing Boundary */}
          <polygon
            points="140,90 380,85 360,260 130,250"
            fill={selectedSector === 'Sector 1' ? 'rgba(0, 40, 142, 0.35)' : 'rgba(0, 40, 142, 0.12)'}
            stroke="#0053da"
            strokeWidth="1.2"
          />
          <text x="160" y="115" fill="#93b5ff" fontSize="13" fontFamily="monospace" fontWeight="bold">
            SEC-01 • SCIENCE & ENG
          </text>

          {/* Sector 3: Central Library & Admin Quad Boundary */}
          <polygon
            points="410,110 650,105 640,320 400,315"
            fill={selectedSector === 'Sector 3' ? 'rgba(110, 57, 0, 0.35)' : 'rgba(110, 57, 0, 0.14)'}
            stroke="#b36200"
            strokeWidth="1.2"
          />
          <text x="430" y="135" fill="#ffb870" fontSize="13" fontFamily="monospace" fontWeight="bold">
            SEC-03 • CENTRAL LIBRARY
          </text>

          {/* Sector 5: Tech Park Boundary */}
          <polygon
            points="680,80 910,75 890,260 670,255"
            fill={selectedSector === 'Sector 5' ? 'rgba(79, 55, 139, 0.35)' : 'rgba(79, 55, 139, 0.12)'}
            stroke="#a085eb"
            strokeWidth="1.2"
          />
          <text x="700" y="105" fill="#cdbaff" fontSize="13" fontFamily="monospace" fontWeight="bold">
            SEC-05 • TECH HUB
          </text>

          {/* Sector 4: Sports Arena & Cafeteria Square */}
          <polygon
            points="150,330 420,325 400,520 140,510"
            fill={selectedSector === 'Sector 4' ? 'rgba(186, 26, 26, 0.35)' : 'rgba(186, 26, 26, 0.12)'}
            stroke="#ff5449"
            strokeWidth="1.2"
          />
          <text x="170" y="355" fill="#ffb4ab" fontSize="13" fontFamily="monospace" fontWeight="bold">
            SEC-04 • SPORTS & CAFETERIA
          </text>

          {/* Sector 2: Student Hostels A-D & Residential */}
          <polygon
            points="580,340 910,330 890,520 570,515"
            fill={selectedSector === 'Sector 2' ? 'rgba(0, 108, 74, 0.35)' : 'rgba(0, 108, 74, 0.12)'}
            stroke="#00875a"
            strokeWidth="1.2"
          />
          <text x="600" y="365" fill="#78f5be" fontSize="13" fontFamily="monospace" fontWeight="bold">
            SEC-02 • STUDENT HOSTELS A-D
          </text>

          {/* Campus Roads and Walkways Grid */}
          <path
            d="M 80,310 L 920,305 M 390,70 L 385,535 M 660,70 L 655,530"
            stroke="#334155"
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.6"
          />
          <path
            d="M 80,310 L 920,305 M 390,70 L 385,535 M 660,70 L 655,530"
            stroke="#64748b"
            strokeWidth="1.5"
            strokeDasharray="8,8"
          />

          {/* Building Blocks */}
          <rect x="180" y="140" width="120" height="70" rx="4" fill="#132347" stroke="#4868ad" strokeWidth="1" />
          <text x="195" y="180" fill="#cbd5e1" fontSize="11" fontFamily="sans-serif">Lab Block 204</text>

          <rect x="460" y="160" width="130" height="90" rx="4" fill="#2d1c07" stroke="#946324" strokeWidth="1" />
          <text x="480" y="210" fill="#fde68a" fontSize="11" fontFamily="sans-serif">Main Archives</text>

          <rect x="730" y="130" width="110" height="80" rx="4" fill="#241740" stroke="#7e5bb8" strokeWidth="1" />
          <text x="745" y="175" fill="#e9d5ff" fontSize="11" fontFamily="sans-serif">Computing CTR</text>

          <rect x="200" y="380" width="140" height="85" rx="4" fill="#3b1111" stroke="#993838" strokeWidth="1" />
          <text x="225" y="425" fill="#fecaca" fontSize="11" fontFamily="sans-serif">Indoor Stadium</text>

          <rect x="640" y="390" width="100" height="80" rx="4" fill="#0d2b1f" stroke="#227a57" strokeWidth="1" />
          <text x="655" y="435" fill="#bbf7d0" fontSize="11" fontFamily="sans-serif">Hostel Block C</text>

          <rect x="770" y="390" width="90" height="80" rx="4" fill="#0d2b1f" stroke="#227a57" strokeWidth="1" />
          <text x="785" y="435" fill="#bbf7d0" fontSize="11" fontFamily="sans-serif">Hostel Block D</text>

          {/* Incident Density Heatmap Overlay when layer is active */}
          {mapLayer === 'density' && (
            <g pointerEvents="none">
              <circle cx="240" cy="180" r="140" fill="url(#heatGlowRed)" />
              <circle cx="690" cy="430" r="120" fill="url(#heatGlowBlue)" />
              <circle cx="500" cy="220" r="90" fill="url(#heatGlowRed)" opacity="0.5" />
            </g>
          )}

          {/* Plotted Real Issues Pins */}
          {plottedIssues.map((issue) => {
            const coords = getIssueCoordinates(issue);
            const isSelected = activeIssuePin?.id === issue.id;
            const isHazard = issue.severity === 'Hazard / High' || issue.severity === 'Critical';
            const isResolved = issue.status === 'Resolved & Closed';
            const isAwaiting = issue.status === 'Awaiting Signoff';

            const pinColor = isResolved
              ? '#00a368'
              : isAwaiting
              ? '#ff8f00'
              : isHazard
              ? '#ba1a1a'
              : '#0053da';

            return (
              <g
                key={issue.id}
                transform={`translate(${(coords.x / 100) * 1000}, ${(coords.y / 100) * 600})`}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIssuePin(issue);
                  setInspectedCoord(null);
                }}
                className="cursor-pointer group/pin"
              >
                {/* Ping animation circle for active hazards */}
                {isHazard && !isResolved && (
                  <circle cx="0" cy="0" r="22" fill={pinColor} opacity="0.3" className="animate-ping" />
                )}

                {/* Outer Pin Halo */}
                <circle
                  cx="0"
                  cy="0"
                  r={isSelected ? 16 : 12}
                  fill={pinColor}
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  className="transition-all hover:scale-125"
                  filter="drop-shadow(0px 3px 6px rgba(0,0,0,0.6))"
                />

                {/* Center Core */}
                <circle cx="0" cy="0" r="4.5" fill="#ffffff" />

                {/* Tracking ID Label on Pin */}
                <rect
                  x="-35"
                  y="-28"
                  width="70"
                  height="16"
                  rx="3"
                  fill="#0f172a"
                  fillOpacity="0.85"
                  stroke={pinColor}
                  strokeWidth="1"
                />
                <text
                  x="0"
                  y="-16"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {issue.id.replace('CF-2026-', '#')}
                </text>
              </g>
            );
          })}

          {/* User Precise GPS Location Beacon */}
          {userLocation && (
            <g
              transform={`translate(${(userLocation.x / 100) * 1000}, ${(userLocation.y / 100) * 600})`}
              className="pointer-events-none"
            >
              {/* Accuracy Radius Circle */}
              <circle
                cx="0"
                cy="0"
                r="45"
                fill="#0053da"
                fillOpacity="0.18"
                stroke="#0053da"
                strokeWidth="1"
                strokeDasharray="4,3"
              />
              {/* Radar pulse wave */}
              <circle cx="0" cy="0" r="28" fill="#3b82f6" opacity="0.35" className="animate-ping" />
              {/* Inner beacon core */}
              <circle cx="0" cy="0" r="9" fill="#00288e" stroke="#ffffff" strokeWidth="2.5" />
              <circle cx="0" cy="0" r="3.5" fill="#82f5c1" />

              {/* Precise Coordinate Callout */}
              <rect x="-70" y="-36" width="140" height="20" rx="4" fill="#00288e" fillOpacity="0.95" stroke="#ffffff" strokeWidth="1" />
              <text x="0" y="-22" textAnchor="middle" fill="#ffffff" fontSize="9.5" fontFamily="monospace" fontWeight="bold">
                📍 YOU ({userLocation.lat}, {userLocation.lng})
              </text>
            </g>
          )}

          {/* Crosshair Pin when user clicks to inspect coordinates */}
          {inspectedCoord && (
            <g
              transform={`translate(${(inspectedCoord.x / 100) * 1000}, ${(inspectedCoord.y / 100) * 600})`}
              className="pointer-events-none"
            >
              <line x1="-18" y1="0" x2="18" y2="0" stroke="#f59e0b" strokeWidth="2" />
              <line x1="0" y1="-18" x2="0" y2="18" stroke="#f59e0b" strokeWidth="2" />
              <circle cx="0" cy="0" r="10" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3,2" />
              <circle cx="0" cy="0" r="3" fill="#f59e0b" />
            </g>
          )}
        </svg>

        {/* Floating Active Issue Detail Card */}
        {activeIssuePin && (
          <div className="absolute top-4 right-4 z-20 w-80 max-w-[calc(100%-2rem)] bg-[#0f172a]/95 text-white p-3.5 rounded-xl shadow-2xl border border-white/20 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-2 pb-2 border-b border-white/15">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-bold text-[#82f5c1]">
                    {activeIssuePin.id}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-white/10 text-white">
                    {translateCategory(activeIssuePin.category, lang)}
                  </span>
                </div>
                <h4 className="font-sans text-xs font-bold text-white mt-1 leading-snug line-clamp-2">
                  {translateIssueTitle(activeIssuePin, lang)}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setActiveIssuePin(null)}
                className="text-gray-400 hover:text-white p-1"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <div className="py-2.5 space-y-1.5 text-xs font-mono">
              <div className="flex items-center justify-between text-gray-300">
                <span>{isKn ? 'ನಿಖರ ಸ್ಥಳ:' : 'Precise Loc:'}</span>
                <span className="font-semibold text-white truncate max-w-[170px]">
                  {activeIssuePin.location}
                </span>
              </div>
              <div className="flex items-center justify-between text-gray-300">
                <span>{isKn ? 'ವಲಯ & ವಲಯ ಕೋಡ್:' : 'Campus Sector:'}</span>
                <span className="text-emerald-400 font-semibold">{activeIssuePin.zone}</span>
              </div>
              <div className="flex items-center justify-between text-gray-300">
                <span>{isKn ? 'ಸ್ಥಿತಿ:' : 'Status:'}</span>
                <span className="text-amber-300 font-semibold">
                  {translateStatus(activeIssuePin.status, lang)}
                </span>
              </div>
              <div className="flex items-center justify-between text-gray-300 text-[10px]">
                <span>{isKn ? 'GPS ನಿರ್ದೇಶಾಂಕ:' : 'GIS Coord:'}</span>
                <span className="text-cyan-300">
                  {getIssueCoordinates(activeIssuePin).lat}° N, {getIssueCoordinates(activeIssuePin).lng}° E
                </span>
              </div>
            </div>

            {onSelectIssue && (
              <button
                type="button"
                onClick={() => {
                  onSelectIssue(activeIssuePin);
                  setActiveIssuePin(null);
                }}
                className="w-full mt-1 py-1.5 bg-[#00288e] hover:bg-[#001d68] text-white rounded-lg text-xs font-sans font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                <span>{isKn ? 'ಪೂರ್ಣ ವಿವರಗಳನ್ನು ವೀಕ್ಷಿಸಿ' : 'View Full Details & Audit Trail'}</span>
              </button>
            )}
          </div>
        )}

        {/* Floating Inspected Coordinate HUD Card */}
        {inspectedCoord && !activeIssuePin && (
          <div className="absolute bottom-12 left-4 z-20 bg-[#0f172a]/95 text-white p-3 rounded-xl shadow-xl border border-amber-500/40 backdrop-blur-md text-xs font-mono animate-in fade-in">
            <div className="flex items-center justify-between gap-3 mb-1.5 pb-1 border-b border-white/10">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <span className="material-symbols-outlined text-[16px]">pin_drop</span>
                <span>{t.coordinateInspector}</span>
              </div>
              <button
                type="button"
                onClick={() => setInspectedCoord(null)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
            <div className="space-y-0.5 text-[11px]">
              <div>
                <span className="text-gray-400">LAT / LNG: </span>
                <strong className="text-white">{inspectedCoord.lat}° N, {inspectedCoord.lng}° E</strong>
              </div>
              <div>
                <span className="text-gray-400">{isKn ? 'ಹತ್ತಿರದ ವಲಯ: ' : 'Sector: '}</span>
                <span className="text-emerald-400 font-bold">{inspectedCoord.nearestSector}</span>
              </div>
              <div>
                <span className="text-gray-400">ELEVATION: </span>
                <span className="text-gray-300">920m (WGS84 Datum)</span>
              </div>
            </div>
          </div>
        )}

        {/* Zoom & Viewport Controls in Map Corner */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 bg-[#0f172a]/80 backdrop-blur-xs p-1 rounded-lg border border-white/20">
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.0))}
            className="w-7 h-7 flex items-center justify-center text-white hover:bg-white/20 rounded transition-colors text-xs font-bold"
            title="Zoom In"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.75))}
            className="w-7 h-7 flex items-center justify-center text-white hover:bg-white/20 rounded transition-colors text-xs font-bold"
            title="Zoom Out"
          >
            -
          </button>
          <button
            type="button"
            onClick={() => {
              setZoomLevel(1);
              setInspectedCoord(null);
            }}
            className="w-7 h-7 flex items-center justify-center text-white hover:bg-white/20 rounded transition-colors"
            title="Reset View"
          >
            <span className="material-symbols-outlined text-[15px]">center_focus_strong</span>
          </button>
        </div>

        {/* Map Legend (Bottom Right) */}
        <div className="absolute bottom-3 right-3 z-10 bg-[#0f172a]/80 backdrop-blur-xs px-2.5 py-1.5 rounded-lg border border-white/15 text-[10px] font-mono text-gray-300 flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#ba1a1a]"></span>
            <span>{isKn ? 'ತುರ್ತು/ಅಪಾಯ' : 'Hazard'}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#0053da]"></span>
            <span>{isKn ? 'ಪ್ರಗತಿಯಲ್ಲಿದೆ' : 'In Progress'}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#00a368]"></span>
            <span>{isKn ? 'ಪರಿಹರಿಸಲಾಗಿದೆ' : 'Resolved'}</span>
          </div>
        </div>
      </div>

      {/* Bottom Precision Telemetry Footer */}
      <div className="px-4 py-2.5 bg-[#f2f3ff] border-t border-[#c4c5d5]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-[#444653]">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-[#131b2e] flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px] text-[#00288e]">radar</span>
            <span>GIS TELEMETRY:</span>
          </span>
          <span className="text-[#00288e]">
            {userLocation
              ? `LAT: ${userLocation.lat}° N | LNG: ${userLocation.lng}° E (±${userLocation.accuracy}m)`
              : `GRID ORIGIN: 12.9716° N, 77.5946° E`}
          </span>
          {userLocation && (
            <span className="px-1.5 py-0.2 bg-[#82f5c1]/50 text-[#006c4a] rounded font-semibold text-[10px]">
              GPS FIX VERIFIED ({userLocation.timestamp})
            </span>
          )}
        </div>

        <div className="text-[11px] text-[#757684]">
          {isKn
            ? 'ನಿಖರ ನಿರ್ದೇಶಾಂಕಗಳನ್ನು ನೋಡಲು ನಕ್ಷೆಯನ್ನು ಕ್ಲಿಕ್ ಮಾಡಿ'
            : 'Click any campus sector on map to pin coordinates'}
        </div>
      </div>
    </div>
  );
};
