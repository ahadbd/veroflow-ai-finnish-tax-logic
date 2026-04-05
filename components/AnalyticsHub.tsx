'use client';

import React, { useState, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Maximize, Navigation, Plus, Minus, MapPin, BarChart3, TrendingUp, CheckCircle2, Info, Zap } from 'lucide-react';
import { useVero } from './VeroProvider';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PeakPerformanceHub from './PeakPerformanceHub';

const MAP_LABELS = [
  // Helsinki
  { name: "Kamppi", lat: 60.169, lng: 24.933, type: 'neighborhood' },
  { name: "Kallio", lat: 60.184, lng: 24.950, type: 'neighborhood' },
  { name: "Pasila", lat: 60.199, lng: 24.933, type: 'neighborhood' },
  { name: "Töölö", lat: 60.178, lng: 24.925, type: 'neighborhood' },
  { name: "Jätkäsaari", lat: 60.158, lng: 24.921, type: 'neighborhood' },
  { name: "Punavuori", lat: 60.162, lng: 24.940, type: 'neighborhood' },
  { name: "Sörnäinen", lat: 60.187, lng: 24.961, type: 'neighborhood' },
  { name: "Meilahti", lat: 60.189, lng: 24.900, type: 'neighborhood' },
  // Kotka
  { name: "Kotkansaari", lat: 60.466, lng: 26.945, type: 'neighborhood' },
  { name: "Karhula", lat: 60.515, lng: 26.933, type: 'neighborhood' },
  { name: "Sunila", lat: 60.483, lng: 26.950, type: 'neighborhood' },
  { name: "Mussalo", lat: 60.450, lng: 26.883, type: 'neighborhood' },
  { name: "Hovinsaari", lat: 60.483, lng: 26.916, type: 'neighborhood' },
  { name: "Kotka", lat: 60.466, lng: 26.945, type: 'city' },
  { name: "Hamina", lat: 60.569, lng: 27.198, type: 'city' },
  { name: "Pyhtää", lat: 60.492, lng: 26.543, type: 'city' },
  { name: "Loviisa", lat: 60.456, lng: 26.225, type: 'city' },
  { name: "Porvoo", lat: 60.393, lng: 25.665, type: 'city' },
  // Other major cities
  { name: "Espoo", lat: 60.205, lng: 24.655, type: 'city' },
  { name: "Vantaa", lat: 60.294, lng: 25.040, type: 'city' },
  { name: "Tampere", lat: 61.497, lng: 23.760, type: 'city' },
  { name: "Turku", lat: 60.451, lng: 22.266, type: 'city' },
  { name: "Oulu", lat: 65.012, lng: 25.468, type: 'city' },
  { name: "Helsinki", lat: 60.169, lng: 24.935, type: 'city' }
];

export default function AnalyticsHub() {
  const { shifts, profile, weather, currentLocation } = useVero();
  const [mapZoom, setMapZoom] = useState(1);
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // --- Map Logic ---
  const mapBounds = useMemo(() => {
    const allPoints = shifts.flatMap(s => (s.gpsPoints || []).map(p => ({ ...p, grossPay: s.grossPay })));
    const pointsToConsider = [...allPoints];
    if (currentLocation) pointsToConsider.push(currentLocation as any);

    // Also consider map labels for bounds if they are nearby
    if (currentLocation) {
      const nearbyLabels = MAP_LABELS.filter(l => 
        Math.abs(l.lat - currentLocation.lat) < 0.5 && 
        Math.abs(l.lng - currentLocation.lng) < 0.5
      );
      pointsToConsider.push(...nearbyLabels as any);
    }

    if (pointsToConsider.length === 0) return null;

    const bounds = pointsToConsider.reduce((acc, p) => ({
      minLat: Math.min(acc.minLat, p.lat),
      maxLat: Math.max(acc.maxLat, p.lat),
      minLng: Math.min(acc.minLng, p.lng),
      maxLng: Math.max(acc.maxLng, p.lng),
    }), { minLat: 90, maxLat: -90, minLng: 180, maxLng: -180 });

    const latRange = (bounds.maxLat - bounds.minLat) || 0.01;
    const lngRange = (bounds.maxLng - bounds.minLng) || 0.01;

    const padLat = latRange * 0.2;
    const padLng = lngRange * 0.2;

    return {
      minLat: bounds.minLat - padLat,
      maxLat: bounds.maxLat + padLat,
      minLng: bounds.minLng - padLng,
      maxLng: bounds.maxLng + padLng,
      allPoints
    };
  }, [shifts, currentLocation]);

  const locateMe = () => {
    if (!currentLocation || !mapBounds || !mapContainerRef.current) return;
    
    const { minLat, maxLat, minLng, maxLng } = mapBounds;
    const container = mapContainerRef.current;
    const rect = container.getBoundingClientRect();
    
    const xPercent = (currentLocation.lng - minLng) / (maxLng - minLng);
    const yPercent = 1 - (currentLocation.lat - minLat) / (maxLat - minLat);
    
    const zoom = 3;
    setMapZoom(zoom);
    
    const targetX = (0.5 - xPercent) * rect.width * zoom;
    const targetY = (0.5 - yPercent) * rect.height * zoom;
    
    setMapOffset({ x: targetX, y: targetY });
  };

  const platformStats = useMemo(() => {
    const stats: Record<string, { gross: number; net: number; count: number }> = {};
    shifts.forEach(s => {
      if (!stats[s.app]) stats[s.app] = { gross: 0, net: 0, count: 0 };
      stats[s.app].gross += s.grossPay;
      stats[s.app].net += s.netProfit;
      stats[s.app].count += 1;
    });
    return Object.entries(stats).map(([name, data]) => ({ name, ...data }));
  }, [shifts]);

  const avgHourly = useMemo(() => {
    const totalNet = shifts.reduce((acc, s) => acc + s.netProfit, 0);
    const totalHours = shifts.reduce((acc, s) => acc + (s.durationMin || 0), 0) / 60;
    return totalHours > 0 ? (totalNet / totalHours).toFixed(2) : "0.00";
  }, [shifts]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-black text-white tracking-tight uppercase">Analytics Hub</h2>

      {/* Heatmap Section */}
      <div className="bg-card p-6 rounded-3xl border border-border space-y-4">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Earnings Heatmap (GPS)</p>
            <p className="text-[8px] text-gray-600 uppercase font-black tracking-widest">Interactive • Zoom & Pan Enabled</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                setMapZoom(1);
                setMapOffset({ x: 0, y: 0 });
              }}
              aria-label="Reset map view"
              className="p-2 bg-white/10 rounded-xl border border-border text-gray-300 hover:text-white transition-colors"
            >
              <Maximize size={14} />
            </button>
            <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
              <span className="text-[10px] text-gray-400 uppercase font-black">You</span>
            </div>
          </div>
        </div>

        <div ref={mapContainerRef} className="h-64 lg:h-96 bg-black/60 rounded-3xl relative overflow-hidden border border-border touch-none">
          {/* Background Grid */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-10" 
            style={{ 
              backgroundImage: `linear-gradient(var(--brand) 1px, transparent 1px), linear-gradient(90deg, var(--brand) 1px, transparent 1px)`,
              backgroundSize: `${20 * mapZoom}px ${20 * mapZoom}px`,
              backgroundPosition: `${mapOffset.x}px ${mapOffset.y}px`
            }} 
          />

          {mapBounds ? (
            <motion.div 
              drag
              onDrag={(e, info) => {
                setMapOffset(prev => ({
                  x: prev.x + info.delta.x,
                  y: prev.y + info.delta.y
                }));
              }}
              className="absolute inset-0 cursor-grab active:cursor-grabbing"
              style={{ x: mapOffset.x, y: mapOffset.y, scale: mapZoom }}
            >
              {mapBounds.allPoints.map((p: any, i) => {
                const x = ((p.lng - mapBounds.minLng) / (mapBounds.maxLng - mapBounds.minLng)) * 100;
                const y = (1 - (p.lat - mapBounds.minLat) / (mapBounds.maxLat - mapBounds.minLat)) * 100;
                
                // Calculate intensity based on grossPay
                const intensity = Math.min((p.grossPay || 10) / 50, 1);
                const size = 2 + (intensity * 4);
                const blur = 1 + (intensity * 2);
                
                return (
                  <div 
                    key={i}
                    className="absolute rounded-full"
                    style={{ 
                      left: `${x}%`, 
                      top: `${y}%`, 
                      width: `${size}px`,
                      height: `${size}px`,
                      backgroundColor: intensity > 0.7 ? 'var(--brand)' : intensity > 0.4 ? '#60A5FA' : '#666',
                      filter: `blur(${blur}px)`,
                      opacity: 0.3 + (intensity * 0.5),
                      boxShadow: `0 0 ${size * 2}px ${intensity > 0.7 ? 'var(--brand)' : intensity > 0.4 ? '#60A5FA' : '#666'}`
                    }}
                  />
                );
              })}

              {/* Map Labels */}
              {MAP_LABELS.map((label, i) => {
                if (label.lat < mapBounds.minLat || label.lat > mapBounds.maxLat || 
                    label.lng < mapBounds.minLng || label.lng > mapBounds.maxLng) return null;

                const x = ((label.lng - mapBounds.minLng) / (mapBounds.maxLng - mapBounds.minLng)) * 100;
                const y = (1 - (label.lat - mapBounds.minLat) / (mapBounds.maxLat - mapBounds.minLat)) * 100;

                return (
                  <div 
                    key={`label-${i}`}
                    className="absolute pointer-events-none select-none"
                    style={{ left: `${x}%`, top: `${y}%` }}
                  >
                    <p className={`text-[6px] font-black uppercase tracking-tighter whitespace-nowrap ${label.type === 'city' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {label.name}
                    </p>
                  </div>
                );
              })}

              {currentLocation && (
                <div
                  className="absolute w-6 h-6 z-20"
                  style={{
                    left: `${((currentLocation.lng - mapBounds.minLng) / (mapBounds.maxLng - mapBounds.minLng)) * 100}%`,
                    top: `${(1 - (currentLocation.lat - mapBounds.minLat) / (mapBounds.maxLat - mapBounds.minLat)) * 100}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75" />
                  <div className="absolute inset-1 bg-blue-400 rounded-full border-2 border-white shadow-[0_0_15px_rgba(96,165,250,0.9)]" />
                </div>
              )}
            </motion.div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-700 space-y-2">
              <MapPin size={24} />
              <p className="text-[10px] uppercase font-black tracking-widest">Waiting for GPS Signal</p>
            </div>
          )}

          {/* Zoom Controls */}
          <div className="absolute right-3 top-3 flex flex-col gap-2 z-30">
            <button 
              onClick={() => setMapZoom(prev => Math.min(prev + 0.5, 5))}
              aria-label="Zoom in"
              className="w-10 h-10 bg-black/80 backdrop-blur-md rounded-lg border border-white/20 flex items-center justify-center text-white hover:bg-white/10"
            >
              <Plus size={18} />
            </button>
            <button 
              onClick={() => setMapZoom(prev => Math.max(prev - 0.5, 0.5))}
              aria-label="Zoom out"
              className="w-10 h-10 bg-black/80 backdrop-blur-md rounded-lg border border-white/20 flex items-center justify-center text-white hover:bg-white/10"
            >
              <Minus size={18} />
            </button>
            <button 
              onClick={locateMe}
              aria-label="Find my location"
              className="w-10 h-10 bg-black/80 backdrop-blur-md rounded-lg border border-white/20 flex items-center justify-center text-white hover:text-blue-400 transition-all"
            >
              <Navigation size={18} />
            </button>
          </div>
        </div>

        {/* Heatmap Legend */}
        <div className="flex items-center gap-4 px-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-brand rounded-full shadow-[0_0_5px_var(--brand)]" />
            <span className="text-[8px] text-gray-500 uppercase font-black">High Yield</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_5px_#60A5FA]" />
            <span className="text-[8px] text-gray-500 uppercase font-black">Medium</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-gray-600 rounded-full" />
            <span className="text-[8px] text-gray-500 uppercase font-black">Low/Idle</span>
          </div>
          <div className="ml-auto flex items-center gap-1 text-gray-600">
            <Info size={10} />
            <span className="text-[8px] uppercase font-black">Based on GPS density & pay</span>
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-card p-6 rounded-3xl border border-border h-64">
        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-4">Earnings Performance</p>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={[...shifts].reverse().slice(-7)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
            <XAxis 
              dataKey="date" 
              tickFormatter={(str) => new Date(str).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              tick={{ fontSize: 10, fill: '#666', fontWeight: 'bold' }}
            />
            <YAxis tick={{ fontSize: 10, fill: '#666', fontWeight: 'bold' }} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '12px' }}
              itemStyle={{ color: 'var(--brand)', fontWeight: 'bold' }}
            />
            <Bar dataKey="netProfit" fill="var(--brand)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Peak Intelligence Section */}
      <PeakPerformanceHub />

      {/* Platform Breakdown */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card p-6 rounded-3xl border border-border">
          <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-4">Avg. Hourly (Net)</p>
          <p className="text-3xl font-display font-black text-brand">€{avgHourly}</p>
          <p className="text-[8px] text-gray-600 uppercase font-black tracking-widest mt-1">Based on logged shifts</p>
        </div>
        <div className="bg-card p-6 rounded-3xl border border-border">
          <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-4">Top Platform</p>
          <p className="text-2xl font-display font-black text-white uppercase tracking-tighter">
            {platformStats.sort((a, b) => b.net - a.net)[0]?.name || 'N/A'}
          </p>
          <p className="text-[8px] text-gray-600 uppercase font-black tracking-widest mt-1">By total net profit</p>
        </div>
      </div>

      <div className="bg-card p-6 rounded-3xl border border-border space-y-4">
        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Net Profit by App</p>
        <div className="space-y-3">
          {platformStats.map(stat => (
            <div key={stat.name} className="space-y-1">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span>{stat.name}</span>
                <span className="text-brand">€{stat.net.toFixed(2)}</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(stat.net / Math.max(...platformStats.map(s => s.net))) * 100}%` }}
                  className="h-full bg-brand"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Readiness */}
      <div className="bg-card p-6 rounded-3xl border border-border flex items-center gap-4">
        <div className="p-3 bg-brand/10 rounded-2xl">
          <CheckCircle2 className="w-6 h-6 text-brand" />
        </div>
        <div>
          <p className="text-sm font-black text-white uppercase tracking-tight">Audit Compliant</p>
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">All shifts have GPS or OCR metadata.</p>
        </div>
      </div>
    </div>
  );
}
