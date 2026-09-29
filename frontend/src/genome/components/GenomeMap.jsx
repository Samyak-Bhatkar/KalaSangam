import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import '../genome.css';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { CULTURAL_TYPES, MAP_CENTER_INDIA, MAP_DEFAULT_ZOOM } from '../utils/constants';

// Cultural Category Symbols (Emoji / Icons)
export const CULTURAL_SYMBOLS = {
  craft: '🎨',
  textile: '🧵',
  dance: '💃',
  music: '🎵',
  instrument: '🪕',
  monument: '🏛️',
  cuisine: '🍲',
  festival: '🪔',
  dialect: '🗣️',
  folk_story: '📜'
};

// Regional State Centroids for Map Labels Across India
export const STATE_CENTROIDS = [
  { name_en: 'Rajasthan', name_hi: 'राजस्थान', lng: 73.8479, lat: 26.5844 },
  { name_en: 'Uttar Pradesh', name_hi: 'उत्तर प्रदेश', lng: 80.9462, lat: 26.8467 },
  { name_en: 'Madhya Pradesh', name_hi: 'मध्य प्रदेश', lng: 77.4126, lat: 23.2599 },
  { name_en: 'Maharashtra', name_hi: 'महाराष्ट्र', lng: 75.7139, lat: 19.7515 },
  { name_en: 'Gujarat', name_hi: 'गुजरात', lng: 71.1924, lat: 22.2587 },
  { name_en: 'Karnataka', name_hi: 'कर्नाटक', lng: 75.7139, lat: 15.3173 },
  { name_en: 'Tamil Nadu', name_hi: 'तमिलनाडु', lng: 78.6569, lat: 11.1271 },
  { name_en: 'Andhra Pradesh', name_hi: 'आंध्र प्रदेश', lng: 79.7400, lat: 15.9129 },
  { name_en: 'Telangana', name_hi: 'तेलंगाना', lng: 79.0193, lat: 18.1124 },
  { name_en: 'West Bengal', name_hi: 'पश्चिम बंगाल', lng: 87.8550, lat: 22.9868 },
  { name_en: 'Bihar', name_hi: 'बिहार', lng: 85.3131, lat: 25.0961 },
  { name_en: 'Odisha', name_hi: 'ओडिशा', lng: 84.8034, lat: 20.9517 },
  { name_en: 'Kerala', name_hi: 'केरल', lng: 76.2711, lat: 10.8505 },
  { name_en: 'Punjab', name_hi: 'पंजाब', lng: 75.3412, lat: 31.1471 },
  { name_en: 'Haryana', name_hi: 'हरियाणा', lng: 76.0856, lat: 29.0588 },
  { name_en: 'Himachal Pradesh', name_hi: 'हिमाचल प्रदेश', lng: 77.1734, lat: 31.1048 },
  { name_en: 'Jammu & Kashmir', name_hi: 'जम्मू और कश्मीर', lng: 74.7973, lat: 33.7782 },
  { name_en: 'Ladakh', name_hi: 'लद्दाख', lng: 77.5771, lat: 34.1526 },
  { name_en: 'Uttarakhand', name_hi: 'उत्तराखंड', lng: 79.0193, lat: 30.0668 },
  { name_en: 'Chhattisgarh', name_hi: 'छत्तीसगढ़', lng: 81.8661, lat: 21.2787 },
  { name_en: 'Jharkhand', name_hi: 'झारखंड', lng: 85.2799, lat: 23.6102 },
  { name_en: 'Assam', name_hi: 'असम', lng: 92.9376, lat: 26.2006 },
  { name_en: 'Arunachal Pradesh', name_hi: 'अरुणाचल प्रदेश', lng: 94.7278, lat: 28.2180 },
  { name_en: 'Nagaland', name_hi: 'नागालैंड', lng: 94.5624, lat: 26.1584 },
  { name_en: 'Manipur', name_hi: 'मणिपुर', lng: 93.9063, lat: 24.6637 },
  { name_en: 'Mizoram', name_hi: 'मिज़ोरम', lng: 92.9376, lat: 23.1645 },
  { name_en: 'Tripura', name_hi: 'त्रिपुरा', lng: 91.9882, lat: 23.9408 },
  { name_en: 'Meghalaya', name_hi: 'मेघालय', lng: 91.3662, lat: 25.4670 },
  { name_en: 'Sikkim', name_hi: 'सिक्किम', lng: 88.5122, lat: 27.5330 },
  { name_en: 'Goa', name_hi: 'गोवा', lng: 74.1240, lat: 15.2993 }
];

// Configure MapLibre Web Worker for Vite
maplibregl.setWorkerUrl(workerUrl);

export default function GenomeMap({
  elements = [],
  activeTypes = new Set(),
  selectedElement = null,
  onSelectElement = () => {},
  similarityRelations = [],
  journeyRoute = null,
  timelineActiveEvent = null,
  isUnknownIndiaMode = false
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const markersRef = useRef(new Map());
  const stateMarkersRef = useRef(new Map());

  // Handle container and window resize
  useEffect(() => {
    if (!mapRef.current) return;
    const t = setTimeout(() => {
      mapRef.current?.resize();
    }, 150);
    const handleResize = () => mapRef.current?.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', handleResize);
    };
  }, [mapLoaded]);

  // Initialize MapLibre GL
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        name: 'Bharat Cultural Genome Dark Canvas',
        sources: {
          'india-states': {
            type: 'geojson',
            data: '/data/genome/india_states.geojson'
          }
        },
        layers: [
          {
            id: 'background',
            type: 'background',
            paint: {
              'background-color': '#070D1D'
            }
          },
          {
            id: 'states-fill',
            type: 'fill',
            source: 'india-states',
            paint: {
              'fill-color': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                '#1E293B',
                '#0F172A'
              ],
              'fill-opacity': 0.95
            }
          },
          {
            id: 'states-borders',
            type: 'line',
            source: 'india-states',
            paint: {
              'line-color': '#334155',
              'line-width': 1.0,
              'line-opacity': 0.8
            }
          },
          {
            id: 'states-glow',
            type: 'line',
            source: 'india-states',
            paint: {
              'line-color': '#0EA5E9',
              'line-width': 0.5,
              'line-opacity': 0.3
            }
          }
        ]
      },
      center: MAP_CENTER_INDIA,
      zoom: MAP_DEFAULT_ZOOM,
      minZoom: 3.5,
      maxZoom: 12,
      maxBounds: [
        [64.0, 5.0], // Southwest coords
        [100.0, 38.0] // Northeast coords
      ],
      attributionControl: false
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'bottom-right');

    map.on('load', () => {
      setMapLoaded(true);

      // Add dynamic relation links source & layer (for Cultural DNA similarity)
      map.addSource('relation-links', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      map.addLayer({
        id: 'relation-links-glow',
        type: 'line',
        source: 'relation-links',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#F59E0B',
          'line-width': 4,
          'line-opacity': 0.4,
          'line-blur': 3
        }
      });

      map.addLayer({
        id: 'relation-links-core',
        type: 'line',
        source: 'relation-links',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#38BDF8',
          'line-width': 2.5,
          'line-dasharray': [2, 1]
        }
      });

      // Add journey path source & layer
      map.addSource('journey-path', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      map.addLayer({
        id: 'journey-path-glow',
        type: 'line',
        source: 'journey-path',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#10B981',
          'line-width': 6,
          'line-opacity': 0.4,
          'line-blur': 4
        }
      });

      map.addLayer({
        id: 'journey-path-line',
        type: 'line',
        source: 'journey-path',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#34D399',
          'line-width': 3
        }
      });

      // Add heat layer for Cultural DNA similarity
      map.addSource('dna-heatmap-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      map.addLayer({
        id: 'dna-heatmap-layer',
        type: 'heatmap',
        source: 'dna-heatmap-source',
        maxzoom: 9,
        paint: {
          'heatmap-weight': ['get', 'weight'],
          'heatmap-intensity': 1.5,
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(0,0,0,0)',
            0.2, 'rgba(245, 158, 11, 0.2)',
            0.5, 'rgba(234, 88, 12, 0.5)',
            0.8, 'rgba(217, 70, 239, 0.7)',
            1.0, 'rgba(56, 189, 248, 0.9)'
          ],
          'heatmap-radius': 45,
          'heatmap-opacity': 0.75
        }
      });
    });

    mapRef.current = map;

    return () => {
      stateMarkersRef.current.forEach((m) => m.remove());
      stateMarkersRef.current.clear();
      markersRef.current.forEach((m) => m.remove());
      markersRef.current.clear();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Add subtle state/region watermark labels across India for rich geographic orientation
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;

    STATE_CENTROIDS.forEach((st) => {
      if (stateMarkersRef.current.has(st.name_en)) return;

      const elDom = document.createElement('div');
      elDom.className = 'state-region-label pointer-events-none select-none text-center transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300';
      elDom.innerHTML = `
        <div class="flex flex-col items-center justify-center opacity-40 hover:opacity-90">
          <span class="text-[11px] font-black tracking-widest text-slate-300 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] uppercase">${st.name_hi}</span>
          <span class="text-[8px] font-extrabold tracking-wider text-slate-400 uppercase">${st.name_en}</span>
        </div>
      `;

      const marker = new maplibregl.Marker({ element: elDom, anchor: 'center' })
        .setLngLat([st.lng, st.lat])
        .addTo(map);

      stateMarkersRef.current.set(st.name_en, marker);
    });

    return () => {
      stateMarkersRef.current.forEach((m) => m.remove());
      stateMarkersRef.current.clear();
    };
  }, [mapLoaded]);

  // Update HTML Markers when elements, activeTypes, or selectedElement changes
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;

    // Filter elements
    const visibleElements = elements.filter((el) => {
      if (isUnknownIndiaMode && (el.rarity || 1) < 4) {
        return false;
      }
      return activeTypes.has(el.type);
    });

    const currentIds = new Set(visibleElements.map((e) => e.id));

    // Remove markers that are no longer visible
    markersRef.current.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    // Add or update markers with category symbols and area names
    visibleElements.forEach((el) => {
      const isSelected = selectedElement?.id === el.id;
      const typeConfig = CULTURAL_TYPES[el.type] || CULTURAL_TYPES.craft;
      const symbolIcon = CULTURAL_SYMBOLS[el.type] || '✨';
      const areaLocation = [el.place_name || el.district, el.state].filter(Boolean).join(', ');
      let marker = markersRef.current.get(el.id);

      if (!marker) {
        // Create custom interactive DOM element for marker
        const elDom = document.createElement('div');
        elDom.className = 'genome-marker-container cursor-pointer transition-all duration-300 transform hover:scale-125 z-10';
        
        elDom.addEventListener('click', (e) => {
          e.stopPropagation();
          onSelectElement(el);
          map.flyTo({
            center: [el.lng, el.lat],
            zoom: Math.max(map.getZoom(), 6.5),
            duration: 1200,
            essential: true
          });
        });

        marker = new maplibregl.Marker({ element: elDom, anchor: 'center' })
          .setLngLat([el.lng, el.lat])
          .addTo(map);

        markersRef.current.set(el.id, marker);
      }

      // Update marker innerHTML with vibrant symbol and location area tag
      const dom = marker.getElement();
      dom.innerHTML = `
        <div class="relative flex flex-col items-center justify-center group">
          ${isSelected ? `
            <div class="absolute -inset-3 rounded-full bg-cyan-400/40 animate-ping pointer-events-none"></div>
            <div class="absolute -inset-1.5 rounded-full border-2 border-cyan-400 pointer-events-none"></div>
          ` : ''}
          <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shadow-xl transition-all duration-300 ${
            isSelected
              ? 'bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 scale-130 ring-2 ring-cyan-300 z-30 shadow-cyan-500/50'
              : 'bg-slate-900/95 border-2 text-slate-100 hover:scale-125 z-10 hover:z-20 hover:border-amber-400'
          }" style="border-color: ${isSelected ? '#38BDF8' : typeConfig.color}; box-shadow: 0 0 12px ${isSelected ? '#38BDF8' : typeConfig.color}45;">
            <span>${symbolIcon}</span>
          </div>
          <div class="mt-1 px-2 py-0.5 rounded-md bg-slate-950/95 border border-slate-700/90 text-center shadow-lg pointer-events-none backdrop-blur-md transition-all ${
            isSelected ? 'border-cyan-400/90 scale-105 z-30' : 'group-hover:border-amber-400/80'
          }">
            <div class="text-[10px] font-black text-slate-100 leading-tight whitespace-nowrap">
              ${el.name_hi || el.name_en}
            </div>
            ${areaLocation ? `
              <div class="text-[8.5px] font-bold text-amber-300/90 leading-tight whitespace-nowrap flex items-center justify-center gap-0.5 mt-0.5">
                <span>📍</span>
                <span>${areaLocation}</span>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    });
  }, [elements, activeTypes, selectedElement, mapLoaded, isUnknownIndiaMode, onSelectElement]);

  // Update relation links & heatmap for Cultural DNA Explorer
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;

    const linkFeatures = [];
    const heatFeatures = [];

    if (selectedElement && similarityRelations.length > 0) {
      // Add heat feature for origin
      heatFeatures.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [selectedElement.lng, selectedElement.lat]
        },
        properties: { weight: 1.0 }
      });

      similarityRelations.forEach((rel) => {
        const target = rel.targetElement;
        if (!target) return;

        // Line feature from selected to related target
        linkFeatures.push({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [
              [selectedElement.lng, selectedElement.lat],
              [target.lng, target.lat]
            ]
          },
          properties: {
            weight: rel.weight || 0.8,
            kind: rel.kind
          }
        });

        // Heat blob on target
        heatFeatures.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [target.lng, target.lat]
          },
          properties: { weight: rel.weight || 0.8 }
        });
      });
    }

    const linkSource = map.getSource('relation-links');
    if (linkSource) {
      linkSource.setData({
        type: 'FeatureCollection',
        features: linkFeatures
      });
    }

    const heatSource = map.getSource('dna-heatmap-source');
    if (heatSource) {
      heatSource.setData({
        type: 'FeatureCollection',
        features: heatFeatures
      });
    }
  }, [selectedElement, similarityRelations, mapLoaded]);

  // Update Journey Route line on map
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;
    const pathSource = map.getSource('journey-path');

    if (!pathSource) return;

    if (journeyRoute && journeyRoute.stops && journeyRoute.stops.length > 1) {
      const coordinates = journeyRoute.stops.map((s) => [s.lng, s.lat]);
      pathSource.setData({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates
            }
          }
        ]
      });

      // Fit map to route bounds
      const bounds = coordinates.reduce(
        (b, coord) => b.extend(coord),
        new maplibregl.LngLatBounds(coordinates[0], coordinates[0])
      );
      map.fitBounds(bounds, { padding: 80, duration: 1500 });
    } else {
      pathSource.setData({
        type: 'FeatureCollection',
        features: []
      });
    }
  }, [journeyRoute, mapLoaded]);

  // Handle timeline active event highlight
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !timelineActiveEvent) return;
    const map = mapRef.current;
    map.flyTo({
      center: [timelineActiveEvent.lng, timelineActiveEvent.lat],
      zoom: 6.8,
      duration: 1200,
      essential: true
    });
  }, [timelineActiveEvent, mapLoaded]);

  // Fly to selected element
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !selectedElement) return;
    mapRef.current.flyTo({
      center: [selectedElement.lng, selectedElement.lat],
      zoom: Math.max(mapRef.current.getZoom(), 6.5),
      duration: 1200,
      essential: true
    });
  }, [selectedElement, mapLoaded]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-slate-950">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
