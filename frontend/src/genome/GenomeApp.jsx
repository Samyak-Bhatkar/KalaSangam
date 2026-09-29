import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  loadGenomeData,
  getRelatedElements,
  getStoriesForElement,
  getTimelineForTradition,
  getDiscoveryElements
} from './data';
import GenomeMap from './components/GenomeMap';
import LayerToggles from './components/LayerToggles';
import ElementDossier from './components/ElementDossier';
import CulturalDNAExplorer from './components/CulturalDNAExplorer';
import StoryModal from './components/StoryModal';
import TimeSlider from './components/TimeSlider';
import UnknownIndiaDrawer from './components/UnknownIndiaDrawer';
import JourneyPlanner, { CURATED_JOURNEY } from './components/JourneyPlanner';
import CommerceHookModal from './components/CommerceHookModal';
import DemoControlBar, { DataSourcesModal } from './components/DemoControlBar';
import AskTheAtlasSearch from './components/AskTheAtlasSearch';
import FestivalPulse from './components/FestivalPulse';
import { CULTURAL_TYPES, MAP_CENTER_INDIA } from './utils/constants';
import { Compass, Sparkles, Navigation, Layers, Flame, BookOpen, Clock, AlertCircle, Search } from 'lucide-react';

export default function GenomeApp({ onBack = null }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active layers state (all 10 types enabled by default)
  const [activeTypes, setActiveTypes] = useState(
    new Set(Object.keys(CULTURAL_TYPES))
  );

  // Selected cultural element
  const [selectedElement, setSelectedElement] = useState(null);

  // Modes & Overlays
  const [dnaOriginElement, setDnaOriginElement] = useState(null);
  const [activeStory, setActiveStory] = useState(null);
  const [isTimelineActive, setIsTimelineActive] = useState(false);
  const [timelineActiveEvent, setTimelineActiveEvent] = useState(null);
  const [isUnknownIndiaMode, setIsUnknownIndiaMode] = useState(false);
  const [isJourneyActive, setIsJourneyActive] = useState(false);
  const [journeyStopIndex, setJourneyStopIndex] = useState(0);
  const [commerceElement, setCommerceElement] = useState(null);
  const [isSourcesOpen, setIsSourcesOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFestivalPulseOpen, setIsFestivalPulseOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(10); // Default October (Navratri, Durga Puja, Bastar Dussehra)
  const [activeDemoScene, setActiveDemoScene] = useState('1');

  // Load Data on Mount
  useEffect(() => {
    let isMounted = true;
    async function initData() {
      try {
        setLoading(true);
        const genomeData = await loadGenomeData();
        if (isMounted) {
          setData(genomeData);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load cultural genome dataset');
          setLoading(false);
        }
      }
    }
    initData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Element counts per type
  const elementCounts = useMemo(() => {
    if (!data || !data.elements) return {};
    const counts = {};
    data.elements.forEach((el) => {
      counts[el.type] = (counts[el.type] || 0) + 1;
    });
    return counts;
  }, [data]);

  // Relations for DNA Explorer
  const similarityRelations = useMemo(() => {
    if (!data || !dnaOriginElement) return [];
    return getRelatedElements(data, dnaOriginElement.id);
  }, [data, dnaOriginElement]);

  // Stories for selected element
  const currentStories = useMemo(() => {
    if (!data || !selectedElement) return [];
    return getStoriesForElement(data, selectedElement.id);
  }, [data, selectedElement]);

  // Timeline events for Kathak
  const kathakTimeline = useMemo(() => {
    if (!data) return [];
    return getTimelineForTradition(data, 'kathak') || getTimelineForTradition(data, 'kathak-dance');
  }, [data]);

  // Discovery elements (rarity >= 4)
  const discoveryElements = useMemo(() => {
    if (!data) return [];
    return getDiscoveryElements(data, 4);
  }, [data]);

  // Layer Toggle Handlers
  const handleToggleType = useCallback((typeKey) => {
    setActiveTypes((prev) => {
      const next = new Set(prev);
      if (next.has(typeKey)) {
        next.delete(typeKey);
      } else {
        next.add(typeKey);
      }
      return next;
    });
  }, []);

  const handleSelectAllTypes = useCallback(() => {
    setActiveTypes(new Set(Object.keys(CULTURAL_TYPES)));
  }, []);

  const handleClearAllTypes = useCallback(() => {
    setActiveTypes(new Set());
  }, []);

  // Reset to default state
  const handleReset = useCallback(() => {
    setActiveTypes(new Set(Object.keys(CULTURAL_TYPES)));
    setSelectedElement(null);
    setDnaOriginElement(null);
    setActiveStory(null);
    setIsTimelineActive(false);
    setTimelineActiveEvent(null);
    setIsUnknownIndiaMode(false);
    setIsJourneyActive(false);
    setCommerceElement(null);
    setIsSearchOpen(false);
    setIsFestivalPulseOpen(false);
    setActiveDemoScene('1');
  }, []);

  // Trigger Demo Scenes (1-7)
  const handleTriggerScene = useCallback((sceneKey) => {
    if (!data) return;
    setActiveDemoScene(sceneKey);

    switch (sceneKey) {
      case '1': {
        // All layers
        handleReset();
        break;
      }
      case '2': {
        // Select Warli Painting Dossier
        handleReset();
        setActiveDemoScene('2');
        const warli = data.elementsById.get('warli_painting') || data.elementsById.get('warli-painting');
        if (warli) setSelectedElement(warli);
        break;
      }
      case '3': {
        // Cultural DNA Explorer & Heatmap (Hero: Warli)
        handleReset();
        setActiveDemoScene('3');
        const warli = data.elementsById.get('warli_painting') || data.elementsById.get('warli-painting');
        if (warli) {
          setSelectedElement(warli);
          setDnaOriginElement(warli);
        }
        break;
      }
      case '4': {
        // Story Map (Hero: Baba Pithora / Warli)
        handleReset();
        setActiveDemoScene('4');
        const heroWithStory = data.elementsById.get('pithora_painting') || data.elementsById.get('bastar_dussehra') || data.elementsById.get('warli_painting') || data.elementsById.get('warli-painting');
        if (heroWithStory) {
          setSelectedElement(heroWithStory);
          const stories = getStoriesForElement(data, heroWithStory.id);
          if (stories.length > 0) {
            setActiveStory(stories[0]);
          }
        }
        break;
      }
      case '5': {
        // Kathak Timeline Slider
        handleReset();
        setActiveDemoScene('5');
        const kathak = data.elementsById.get('kathak') || data.elementsById.get('kathak-dance');
        if (kathak) {
          setSelectedElement(kathak);
          setIsTimelineActive(true);
        }
        break;
      }
      case '6': {
        // Unknown India (Rarity >= 4)
        handleReset();
        setActiveDemoScene('6');
        setIsUnknownIndiaMode(true);
        const rare = data.elementsById.get('chadar_badar') || data.elementsById.get('kurmi_comb_cut_murals') || data.elementsById.get('saura_art') || data.elementsById.get('rogan-art');
        if (rare) setSelectedElement(rare);
        break;
      }
      case '7': {
        // Curated Journey Route
        handleReset();
        setActiveDemoScene('7');
        setIsJourneyActive(true);
        setJourneyStopIndex(0);
        break;
      }
      case '8': {
        // Festival Pulse Month Selector (Phase 9 Stretch)
        handleReset();
        setActiveDemoScene('8');
        setSelectedMonth(10);
        setIsFestivalPulseOpen(true);
        const fest = data.elementsById.get('navaratri_garba_festival') || data.elementsById.get('durga_puja') || data.elementsById.get('bastar_dussehra');
        if (fest) setSelectedElement(fest);
        break;
      }
      case '9': {
        // Ask the Atlas Smart Search (Phase 9 Stretch)
        handleReset();
        setActiveDemoScene('9');
        setIsSearchOpen(true);
        break;
      }
      default:
        break;
    }
  }, [data, handleReset]);

  // Global Keyboard Shortcuts (1-7 and Escape)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if typing in input
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.key >= '1' && e.key <= '9') {
        handleTriggerScene(e.key);
      } else if (e.key === 'Escape') {
        if (isSearchOpen) setIsSearchOpen(false);
        else if (isFestivalPulseOpen) setIsFestivalPulseOpen(false);
        else if (activeStory) setActiveStory(null);
        else if (commerceElement) setCommerceElement(null);
        else if (isSourcesOpen) setIsSourcesOpen(false);
        else if (dnaOriginElement) setDnaOriginElement(null);
        else if (isTimelineActive) setIsTimelineActive(false);
        else if (isJourneyActive) setIsJourneyActive(false);
        else if (isUnknownIndiaMode) setIsUnknownIndiaMode(false);
        else if (selectedElement) setSelectedElement(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleTriggerScene, isSearchOpen, isFestivalPulseOpen, activeStory, commerceElement, isSourcesOpen, dnaOriginElement, isTimelineActive, isJourneyActive, isUnknownIndiaMode, selectedElement]);

  // Check URL query parameters for ?demo=1
  useEffect(() => {
    if (typeof window !== 'undefined' && data) {
      const params = new URLSearchParams(window.location.search);
      if (params.get('demo') === '1') {
        handleTriggerScene('1');
      }
    }
  }, [data, handleTriggerScene]);

  if (loading) {
    return (
      <div className="w-screen h-screen bg-[#070D1D] flex flex-col items-center justify-center text-slate-300">
        <div className="w-12 h-12 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-base font-black text-white tracking-wide">
          भारत सांस्कृतिक जीनोम मानचित्र लोड हो रहा है...
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Loading 10 Cultural Layers, Survey of India GeoJSON & Living Knowledge Vault
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-screen h-screen bg-[#070D1D] flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
        <h2 className="text-lg font-black text-white">सांस्कृतिक डेटा लोड करने में त्रुटि</h2>
        <p className="text-xs text-red-300 mt-1 max-w-md">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs cursor-pointer"
        >
          पुनः प्रयास करें (Reload)
        </button>
      </div>
    );
  }

  return (
    <div className={`relative ${onBack ? 'w-full h-[88vh] min-h-[720px] rounded-2xl border border-slate-800 shadow-2xl' : 'w-screen h-screen'} overflow-hidden flex flex-col bg-[#070D1D]`}>
      {/* Top Demo & Brand Bar */}
      <DemoControlBar
        isDemoActive={true}
        activeScene={activeDemoScene}
        onTriggerScene={handleTriggerScene}
        onReset={handleReset}
        onOpenSources={() => setIsSourcesOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenFestivalPulse={() => setIsFestivalPulseOpen(!isFestivalPulseOpen)}
        onBack={onBack}
      />

      {/* Main Map Viewport */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        <GenomeMap
          elements={data?.elements || []}
          activeTypes={activeTypes}
          selectedElement={selectedElement}
          onSelectElement={(el) => {
            setSelectedElement(el);
            // If DNA explorer is open, update origin
            if (dnaOriginElement) {
              setDnaOriginElement(el);
            }
          }}
          similarityRelations={similarityRelations}
          journeyRoute={isJourneyActive ? CURATED_JOURNEY : null}
          timelineActiveEvent={timelineActiveEvent}
          isUnknownIndiaMode={isUnknownIndiaMode}
        />

        {/* Floating Top-Left Controls: Layer Toggles */}
        <div className="absolute top-4 left-4 z-20 max-w-md pointer-events-auto">
          <LayerToggles
            activeTypes={activeTypes}
            onToggleType={handleToggleType}
            onSelectAll={handleSelectAllTypes}
            onClearAll={handleClearAllTypes}
            elementCounts={elementCounts}
          />
        </div>

        {/* Floating Mode Switcher Pills (Top Center-Right) */}
        <div className="absolute top-4 right-4 z-20 flex flex-wrap items-center gap-1.5 pointer-events-auto">
          {/* Ask the Atlas Search Pill */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-lg backdrop-blur-md bg-slate-900/90 text-amber-300 border-amber-500/40 hover:bg-slate-800"
            title="परंपरा या स्थान खोजें (Key: 9)"
          >
            <Search className="w-3.5 h-3.5 text-amber-400" />
            <span>एटलस से पूछें (Search)</span>
          </button>

          {/* Festival Pulse Toggle Pill */}
          <button
            onClick={() => setIsFestivalPulseOpen(!isFestivalPulseOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-lg backdrop-blur-md ${
              isFestivalPulseOpen
                ? 'bg-orange-500 text-slate-950 font-black border-orange-400 scale-105'
                : 'bg-slate-900/90 text-orange-300 border-orange-500/40 hover:bg-slate-800'
            }`}
            title="मासिक उत्सव चक्र (Key: 8)"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>उत्सव पल्स (Festivals)</span>
          </button>

          {/* Unknown India Discovery Mode Toggle */}
          <button
            onClick={() => {
              if (isUnknownIndiaMode) {
                setIsUnknownIndiaMode(false);
              } else {
                handleTriggerScene('6');
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-lg backdrop-blur-md ${
              isUnknownIndiaMode
                ? 'bg-orange-500 text-slate-950 font-black border-orange-400 scale-105'
                : 'bg-slate-900/90 text-orange-300 border-orange-500/40 hover:bg-slate-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>अपरिचित भारत (Unknown India)</span>
          </button>

          {/* Curated Journey Route Toggle */}
          <button
            onClick={() => {
              if (isJourneyActive) {
                setIsJourneyActive(false);
              } else {
                handleTriggerScene('7');
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-lg backdrop-blur-md ${
              isJourneyActive
                ? 'bg-emerald-500 text-slate-950 font-black border-emerald-400 scale-105'
                : 'bg-slate-900/90 text-emerald-300 border-emerald-500/40 hover:bg-slate-800'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>सांस्कृतिक यात्रा (Heritage Trail)</span>
          </button>
        </div>

        {/* Floating Side Drawer (Right Side) */}
        <div className="absolute bottom-4 right-4 z-30 pointer-events-auto">
          {/* 1. Cultural DNA Explorer Drawer */}
          {dnaOriginElement && (
            <CulturalDNAExplorer
              originElement={dnaOriginElement}
              relations={similarityRelations}
              onSelectNode={(node) => {
                setSelectedElement(node);
                setDnaOriginElement(node);
              }}
              onClose={() => setDnaOriginElement(null)}
            />
          )}

          {/* 2. Kathak Timeline Slider Drawer */}
          {!dnaOriginElement && isTimelineActive && (
            <TimeSlider
              timelineEvents={kathakTimeline}
              onSelectEvent={(evt) => setTimelineActiveEvent(evt)}
              onClose={() => setIsTimelineActive(false)}
            />
          )}

          {/* 3. Unknown India Discovery Drawer */}
          {!dnaOriginElement && !isTimelineActive && isUnknownIndiaMode && (
            <UnknownIndiaDrawer
              discoveryElements={discoveryElements}
              onSelectElement={(el) => setSelectedElement(el)}
              onClose={() => setIsUnknownIndiaMode(false)}
            />
          )}

          {/* 4. Journey Planner Drawer */}
          {!dnaOriginElement && !isTimelineActive && !isUnknownIndiaMode && isJourneyActive && (
            <JourneyPlanner
              activeStopIndex={journeyStopIndex}
              onSelectStop={(idx, stop) => {
                setJourneyStopIndex(idx);
                const matchedEl = data.elements.find((e) => stop.elements.includes(e.id));
                if (matchedEl) setSelectedElement(matchedEl);
              }}
              onClose={() => setIsJourneyActive(false)}
            />
          )}

          {/* 5. Standard Element Dossier Drawer */}
          {!dnaOriginElement && !isTimelineActive && !isUnknownIndiaMode && !isJourneyActive && selectedElement && (
            <ElementDossier
              element={selectedElement}
              onClose={() => setSelectedElement(null)}
              onOpenDNA={(el) => setDnaOriginElement(el)}
              onOpenStory={(el) => {
                const stories = getStoriesForElement(data, el.id);
                if (stories.length > 0) setActiveStory(stories[0]);
              }}
              onOpenTimeline={(el) => setIsTimelineActive(true)}
              onOpenCommerce={(el) => setCommerceElement(el)}
              hasStory={currentStories.length > 0}
              hasTimeline={selectedElement.id === 'kathak-dance'}
              hasCommerce={['craft', 'textile'].includes(selectedElement.type)}
            />
          )}
        </div>

        {/* Floating Bottom Quick Selection Pills for Key Elements */}
        <div className="absolute bottom-4 left-4 z-20 max-w-sm pointer-events-auto bg-slate-900/85 backdrop-blur-md p-2 rounded-2xl border border-slate-700/60 hidden sm:block">
          <div className="text-[10px] font-black uppercase text-amber-400 tracking-wider mb-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>प्रमुख सांस्कृतिक केंद्र (Quick Focus):</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {['warli-painting', 'kathak-dance', 'rogan-art', 'paithani-saree', 'ellora-caves'].map((id) => {
              const el = data?.elementsById?.get(id);
              if (!el) return null;
              const isSelected = selectedElement?.id === id;
              return (
                <button
                  key={id}
                  onClick={() => setSelectedElement(el)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {el.name_hi}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Ask the Atlas Smart Search (Phase 9 Stretch) */}
      <AskTheAtlasSearch
        elements={data?.elements || []}
        onSelectElement={(el) => setSelectedElement(el)}
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Festival Pulse Month Selector (Phase 9 Stretch) */}
      <FestivalPulse
        elements={data?.elements || []}
        selectedMonth={selectedMonth}
        onSelectMonth={(m) => setSelectedMonth(m)}
        onSelectElement={(el) => setSelectedElement(el)}
        isOpen={isFestivalPulseOpen}
        onClose={() => setIsFestivalPulseOpen(false)}
      />

      {/* Story Map Modal (Phase 4) */}
      {activeStory && (
        <StoryModal
          story={activeStory}
          element={selectedElement}
          onClose={() => setActiveStory(null)}
        />
      )}

      {/* Commerce Hook Modal (Phase 8) */}
      {commerceElement && (
        <CommerceHookModal
          element={commerceElement}
          onClose={() => setCommerceElement(null)}
        />
      )}

      {/* Data & Sources Modal */}
      <DataSourcesModal
        isOpen={isSourcesOpen}
        onClose={() => setIsSourcesOpen(false)}
        elements={data?.elements || []}
        relations={data?.relations || []}
        stories={data?.stories || []}
        timelineEvents={data?.timelineEvents || []}
      />
    </div>
  );
}
