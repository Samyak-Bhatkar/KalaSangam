import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles, Award, Check, ImagePlus, RefreshCw, X, Eye, EyeOff, Edit3,
  MapPin, Play, Pause, Trash2, ShieldCheck, Plus, Sliders, Download,
  Share2, Move, CheckCircle2, ArrowRight, ExternalLink, Tag
} from 'lucide-react';
import { useArtisan } from '../context/ArtisanContext';
import { fetchBackgroundOptions, compositeLifestyleImage, exportAnnotatedImage } from '../services/api';
import FineTuneStudioModal from './FineTuneStudioModal';
import CraftPinVoiceModal from './CraftPinVoiceModal';

export default function StudioReviewCard() {
  const {
    rawImageUrl,
    rawImageBase64,
    studioImageBase64,
    studioImageUrl,
    setStudioImageBase64,
    setStudioImageUrl,
    cutoutBase64,
    setCutoutBase64,
    lifestyleImageUrl,
    setLifestyleImageUrl,
    lifestyleImageBase64,
    setLifestyleImageBase64,
    suggestedBackgroundQuery,
    catalogData,
    selectedPreset,
    language,
    shotAngleInfo,
    anglePhotos,
    activeAngleIndex,
    craftPins = [],
    addCraftPin,
    updateCraftPin,
    deleteCraftPin,
    annotatedImageUrl,
    setAnnotatedImageUrl,
    currentProductId,
  } = useArtisan();

  // Split-Slider Presentation View State: 0 (Buyer Preview) to 100 (Artisan Edit)
  // Default to 50% split comparison so both modes are immediately visible
  const [sliderPosition, setSliderPosition] = useState(50);
  const sliderContainerRef = useRef(null);
  const isDraggingSlider = useRef(false);
  const [containerDimensions, setContainerDimensions] = useState({ width: 340, height: 340 });

  // Manual Drag-to-Rotate Override for Buyer Radial Callouts
  const [activeRotatingPinId, setActiveRotatingPinId] = useState(null);
  const isDraggingRotation = useRef(false);

  // ONDC Flattened JPEG Export State
  const [isExportingOndc, setIsExportingOndc] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportedImageInfo, setExportedImageInfo] = useState(null);
  const [exportError, setExportError] = useState(null);

  // Craft Pins & Tap-to-Annotate State
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [isCraftPinsVisible, setIsCraftPinsVisible] = useState(true);
  const [activePinModal, setActivePinModal] = useState(null);
  const [selectedPinId, setSelectedPinId] = useState(null);
  const [playingAudioUrl, setPlayingAudioUrl] = useState(null);
  const pinAudioRef = useRef(null);

  // Automatic Initial Angle Layout: evenly distribute angles biasing away from canvas edges
  useEffect(() => {
    if (!craftPins || craftPins.length === 0) return;
    const n = craftPins.length;
    craftPins.forEach((pin, idx) => {
      if (typeof pin.label_angle !== 'number' || isNaN(pin.label_angle)) {
        const x = pin.x ?? pin.x_pct ?? 50;
        const y = pin.y ?? pin.y_pct ?? 50;
        let biasAngle = Math.atan2(y - 50, x - 50) * (180 / Math.PI);
        if (biasAngle < 0) biasAngle += 360;
        const spread = (idx * (360 / n) + 35) % 360;
        const assignedAngle = Math.round((spread * 0.7 + biasAngle * 0.3) % 360);
        updateCraftPin(pin.id, { label_angle: assignedAngle });
      }
    });
  }, [craftPins.length]);

  // Measure container dimensions for responsive leader lines and callout positioning
  useEffect(() => {
    const el = sliderContainerRef.current;
    if (!el) return;
    const updateSize = () => {
      if (sliderContainerRef.current) {
        const rect = sliderContainerRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setContainerDimensions({ width: Math.round(rect.width), height: Math.round(rect.height) });
        }
      }
    };
    updateSize();
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          setContainerDimensions({
            width: Math.round(entry.contentRect.width),
            height: Math.round(entry.contentRect.height),
          });
        }
      }
    });
    observer.observe(el);
    window.addEventListener('resize', updateSize);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  // Split-slider drag handlers (reusing the drag mechanic and visual style)
  const handleSliderMove = (clientX) => {
    if (!sliderContainerRef.current || activeRotatingPinId) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(Math.round(pct));
  };

  const handleSliderMouseDown = (e) => {
    if (isAnnotating || activeRotatingPinId) return;
    isDraggingSlider.current = true;
    handleSliderMove(e.clientX);
  };

  const handleSliderMouseMove = (e) => {
    if (isDraggingSlider.current && !activeRotatingPinId) {
      handleSliderMove(e.clientX);
    }
  };

  const handleSliderMouseUp = () => {
    isDraggingSlider.current = false;
  };

  const handleSliderTouchMove = (e) => {
    if (isDraggingSlider.current && !activeRotatingPinId && e.touches.length > 0) {
      handleSliderMove(e.touches[0].clientX);
    }
  };

  // Radial Callout drag-to-rotate handlers
  const startRotatePin = (e, pinId) => {
    e.stopPropagation();
    setActiveRotatingPinId(pinId);
    isDraggingRotation.current = true;
  };

  useEffect(() => {
    if (!activeRotatingPinId) return;

    const handlePointerMove = (e) => {
      if (!isDraggingRotation.current || !sliderContainerRef.current) return;
      const pin = craftPins.find(p => p.id === activeRotatingPinId);
      if (!pin) return;

      const rect = sliderContainerRef.current.getBoundingClientRect();
      const anchorX = rect.left + ((pin.x ?? pin.x_pct ?? 50) / 100) * rect.width;
      const anchorY = rect.top + ((pin.y ?? pin.y_pct ?? 50) / 100) * rect.height;

      const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX);
      const clientY = e.clientY ?? (e.touches && e.touches[0]?.clientY);
      if (clientX === undefined || clientY === undefined) return;

      let deg = Math.atan2(clientY - anchorY, clientX - anchorX) * (180 / Math.PI);
      if (deg < 0) deg += 360;

      // Soft minimum-angle constraint (~25°) gently resisting overlap with other pins
      const MIN_ANGULAR_GAP = 25;
      for (const other of craftPins) {
        if (other.id === pin.id) continue;
        const otherDeg = other.label_angle ?? 0;
        let diff = (deg - otherDeg + 360) % 360;
        if (diff > 180) diff = 360 - diff;
        if (diff < MIN_ANGULAR_GAP) {
          const dir = (deg - otherDeg + 360) % 360 < 180 ? 1 : -1;
          deg = (otherDeg + dir * MIN_ANGULAR_GAP + 360) % 360;
          break;
        }
      }

      updateCraftPin(pin.id, { label_angle: Math.round(deg) });
    };

    const handlePointerUp = () => {
      isDraggingRotation.current = false;
      setActiveRotatingPinId(null);
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [activeRotatingPinId, craftPins, updateCraftPin]);

  // Export Flattened JPEG for ONDC Syndication
  const handleExportOndcImage = async () => {
    try {
      setIsExportingOndc(true);
      setExportError(null);
      const res = await exportAnnotatedImage({
        productId: currentProductId || catalogData?.id || 'CRAFT-ONDC-01',
        imageSrc: studioSrc,
        imageBase64: studioImageBase64 || null,
        pins: craftPins,
        canvasSize: 1080,
      });

      if (res && res.annotated_image_url) {
        setAnnotatedImageUrl(res.annotated_image_url);
        setExportedImageInfo(res);
        setIsExportModalOpen(true);
      }
    } catch (err) {
      console.error('Export ONDC image failed:', err);
      setExportError(err.message || 'Export failed');
    } finally {
      setIsExportingOndc(false);
    }
  };

  const togglePlayPinAudio = (url) => {
    if (!url) return;
    if (pinAudioRef.current) {
      pinAudioRef.current.pause();
    }
    if (playingAudioUrl === url) {
      setPlayingAudioUrl(null);
    } else {
      const audio = new Audio(url);
      pinAudioRef.current = audio;
      setPlayingAudioUrl(url);
      audio.play().catch(e => console.warn('Audio playback notice:', e));
      audio.onended = () => setPlayingAudioUrl(null);
    }
  };

  const handleImageTap = (e) => {
    if (!isAnnotating) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = Math.min(95, Math.max(5, ((e.clientX - rect.left) / rect.width) * 100));
    const yPct = Math.min(95, Math.max(5, ((e.clientY - rect.top) / rect.height) * 100));
    setActivePinModal({
      pinNumber: craftPins.length + 1,
      xPct: Math.round(xPct * 10) / 10,
      yPct: Math.round(yPct * 10) / 10,
      initialPin: null,
    });
  };

  const handlePinClick = (e, pin) => {
    e.stopPropagation();
    if (isAnnotating) {
      setActivePinModal({
        pinNumber: pin.pin_number,
        xPct: pin.x ?? pin.x_pct ?? 50,
        yPct: pin.y ?? pin.y_pct ?? 50,
        initialPin: pin,
      });
    } else {
      setSelectedPinId(selectedPinId === pin.id ? null : pin.id);
    }
  };

  // Fine-Tune modal state
  const [isFineTuneOpen, setIsFineTuneOpen] = useState(false);

  const handleFineTuneApply = async ({
    studioBase64,
    cutoutBase64: newCutout,
    rotationDeg = 0,
  }) => {
    if (studioBase64) {
      setStudioImageBase64(studioBase64);
      setStudioImageUrl(studioBase64);
    }
    if (newCutout) {
      setCutoutBase64(newCutout);
    }
    setLifestyleRotationDeg(rotationDeg);

    // If an active lifestyle background was already chosen, re-composite with updated rotation
    const activeBg = backgroundCandidates.find(o => o.id === selectedBgId);
    if (activeBg) {
      try {
        setIsCompositing(true);
        const compRes = await compositeLifestyleImage({
          backgroundUrl: activeBg.url,
          cutoutBase64: newCutout || effectiveCutout,
          rawImageBase64: rawImageBase64 || rawSrc,
          rotationDeg,
        });
        if (compRes && compRes.lifestyle_url) {
          setCompositeCache(prev => ({
            ...prev,
            [activeBg.id]: {
              url: compRes.lifestyle_url,
              base64: compRes.lifestyle_base64 || compRes.lifestyle_url,
            },
          }));
          setLifestyleImageUrl(compRes.lifestyle_url);
          setLifestyleImageBase64(compRes.lifestyle_base64 || compRes.lifestyle_url);
        }
      } catch (err) {
        console.warn('Re-composite on fine-tune apply failed:', err);
      } finally {
        setIsCompositing(false);
      }
    }
  };

  // Active view tab: 'studio' | 'lifestyle'
  const [activeViewTab, setActiveViewTab] = useState('studio');

  // Lifestyle background picker state
  const [backgroundCandidates, setBackgroundCandidates] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [isCompositing, setIsCompositing] = useState(false);
  const [selectedBgId, setSelectedBgId] = useState(null);
  const [compositeCache, setCompositeCache] = useState({}); // { [bgId]: { url, base64 } }
  const [hasSkipped, setHasSkipped] = useState(false);

  const rawSrc = rawImageBase64 || rawImageUrl || selectedPreset?.raw_image_url || selectedPreset?.sample_image_url || '/terracotta_pot_raw.png';
  const studioSrc = studioImageBase64 || studioImageUrl || selectedPreset?.clean_image_url || '/terracotta_pot_clean.png';
  const effectiveCutout = cutoutBase64 || studioImageBase64 || rawImageBase64 || studioSrc || rawSrc;

  const effectiveQuery = suggestedBackgroundQuery ||
    catalogData?.suggested_background_query ||
    (selectedPreset?.craft_category?.toLowerCase().includes('textile') ? 'silk fabric aesthetic surface' :
      selectedPreset?.craft_category?.toLowerCase().includes('metal') ? 'temple brass courtyard surface' :
        'neutral wooden surface');

  const activeShotInfo = shotAngleInfo ||
    anglePhotos[activeAngleIndex]?.shotAngleInfo ||
    anglePhotos[0]?.shotAngleInfo ||
    { tiltDegrees: 0, shotAngle: 'eye_level', isLifestyleEligible: true };

  // Guardrail: Skip lifestyle background on ambiguous / steep oblique angles (20° - 60°)
  const isLifestyleAllowed = activeShotInfo.isLifestyleEligible && activeShotInfo.shotAngle !== 'angled';

  // Lifestyle background rotation nudge state
  const [lifestyleRotationDeg, setLifestyleRotationDeg] = useState(0);

  // Dominant craft color & palette harmony metadata
  const [dominantColorInfo, setDominantColorInfo] = useState(null);

  // Fetch candidate backgrounds (only if angle is eligible)
  useEffect(() => {
    let isCancelled = false;

    async function loadOptions() {
      if (!isLifestyleAllowed) {
        setBackgroundCandidates([]);
        return;
      }

      setIsLoadingOptions(true);
      try {
        const res = await fetchBackgroundOptions({
          suggestedBackgroundQuery: effectiveQuery,
          limit: 4,
          shotAngle: activeShotInfo.shotAngle,
          tiltDegrees: activeShotInfo.tiltDegrees,
          cutoutBase64: effectiveCutout,
          rawImageBase64: rawImageBase64 || rawSrc,
        });

        if (!isCancelled && res && res.options) {
          setBackgroundCandidates(res.options);

          if (res.dominant_color_hex) {
            setDominantColorInfo({
              hex: res.dominant_color_hex,
              strategy: res.color_pairing_strategy,
              modifier: res.color_modifier,
            });
          }

          // Find recommended option
          const rec = res.options.find(o => o.recommended) || res.options[0];

          // Auto-select recommended option by default
          if (rec && !selectedBgId) {
            setSelectedBgId(rec.id);
          }

          // Auto-trigger live composites for all candidates so artisan sees real previews
          if (effectiveCutout) {
            triggerCompositesForOptions(res.options, effectiveCutout, rec);
          }
        }
      } catch (err) {
        console.warn('Failed to load background options:', err);
      } finally {
        if (!isCancelled) setIsLoadingOptions(false);
      }
    }

    loadOptions();

    return () => {
      isCancelled = true;
    };
  }, [effectiveQuery, effectiveCutout, isLifestyleAllowed, activeShotInfo.shotAngle]);

  // Generate live composites for each background option
  const triggerCompositesForOptions = async (options, cutout, recommendedOption, customRot = lifestyleRotationDeg) => {
    setIsCompositing(true);
    const newCache = { ...compositeCache };

    for (const opt of options) {
      if (newCache[opt.id]) continue;
      try {
        const compRes = await compositeLifestyleImage({
          backgroundUrl: opt.url,
          cutoutBase64: cutout,
          rawImageBase64: rawImageBase64 || rawSrc,
          rotationDeg: customRot,
        });

        if (compRes && compRes.lifestyle_url) {
          const entry = {
            url: compRes.lifestyle_url,
            base64: compRes.lifestyle_base64 || compRes.lifestyle_url,
          };
          newCache[opt.id] = entry;
          setCompositeCache({ ...newCache });

          // If this is the recommended/selected option, immediately populate lifestyle image
          if (opt.id === (selectedBgId || recommendedOption?.id)) {
            setLifestyleImageUrl(compRes.lifestyle_url);
            setLifestyleImageBase64(compRes.lifestyle_base64 || compRes.lifestyle_url);
          }
        }
      } catch (e) {
        console.warn(`Composite failed for ${opt.id}:`, e);
      }
    }
    setIsCompositing(false);
  };

  const handleSelectBackground = async (opt) => {
    if (!opt) return;
    setSelectedBgId(opt.id);
    setHasSkipped(false);
    setActiveViewTab('lifestyle');

    // If already composited in cache, apply immediately
    if (compositeCache[opt.id]) {
      const cached = compositeCache[opt.id];
      setLifestyleImageUrl(cached.url);
      setLifestyleImageBase64(cached.base64);
      return;
    }

    // Otherwise, generate composite now
    setIsCompositing(true);
    try {
      const compRes = await compositeLifestyleImage({
        backgroundUrl: opt.url,
        cutoutBase64: effectiveCutout,
        rawImageBase64: rawImageBase64 || rawSrc,
        rotationDeg: lifestyleRotationDeg,
      });

      if (compRes && compRes.lifestyle_url) {
        setCompositeCache(prev => ({
          ...prev,
          [opt.id]: {
            url: compRes.lifestyle_url,
            base64: compRes.lifestyle_base64 || compRes.lifestyle_url,
          },
        }));
        setLifestyleImageUrl(compRes.lifestyle_url);
        setLifestyleImageBase64(compRes.lifestyle_base64 || compRes.lifestyle_url);
      }
    } catch (err) {
      console.error('Error selecting background:', err);
    } finally {
      setIsCompositing(false);
    }
  };

  const handleSkipOrRemove = () => {
    setSelectedBgId(null);
    setLifestyleImageUrl(null);
    setLifestyleImageBase64(null);
    setHasSkipped(true);
    setActiveViewTab('studio');
  };

  const activeLifestyleDisplay =
    (selectedBgId && compositeCache[selectedBgId]?.base64) ||
    (selectedBgId && compositeCache[selectedBgId]?.url) ||
    lifestyleImageBase64 ||
    lifestyleImageUrl;

  return (
    <div className="w-full rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl">
      {/* Top Banner with Badges & Tab Toggle */}
      <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            {language === 'hi' ? 'एआई स्टूडियो रूपांतरण' : 'Autonomous AI Studio'}
          </span>
        </div>

        {/* View Switcher Tabs (Primary Studio vs Optional Lifestyle) */}
        {isLifestyleAllowed ? (
          <div className="flex items-center gap-1 p-0.5 bg-slate-900 rounded-full border border-slate-800 text-[11px]">
            <button
              onClick={() => setActiveViewTab('studio')}
              className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                activeViewTab === 'studio'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {language === 'hi' ? 'प्राथमिक स्टूडियो' : 'Primary Studio'}
            </button>
            <button
              onClick={() => {
                setActiveViewTab('lifestyle');
                const rec = backgroundCandidates.find(o => o.recommended) || backgroundCandidates[0];
                if (!selectedBgId && rec) {
                  handleSelectBackground(rec);
                } else if (selectedBgId) {
                  const current = backgroundCandidates.find(o => o.id === selectedBgId);
                  if (current && !compositeCache[selectedBgId] && !isCompositing) {
                    handleSelectBackground(current);
                  }
                }
              }}
              disabled={backgroundCandidates.length === 0 && !isLoadingOptions}
              className={`px-3 py-1 rounded-full font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeViewTab === 'lifestyle'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className={`w-3 h-3 ${activeViewTab === 'lifestyle' ? 'text-white' : 'text-amber-400'}`} />
              <span>{language === 'hi' ? 'लाइफस्टाइल (2nd)' : 'Lifestyle (2nd)'}</span>
              {activeLifestyleDisplay && (
                <span className={`w-1.5 h-1.5 rounded-full ${activeViewTab === 'lifestyle' ? 'bg-white' : 'bg-emerald-400'}`} />
              )}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>{language === 'hi' ? 'शुद्ध ई-कॉमर्स स्टूडियो (Amazon 85%)' : 'Pure E-Commerce Studio (Amazon 85%)'}</span>
          </div>
        )}

        {/* GI Tag / MoSJE Badge */}
        {catalogData?.gi_tag_eligible && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-[11px] font-bold text-amber-300">
            <Award className="w-3.5 h-3.5" />
            <span>GI Certified</span>
          </div>
        )}
      </div>

      {/* Main Visual Display: Primary Clean Studio (Split Slider Dual View) or Secondary Lifestyle Preview */}
      {activeViewTab === 'studio' ? (
        <div className="flex flex-col">
          {/* Dual-View Mode Split Slider Toggle Bar */}
          <div className="px-4 py-2 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] font-bold text-slate-300">
                {language === 'hi' ? 'प्रस्तुति मोड:' : 'Presentation View:'}
              </span>
            </div>

            <div className="flex items-center gap-1 p-0.5 bg-slate-900 rounded-full border border-slate-800 text-[11px]">
              <button
                type="button"
                onClick={() => setSliderPosition(100)}
                className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                  sliderPosition >= 80
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {language === 'hi' ? 'कारीगर संपादन' : 'Artisan Edit'}
              </button>
              <button
                type="button"
                onClick={() => setSliderPosition(50)}
                className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                  sliderPosition > 20 && sliderPosition < 80
                    ? 'bg-slate-700 text-amber-300 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {language === 'hi' ? 'स्प्लिट (50/50)' : 'Split (50/50)'}
              </button>
              <button
                type="button"
                onClick={() => setSliderPosition(0)}
                className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                  sliderPosition <= 20
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {language === 'hi' ? 'क्रेता पूर्वावलोकन (ONDC)' : 'Buyer Preview (ONDC)'}
              </button>
            </div>
          </div>

          {/* Interactive Split Slider Container */}
          <div
            ref={sliderContainerRef}
            onMouseDown={handleSliderMouseDown}
            onMouseUp={handleSliderMouseUp}
            onMouseLeave={handleSliderMouseUp}
            onMouseMove={handleSliderMouseMove}
            onTouchMove={handleSliderTouchMove}
            onTouchEnd={handleSliderMouseUp}
            onClick={isAnnotating ? handleImageTap : undefined}
            className={`relative w-full aspect-square max-h-[380px] bg-[#F8F9FA] overflow-hidden select-none ${
              isAnnotating ? 'cursor-crosshair ring-2 ring-amber-400/80 ring-inset' : 'cursor-ew-resize'
            }`}
          >
            {/* ------------------------------------------------------------- */}
            {/* BASE LAYER: BUYER PREVIEW VIEW (Dot + Radial Callout Design)  */}
            {/* ------------------------------------------------------------- */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {/* Product Photo */}
              <img
                src={studioSrc}
                alt="Clean AI Studio Output (Buyer View)"
                className="w-full h-full object-contain p-3 pointer-events-none select-none"
              />

              {/* Top Badge: Buyer Preview (ONDC) */}
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-emerald-500/50 text-emerald-300 text-[10px] font-bold shadow-md flex items-center gap-1.5 pointer-events-none z-10">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>{language === 'hi' ? 'क्रेता दृश्य • ONDC' : 'Buyer Preview • ONDC'}</span>
              </div>

              {/* Leader Lines SVG (Two-Segment Jogged Elbow Lines in #000000) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
                {containerDimensions.width > 0 && craftPins.map((pin) => {
                  const W = containerDimensions.width;
                  const H = containerDimensions.height;
                  const r = Math.max(36, Math.min(54, W * 0.14));
                  const shelfLen = Math.max(18, Math.min(28, W * 0.075));

                  const anchorX = ((pin.x ?? pin.x_pct ?? 50) / 100) * W;
                  const anchorY = ((pin.y ?? pin.y_pct ?? 50) / 100) * H;
                  const angle = pin.label_angle ?? 0;
                  const rad = (angle * Math.PI) / 180;

                  const kneeX = anchorX + r * Math.cos(rad);
                  const kneeY = anchorY + r * Math.sin(rad);

                  const isRight = Math.cos(rad) >= 0;
                  const endX = kneeX + (isRight ? shelfLen : -shelfLen);
                  const endY = kneeY;

                  return (
                    <g key={`buyer-leader-${pin.id}`}>
                      {/* Two-segment jogged elbow callout leader line: diagonal then horizontal shelf */}
                      <path
                        d={`M ${anchorX.toFixed(1)} ${anchorY.toFixed(1)} L ${kneeX.toFixed(1)} ${kneeY.toFixed(1)} L ${endX.toFixed(1)} ${endY.toFixed(1)}`}
                        stroke="#000000"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />
                      {/* Solid black anchor dot */}
                      <circle
                        cx={anchorX}
                        cy={anchorY}
                        r="3.5"
                        fill="#000000"
                        stroke="#000000"
                        strokeWidth="1"
                      />
                      {/* Minimal elbow jog joint dot */}
                      <circle
                        cx={kneeX}
                        cy={kneeY}
                        r="1.5"
                        fill="#000000"
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Radial Callout Cards (Curated Bank Term + One-Line Summary) */}
              <div className="absolute inset-0 pointer-events-auto overflow-hidden">
                {containerDimensions.width > 0 && craftPins.map((pin) => {
                  const W = containerDimensions.width;
                  const H = containerDimensions.height;
                  const r = Math.max(36, Math.min(54, W * 0.14));
                  const shelfLen = Math.max(18, Math.min(28, W * 0.075));
                  const cardWidth = Math.min(128, Math.max(105, W * 0.35));

                  const anchorX = ((pin.x ?? pin.x_pct ?? 50) / 100) * W;
                  const anchorY = ((pin.y ?? pin.y_pct ?? 50) / 100) * H;
                  const angle = pin.label_angle ?? 0;
                  const rad = (angle * Math.PI) / 180;

                  const kneeX = anchorX + r * Math.cos(rad);
                  const kneeY = anchorY + r * Math.sin(rad);

                  const isRight = Math.cos(rad) >= 0;
                  const endX = kneeX + (isRight ? shelfLen : -shelfLen);
                  const endY = kneeY;

                  let cardLeft = isRight ? endX + 4 : endX - cardWidth - 4;
                  cardLeft = Math.max(6, Math.min(W - cardWidth - 6, cardLeft));

                  let cardTop = endY;
                  cardTop = Math.max(24, Math.min(H - 28, cardTop));

                  const isRotating = activeRotatingPinId === pin.id;

                  return (
                    <div
                      key={`buyer-card-${pin.id}`}
                      style={{
                        left: `${cardLeft}px`,
                        top: `${cardTop}px`,
                        width: `${cardWidth}px`,
                        transform: 'translateY(-50%)',
                      }}
                      className={`absolute z-20 transition-all ${
                        isRotating ? 'scale-105 z-30' : ''
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className={`bg-white/95 backdrop-blur-md rounded-xl p-1.5 border shadow-md text-slate-900 select-none ${
                        isRotating ? 'border-amber-400 ring-2 ring-amber-400/40 shadow-lg' : 'border-slate-300'
                      }`}>
                        {/* Header: Curated Bank Term & Rotation Drag Handle */}
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="font-extrabold text-[10px] leading-tight text-slate-950 truncate tracking-tight">
                            {pin.bank_term || pin.short_label_en || pin.short_label}
                          </span>
                          <button
                            type="button"
                            onMouseDown={(e) => startRotatePin(e, pin.id)}
                            onTouchStart={(e) => startRotatePin(e, pin.id)}
                            className={`p-0.5 rounded cursor-grab active:cursor-grabbing hover:bg-slate-100 transition ${
                              isRotating ? 'text-amber-600 bg-amber-50' : 'text-slate-400 hover:text-slate-600'
                            }`}
                            title="Drag to rotate callout angle"
                          >
                            <Move className="w-2.5 h-2.5" />
                          </button>
                        </div>

                        {/* Supporting Sentence */}
                        <p className="text-[8.5px] leading-tight text-slate-600 line-clamp-2">
                          {pin.one_line_summary || pin.full_description_en || pin.full_description}
                        </p>

                        {/* Micro Footprint */}
                        <div className="mt-1 pt-0.5 border-t border-slate-100 flex items-center justify-between text-[7.5px]">
                          <span
                            className={`font-bold px-1 rounded-xs ${
                              pin.category === 'craft_detail'
                                ? 'text-amber-700 bg-amber-50'
                                : 'text-teal-700 bg-teal-50'
                            }`}
                          >
                            {pin.category === 'craft_detail' ? 'Craft Detail' : 'Natural Var.'}
                          </span>
                          <span className="text-slate-400 font-mono">
                            {Math.round(angle)}°
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* TOP CLIPPED LAYER: ARTISAN EDIT VIEW (Numbered Pins & Audio) */}
            {/* ------------------------------------------------------------- */}
            <div
              style={{ width: `${sliderPosition}%` }}
              className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-amber-400 bg-[#F8F9FA] shadow-2xl z-20 transition-[width] duration-75"
            >
              <div
                style={{
                  width: `${containerDimensions.width}px`,
                  height: `${containerDimensions.height}px`,
                }}
                className="relative flex items-center justify-center pointer-events-auto"
              >
                {/* Product Photo */}
                <img
                  src={studioSrc}
                  alt="Clean AI Studio Output (Artisan View)"
                  className="w-full h-full object-contain p-3 pointer-events-none select-none"
                />

                {/* Top Badge: Artisan Edit Mode */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-amber-500/50 text-amber-300 text-[10px] font-bold shadow-md flex items-center gap-1.5 pointer-events-none z-10">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  <span>{language === 'hi' ? 'कारीगर संपादन' : 'Artisan Edit'}</span>
                </div>

                {/* Numbered Artisan Gradient Pins (1, 2, 3...) */}
                {(isCraftPinsVisible || isAnnotating) &&
                  craftPins.map((pin) => (
                    <div
                      key={`artisan-pin-${pin.id}`}
                      onClick={(e) => handlePinClick(e, pin)}
                      style={{
                        left: `${pin.x ?? pin.x_pct ?? 50}%`,
                        top: `${pin.y ?? pin.y_pct ?? 50}%`,
                      }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-30 transition-all ${
                        selectedPinId === pin.id ? 'scale-125 z-40' : 'hover:scale-110'
                      }`}
                      title={pin.short_label_hi || pin.short_label}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shadow-lg border-2 border-white transition-all ${
                          pin.category === 'craft_detail'
                            ? 'bg-gradient-to-tr from-amber-600 to-amber-400 text-white ring-2 ring-amber-300/80 shadow-amber-900/30'
                            : 'bg-gradient-to-tr from-teal-700 to-teal-500 text-white ring-2 ring-teal-300/80 shadow-teal-900/30'
                        }`}
                      >
                        {pin.pin_number}
                      </div>

                      {/* Compact Tooltip when pin is active/selected */}
                      {selectedPinId === pin.id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 w-48 bg-slate-900/95 backdrop-blur-md text-white text-[10px] p-2.5 rounded-xl shadow-2xl border border-slate-700 z-50 animate-fadeIn"
                        >
                          <div className="font-bold flex items-center gap-1 mb-1 text-amber-300">
                            {pin.category === 'craft_detail' ? (
                              <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                            ) : (
                              <ShieldCheck className="w-3 h-3 text-teal-400 shrink-0" />
                            )}
                            <span className="truncate">{pin.short_label_hi || pin.short_label}</span>
                          </div>
                          <p className="text-slate-300 text-[9px] line-clamp-2 leading-tight">
                            {pin.full_description_hi || pin.full_description}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            {/* Slider Handle (Matches StudioQualityReviewModal mechanics and visual style) */}
            <div
              style={{ left: `${sliderPosition}%` }}
              onMouseDown={handleSliderMouseDown}
              onTouchStart={handleSliderMouseDown}
              className="absolute inset-y-0 -ml-4 flex items-center justify-center pointer-events-auto cursor-ew-resize z-30"
              title="Drag slider to compare Artisan Edit vs Buyer Preview"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 border-2 border-slate-950 shadow-xl flex items-center justify-center text-slate-950 hover:scale-110 active:scale-95 transition-transform">
                <Sliders className="w-4 h-4 rotate-90" />
              </div>
            </div>

            {/* Tap-to-Annotate Instruction Overlay */}
            {isAnnotating && (
              <div className="absolute top-2 inset-x-2 z-40 px-3 py-1.5 rounded-xl bg-amber-600/95 backdrop-blur-md text-white text-xs font-bold shadow-lg flex items-center justify-between animate-fadeIn pointer-events-auto">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 animate-bounce" />
                  <span>
                    {language === 'hi'
                      ? 'फोटो पर किसी भी स्थान पर टैप करके विवरण जोड़ें'
                      : 'Tap anywhere on photo to drop a detail pin'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAnnotating(false);
                  }}
                  className="px-2.5 py-0.5 rounded-lg bg-white/20 hover:bg-white/30 text-[11px] font-extrabold cursor-pointer transition"
                >
                  {language === 'hi' ? 'पूरा हुआ (Done)' : 'Done'}
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Secondary Lifestyle Preview Screen */
        <div className="relative w-full aspect-square max-h-[340px] bg-slate-950 overflow-hidden flex items-center justify-center select-none">
          {activeLifestyleDisplay ? (
            <img
              src={activeLifestyleDisplay}
              alt="Lifestyle Contextual Render"
              className="w-full h-full object-cover transition-all duration-300"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 text-slate-400 p-6 text-center">
              <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
              <p className="text-xs font-semibold text-slate-300">
                {language === 'hi' ? 'लाइफस्टाइल दृश्य तैयार किया जा रहा है...' : 'Compositing lifestyle scene...'}
              </p>
            </div>
          )}
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-amber-400/40 text-amber-300 text-[10px] font-extrabold shadow-md flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'hi' ? 'वैकल्पिक द्वितीयक लाइफस्टाइल शॉट' : 'Optional Secondary Lifestyle Shot'}</span>
          </div>

          <div className="absolute bottom-3 inset-x-3 px-3 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800 text-[10px] text-slate-300 flex items-center justify-between">
            <span className="truncate">
              {language === 'hi' ? 'प्राथमिक कैटलॉग फोटो तटस्थ स्टूडियो रहेगी' : 'Primary image remains neutral studio'}
            </span>
            <button
              onClick={() => setActiveViewTab('studio')}
              className="text-amber-400 hover:text-amber-300 font-bold ml-2 shrink-0 cursor-pointer"
            >
              {language === 'hi' ? 'स्टूडियो देखें →' : 'View Studio →'}
            </button>
          </div>
        </div>
      )}

      {/* Secondary Action Bar (Fine-Tune, Add Details, View Craft Details, Export for ONDC) */}
      <div className="px-4 py-2.5 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-medium text-slate-300">
            {language === 'hi' ? 'स्वच्छ 4K स्टूडियो परिणाम' : 'Clean 4K Studio Result'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Export for ONDC Syndication Button */}
          <button
            type="button"
            onClick={handleExportOndcImage}
            disabled={isExportingOndc}
            className="min-h-[42px] px-3 py-1.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border border-emerald-400/50 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 disabled:opacity-60"
            title="Export flattened JPEG with technical callouts burned in for ONDC Beckn v1.2"
          >
            {isExportingOndc ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Share2 className="w-3.5 h-3.5" />
            )}
            <span>
              {language === 'hi' ? 'ONDC एक्सपोर्ट' : 'Export for ONDC'}
            </span>
          </button>

          {/* View Craft Details Toggle Button */}
          <button
            type="button"
            onClick={() => {
              setIsCraftPinsVisible(!isCraftPinsVisible);
              if (!isCraftPinsVisible) {
                setActiveViewTab('studio');
              }
            }}
            className={`min-h-[42px] px-3 py-1.5 rounded-2xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 ${
              isCraftPinsVisible
                ? 'bg-amber-500/20 border-amber-400/80 text-amber-300'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            {isCraftPinsVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>
              {language === 'hi'
                ? (isCraftPinsVisible ? 'विवरण छुपाएं' : 'शिल्प विवरण देखें')
                : (isCraftPinsVisible ? 'Hide Details' : 'View Craft Details')}
              {craftPins.length > 0 && ` (${craftPins.length})`}
            </span>
          </button>

          {/* Add Details (Tap-to-Annotate) Secondary Button */}
          <button
            type="button"
            onClick={() => {
              setIsAnnotating(!isAnnotating);
              setIsCraftPinsVisible(true);
              setActiveViewTab('studio');
              if (!isAnnotating) setSliderPosition(100); // Switch to Artisan view so pin dropping is visible
            }}
            className={`min-h-[42px] px-3 py-1.5 rounded-2xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 ${
              isAnnotating
                ? 'bg-emerald-600 border-emerald-400 text-white'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-700 hover:border-amber-400/60 text-amber-300 hover:text-amber-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>
              {isAnnotating
                ? (language === 'hi' ? '✓ पूरा हुआ' : '✓ Done')
                : (language === 'hi' ? 'विवरण जोड़ें' : 'Add Details')}
            </span>
          </button>

          {/* Fine-Tune Button */}
          <button
            type="button"
            onClick={() => setIsFineTuneOpen(true)}
            className="min-h-[42px] px-3 py-1.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-400/60 text-amber-300 hover:text-amber-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'hi' ? 'सुधारें' : 'Fine-Tune'}</span>
          </button>
        </div>
      </div>

      {/* Enhancement summary chips */}
      <div className="p-3 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-around text-[11px] text-slate-400">
        <span className="flex items-center gap-1 text-slate-300">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          {language === 'hi' ? 'डीब्लर व शार्पनिंग' : 'AI Deblur & Clarity'}
        </span>
        <span className="flex items-center gap-1 text-slate-300">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          {language === 'hi' ? 'स्वच्छ बैकग्राउंड' : 'Clean Studio BG'}
        </span>
        <span className="flex items-center gap-1 text-slate-300">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          {language === 'hi' ? '6500K लाइटिंग' : '6500K Lighting'}
        </span>
      </div>

      {/* ==================================================================== */}
      {/* CRAFT HONESTY & AUTHENTICITY PINS LIST (EXPANDABLE DETAILS)          */}
      {/* ==================================================================== */}
      {(isCraftPinsVisible || isAnnotating) && (
        <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-200 flex items-center gap-1.5">
                  <span>{language === 'hi' ? 'शिल्प विवरण व प्रामाणिकता बिंदु' : 'Craft Honesty & Authenticity Pins'}</span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                    {craftPins.length} {language === 'hi' ? 'बिंदु' : 'Pins'}
                  </span>
                </h4>
                <p className="text-[10px] text-slate-400">
                  {language === 'hi'
                    ? 'हस्तनिर्मित बारीकियां व प्राकृतिक विशेषताएं (पारदर्शिता = ग्राहक विश्वास)'
                    : 'Disclosed handcraft traits & natural variations build buyer trust'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsAnnotating(true);
                setIsCraftPinsVisible(true);
                setActiveViewTab('studio');
              }}
              className="px-2.5 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-bold border border-amber-400/40 flex items-center gap-1 transition cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>{language === 'hi' ? 'नया बिंदु' : 'Add Pin'}</span>
            </button>
          </div>

          {craftPins.length === 0 ? (
            <div className="p-4 rounded-2xl bg-slate-900 border border-dashed border-slate-700 text-center text-slate-400 space-y-2">
              <p className="text-xs font-medium">
                {language === 'hi'
                  ? 'कोई विवरण बिंदु नहीं जोड़ा गया है। ऊपर "विवरण जोड़ें" दबाकर फोटो पर किसी स्थान पर टैप करें।'
                  : 'No detail pins added yet. Tap "Add Details" and tap anywhere on the studio image.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {craftPins.map((pin) => (
                <div
                  key={pin.id}
                  onClick={() => setSelectedPinId(selectedPinId === pin.id ? null : pin.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    selectedPinId === pin.id
                      ? 'bg-slate-900 border-amber-400/60 shadow-md'
                      : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs shrink-0 text-white shadow ${
                          pin.category === 'craft_detail'
                            ? 'bg-gradient-to-tr from-amber-600 to-amber-400'
                            : 'bg-gradient-to-tr from-teal-700 to-teal-500'
                        }`}
                      >
                        {pin.pin_number}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          <span className="font-bold text-xs text-slate-100 truncate">
                            {pin.short_label_hi || pin.short_label}
                          </span>
                          {/* Curated English Bank Term Pill */}
                          {pin.bank_term && (
                            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700 flex items-center gap-1">
                              <Tag className="w-2.5 h-2.5 text-amber-400" />
                              <span>{pin.bank_term}</span>
                            </span>
                          )}
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                              pin.category === 'craft_detail'
                                ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                                : 'bg-teal-500/10 text-teal-300 border border-teal-500/30'
                            }`}
                          >
                            {pin.category === 'craft_detail' ? (
                              <>
                                <Sparkles className="w-2.5 h-2.5" />
                                <span>{language === 'hi' ? 'कारीगरी खूबी' : 'Craft Detail'}</span>
                              </>
                            ) : (
                              <>
                                <ShieldCheck className="w-2.5 h-2.5" />
                                <span>{language === 'hi' ? 'प्राकृतिक भिन्नता' : 'Natural Variation'}</span>
                              </>
                            )}
                          </span>
                          {typeof pin.label_angle === 'number' && (
                            <span className="text-[9px] font-mono text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                              📐 {Math.round(pin.label_angle)}°
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 text-[11px] leading-relaxed mb-1">
                          {pin.full_description_hi || pin.full_description}
                        </p>
                        {pin.one_line_summary && (
                          <p className="text-[10px] text-slate-300 italic bg-slate-950/70 px-2.5 py-1 rounded-lg border border-slate-800/80 leading-tight">
                            "{pin.one_line_summary}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {pin.audio_url && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePlayPinAudio(pin.audio_url);
                          }}
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition ${
                            playingAudioUrl === pin.audio_url
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-800 hover:bg-slate-700 text-amber-400'
                          }`}
                          title="Play artisan voice"
                        >
                          {playingAudioUrl === pin.audio_url ? (
                            <Pause className="w-3.5 h-3.5" />
                          ) : (
                            <Play className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActivePinModal({
                            pinNumber: pin.pin_number,
                            xPct: pin.x ?? pin.x_pct ?? 50,
                            yPct: pin.y ?? pin.y_pct ?? 50,
                            initialPin: pin,
                          });
                        }}
                        className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition"
                        title="Edit pin"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCraftPin(pin.id);
                        }}
                        className="w-7 h-7 rounded-full bg-slate-800 hover:bg-red-950/60 text-slate-400 hover:text-red-400 flex items-center justify-center transition"
                        title="Delete pin"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* OPTIONAL STEP: CHOOSE A BACKGROUND SETTING (STOCK PHOTOS COMPOSITE)  */}
      {/* Guardrail: Only surfaced if camera angle is eligible (eye_level or flat_lay) */}
      {/* ==================================================================== */}
      {isLifestyleAllowed && (
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 space-y-3">
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                <ImagePlus className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-200 flex items-center gap-1.5">
                  <span>{language === 'hi' ? 'एक पृष्ठभूमि सेटिंग चुनें (वैकल्पिक)' : 'Choose a Background Setting (Optional)'}</span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                    ₹0 Free Stock
                  </span>
                </h4>
                <p className="text-[10px] text-slate-400">
                  {language === 'hi'
                    ? 'आपकी आवाज़ के विवरण से मेल खाती वास्तविक लाइफस्टाइल तस्वीर'
                    : 'Realistic contextual shot matching your spoken craft description'}
                </p>
              </div>
            </div>

            {/* Skip / Remove Option */}
            {(selectedBgId || activeLifestyleDisplay) ? (
              <button
                onClick={handleSkipOrRemove}
                className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-bold border border-slate-700 flex items-center gap-1 transition-all cursor-pointer"
              >
                <X className="w-3 h-3 text-rose-400" />
                <span>{language === 'hi' ? 'हटाएं' : 'Remove'}</span>
              </button>
            ) : (
              <button
                onClick={handleSkipOrRemove}
                className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-[11px] font-bold border border-slate-700/60 transition-all cursor-pointer"
              >
                {language === 'hi' ? 'छोड़ें (Skip)' : 'Skip'}
              </button>
            )}
          </div>

          {/* Suggested Query, Perspective Pill & Color Harmony Pill */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800/80 flex-wrap gap-1">
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-amber-400 font-extrabold uppercase text-[9px] tracking-wider">
                {language === 'hi' ? 'सुझाया गया परिवेश:' : 'Detected Setting:'}
              </span>
              <span className="text-slate-200 font-medium italic truncate">"{effectiveQuery}"</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
              {dominantColorInfo?.hex && (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full border border-white/20 inline-block shrink-0 shadow-xs"
                    style={{ backgroundColor: dominantColorInfo.hex }}
                    title={`Dominant Color: ${dominantColorInfo.hex}`}
                  />
                  <span className="capitalize text-amber-300 font-medium">
                    {dominantColorInfo.strategy === 'complementary'
                      ? (language === 'hi' ? 'विरोधी रंग (Pop)' : 'Complementary')
                      : dominantColorInfo.strategy === 'analogous'
                      ? (language === 'hi' ? 'समान रंग (Harmonious)' : 'Analogous')
                      : (language === 'hi' ? 'तटस्थ (Neutral)' : 'Neutral')}
                  </span>
                </span>
              )}
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-amber-400/30">
                {activeShotInfo.shotAngle === 'flat_lay'
                  ? (language === 'hi' ? '📐 फ़्लैट ले (Top View)' : '📐 Top View / Flat Lay')
                  : (language === 'hi' ? '📐 सामने से (Eye Level)' : '📐 Eye Level / Front')}
              </span>
              {isCompositing && (
                <span className="flex items-center gap-1 text-amber-400 text-[9px]">
                  <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                  <span>कंपोज़िटिंग...</span>
                </span>
              )}
            </div>
          </div>

          {/* Background Candidate Cards Grid */}
          {isLoadingOptions && backgroundCandidates.length === 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-4">
              {[1, 2, 3, 4].map(idx => (
                <div
                  key={idx}
                  className="aspect-square rounded-2xl bg-slate-900/80 border border-slate-800 animate-pulse flex items-center justify-center"
                >
                  <div className="w-5 h-5 border-2 border-slate-700 border-t-amber-400 rounded-full animate-spin" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {backgroundCandidates.map((opt) => {
                const isSelected = selectedBgId === opt.id || (!selectedBgId && opt.recommended);
                const previewSrc = compositeCache[opt.id]?.base64 || compositeCache[opt.id]?.url || opt.thumbnail_url;

                return (
                  <div
                    key={opt.id}
                    onClick={() => handleSelectBackground(opt)}
                    className={`group relative aspect-square rounded-2xl overflow-hidden cursor-pointer border-2 transition-all duration-200 active:scale-95 ${
                      isSelected
                        ? 'border-emerald-400 ring-3 ring-emerald-400/30 shadow-xl shadow-emerald-500/20 scale-[1.02]'
                        : 'border-slate-800 hover:border-slate-600 bg-slate-900/60'
                    }`}
                  >
                    {/* Background Image / Live Composited Preview */}
                    <img
                      src={previewSrc}
                      alt={opt.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Recommended Badge */}
                    {opt.recommended && (
                      <div className="absolute top-1.5 left-1.5 z-10 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 text-slate-950 font-black text-[9px] shadow-lg flex items-center gap-1 tracking-tight">
                        <Sparkles className="w-2.5 h-2.5 stroke-[3]" />
                        <span>{language === 'hi' ? 'अनुशंसित' : 'Recommended'}</span>
                      </div>
                    )}

                    {/* Selected Active Checkmark */}
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 z-10 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg border border-white/20">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}

                    {/* Loading spinner overlay while generating this specific composite */}
                    {isCompositing && !compositeCache[opt.id] && (
                      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center">
                        <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
                      </div>
                    )}

                    {/* Card Title Label */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent p-1.5 text-center">
                      <span className="text-[10px] font-bold text-slate-200 block truncate">
                        {opt.title}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Selection Status Note */}
          {activeLifestyleDisplay && !hasSkipped ? (
            <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-[11px] text-emerald-300">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  {language === 'hi'
                    ? 'लाइफस्टाइल फोटो कैटलॉग में द्वितीयक छवि के रूप में संलग्न है।'
                    : 'Lifestyle photo attached as optional 2nd catalog image.'}
                </span>
              </span>
              <button
                onClick={() => setActiveViewTab('lifestyle')}
                className="text-amber-300 hover:text-amber-200 font-bold underline cursor-pointer shrink-0 ml-2"
              >
                {language === 'hi' ? 'बड़ा देखें' : 'View Full'}
              </button>
            </div>
          ) : hasSkipped ? (
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-[10px] text-slate-400 text-center">
              {language === 'hi'
                ? 'लाइफस्टाइल फोटो छोड़ दी गई है। केवल स्वच्छ प्राथमिक स्टूडियो फोटो का उपयोग किया जाएगा।'
                : 'Lifestyle shot skipped. Only the primary clean studio shot will be used.'}
            </div>
          ) : null}
        </div>
      )}

      {/* Fine-Tune Slide-Up Modal */}
      <FineTuneStudioModal
        isOpen={isFineTuneOpen}
        onClose={() => setIsFineTuneOpen(false)}
        initialStudioSrc={studioSrc}
        initialCutoutSrc={effectiveCutout}
        rawSrc={rawSrc}
        initialRotationDeg={lifestyleRotationDeg}
        onApply={handleFineTuneApply}
      />

      {/* Craft Pin Voice Modal */}
      {activePinModal && (
        <CraftPinVoiceModal
          pinNumber={activePinModal.pinNumber}
          xPct={activePinModal.xPct}
          yPct={activePinModal.yPct}
          initialPin={activePinModal.initialPin}
          language={language}
          categoryHint={catalogData?.craft_category || selectedPreset?.craft_category || 'Terracotta Pottery'}
          onSavePin={(savedPin) => {
            if (activePinModal.initialPin) {
              updateCraftPin(activePinModal.initialPin.id, savedPin);
            } else {
              addCraftPin(savedPin);
            }
            setActivePinModal(null);
            setIsCraftPinsVisible(true);
          }}
          onDeletePin={(pinId) => {
            deleteCraftPin(pinId);
            setActivePinModal(null);
          }}
          onClose={() => setActivePinModal(null)}
        />
      )}

      {/* ONDC Flattened JPEG Export Preview Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <span>{language === 'hi' ? 'ONDC ई-कॉमर्स एक्सपोर्ट तैयार' : 'ONDC E-Commerce Export Ready'}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30">
                      JPEG 1080p
                    </span>
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    {language === 'hi'
                      ? 'ठोस काली लाइनों (#000000) व लेबल कार्ड के साथ सिंडिकेशन छवि'
                      : 'Flattened 1080x1080 JPEG with burned-in #000000 technical callouts'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Image Preview */}
            <div className="p-4 flex flex-col items-center gap-3 overflow-y-auto">
              <div className="relative w-full aspect-square max-w-[340px] rounded-2xl overflow-hidden border border-slate-700 bg-white shadow-xl flex items-center justify-center">
                <img
                  src={exportedImageInfo?.annotated_image_url || annotatedImageUrl}
                  alt="Flattened ONDC Export"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Specs Grid */}
              <div className="w-full grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300">
                  <span className="text-slate-400 text-[10px] block font-bold">फॉर्मेट (Format):</span>
                  <span className="font-bold text-emerald-400">JPEG (E-Commerce Standard)</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300">
                  <span className="text-slate-400 text-[10px] block font-bold">सिंडिकेशन (Syndication):</span>
                  <span className="font-bold text-amber-400">Beckn v1.2 Catalog Ready</span>
                </div>
              </div>

              <div className="w-full p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-emerald-300 text-[11px] flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  {language === 'hi'
                    ? 'यह छवि ONDC Beckn पेलोड में तृतीयक सिंडिकेशन फोटो के रूप में संलग्न है।'
                    : 'Attached to Beckn catalog payload as third syndication image.'}
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-2">
              <a
                href={exportedImageInfo?.annotated_image_url || annotatedImageUrl}
                download={`shilpsetu_${currentProductId || 'craft'}_annotated.jpg`}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-700"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'डाउनलोड करें' : 'Download JPEG'}</span>
              </a>
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer shadow-md"
              >
                {language === 'hi' ? 'संपन्न (Done)' : 'Done'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
