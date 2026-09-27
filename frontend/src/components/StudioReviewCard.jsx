import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles, Award, Check, ImagePlus, RefreshCw, X, Eye, EyeOff, Edit3,
  MapPin, Play, Pause, Trash2, ShieldCheck, Plus, Sliders, Download,
  Share2, Move, CheckCircle2, ArrowRight, ExternalLink, Tag,
  ZoomIn, ChevronLeft, ChevronRight, Loader2, Mic
} from 'lucide-react';
import { useArtisan } from '../context/ArtisanContext';
import { fetchBackgroundOptions, compositeLifestyleImage, exportAnnotatedImage } from '../services/api';
import FineTuneStudioModal from './FineTuneStudioModal';
import CraftPinVoiceModal from './CraftPinVoiceModal';

export default function StudioReviewCard({ activeSubStep = null }) {
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

  // Custom Voice & Text Prompt Staging State
  const [activeSearchedQuery, setActiveSearchedQuery] = useState(null);
  const [customPromptText, setCustomPromptText] = useState('');
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const recognitionRef = useRef(null);

  // Initialize SpeechRecognition for Voice Staging Prompts
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognizer = new SpeechRecognition();
      recognizer.continuous = false;
      recognizer.interimResults = true;
      recognizer.lang = language === 'en' ? 'en-IN' : 'hi-IN';

      recognizer.onresult = (event) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setCustomPromptText(transcript);
      };

      recognizer.onend = () => {
        setIsVoiceListening(false);
      };

      recognizer.onerror = (err) => {
        console.warn('Voice recognition error:', err);
        setIsVoiceListening(false);
      };

      recognitionRef.current = recognizer;
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, [language]);

  const toggleVoiceListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition && !recognitionRef.current) {
      alert(language === 'hi' ? 'माइक्रोफ़ोन इस ब्राउज़र में समर्थित नहीं है। कृपया टाइप करें।' : 'Speech recognition not supported in this browser. Please type.');
      return;
    }

    if (isVoiceListening) {
      try { recognitionRef.current?.stop(); } catch (e) {}
      setIsVoiceListening(false);
      if (customPromptText.trim()) {
        handleTriggerCustomBackgroundSearch(customPromptText.trim());
      }
    } else {
      try {
        setCustomPromptText('');
        recognitionRef.current?.start();
        setIsVoiceListening(true);
      } catch (err) {
        console.warn('Error starting speech recognition:', err);
        setIsVoiceListening(false);
      }
    }
  };

  const handleTriggerCustomBackgroundSearch = async (queryText) => {
    const q = (queryText || customPromptText || '').trim();
    if (!q) return;

    setActiveSearchedQuery(q);
    setIsLoadingOptions(true);
    try {
      const res = await fetchBackgroundOptions({
        suggestedBackgroundQuery: q,
        limit: 4,
        shotAngle: activeShotInfo.shotAngle,
        tiltDegrees: activeShotInfo.tiltDegrees,
        cutoutBase64: effectiveCutout,
        rawImageBase64: rawImageBase64 || rawSrc,
      });

      if (res && res.options && res.options.length > 0) {
        setBackgroundCandidates(res.options);
        const top = res.options[0];
        setSelectedBgId(top.id);
        if (effectiveCutout) {
          triggerCompositesForOptions(res.options, effectiveCutout, top);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch custom background options:', err);
    } finally {
      setIsLoadingOptions(false);
    }
  };

  const rawSrc = rawImageBase64 || rawImageUrl || selectedPreset?.raw_image_url || selectedPreset?.sample_image_url || '/terracotta_pot_raw.png';
  const studioSrc = studioImageBase64 || studioImageUrl || selectedPreset?.clean_image_url || '/terracotta_pot_clean.png';
  const effectiveCutout = cutoutBase64 || studioImageBase64 || rawImageBase64 || studioSrc || rawSrc;

  const effectiveQuery = activeSearchedQuery ||
    suggestedBackgroundQuery ||
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

  // Synchronize view tab with activeSubStep pagination
  useEffect(() => {
    if (activeSubStep === 2) {
      setActiveViewTab('lifestyle');
      if (backgroundCandidates.length > 0 && !selectedBgId) {
        const rec = backgroundCandidates.find(o => o.recommended) || backgroundCandidates[0];
        if (rec) handleSelectBackground(rec);
      }
    } else if (activeSubStep === 1) {
      setActiveViewTab('studio');
    }
  }, [activeSubStep, backgroundCandidates.length, selectedBgId]);

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

  // Carousel State for Step 2 (Lifestyle Staging comparison - 1 Clean Studio + 3 Suggested Backgrounds)
  const [selectedCarouselIndex, setSelectedCarouselIndex] = useState(1);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const cleanStudioImg = studioImageUrl || studioImageBase64 || cutoutBase64 || cutoutUrl || rawImageUrl;

  // Assemble the 4 comparison images: 1 clean studio + up to 3 suggested backgrounds
  const carouselImages = React.useMemo(() => {
    const list = [
      {
        id: 'clean_studio',
        type: 'studio',
        title: language === 'hi' ? 'स्वच्छ 4K स्टूडियो' : 'Clean 4K Studio',
        badge: language === 'hi' ? 'स्वच्छ स्टूडियो' : 'CLEAN STUDIO',
        tabLabel: language === 'hi' ? 'स्वच्छ स्टूडियो' : 'Clean Studio',
        src: cleanStudioImg,
        candidate: null,
        isCompositing: false,
      },
    ];

    const candidates = (backgroundCandidates || []).slice(0, 4);
    candidates.forEach((opt, idx) => {
      const comp = compositeCache[opt.id];
      const src = comp?.base64 || comp?.url || opt.thumbnail_url || opt.url;
      list.push({
        id: opt.id,
        type: 'lifestyle',
        title: opt.title,
        badge: opt.title || (language === 'hi' ? `परिवेश ${idx + 1}` : `SETTING ${idx + 1}`),
        tabLabel: opt.title ? (opt.title.length > 10 ? opt.title.slice(0, 10) + '..' : opt.title) : (language === 'hi' ? `परिवेश ${idx + 1}` : `Option ${idx + 1}`),
        src: src,
        candidate: opt,
        isCompositing: isCompositing && !comp,
      });
    });

    if (list.length < 5 && isLoadingOptions) {
      for (let i = list.length; i < 5; i++) {
        list.push({
          id: `placeholder_${i}`,
          type: 'placeholder',
          title: language === 'hi' ? `परिवेश ${i}` : `Setting ${i}`,
          badge: language === 'hi' ? 'लोड हो रहा है...' : 'LOADING...',
          tabLabel: language === 'hi' ? `परिवेश ${i}` : `Option ${i}`,
          src: null,
          candidate: null,
          isCompositing: true,
        });
      }
    }

    return list;
  }, [cleanStudioImg, backgroundCandidates, compositeCache, isCompositing, isLoadingOptions, language]);

  // Synchronize carousel selection with current background choice
  useEffect(() => {
    if (activeSubStep === 2) {
      if (selectedBgId) {
        const found = backgroundCandidates.slice(0, 4).findIndex(o => o.id === selectedBgId);
        if (found !== -1) {
          setSelectedCarouselIndex(found + 1);
        }
      } else if (activeViewTab === 'studio') {
        setSelectedCarouselIndex(0);
      }
    }
  }, [activeSubStep, selectedBgId, backgroundCandidates, activeViewTab]);

  const handleSelectCarouselIndex = (index) => {
    if (index < 0 || index >= carouselImages.length) return;
    setSelectedCarouselIndex(index);
    const item = carouselImages[index];
    if (!item) return;

    if (item.type === 'studio') {
      setSelectedBgId(null);
      setLifestyleImageUrl(null);
      setLifestyleImageBase64(null);
      setActiveViewTab('studio');
    } else if (item.candidate) {
      handleSelectBackground(item.candidate);
    }
  };

  const handlePrevCarouselImage = () => {
    if (carouselImages.length === 0) return;
    const prev = (selectedCarouselIndex - 1 + carouselImages.length) % carouselImages.length;
    handleSelectCarouselIndex(prev);
  };

  const handleNextCarouselImage = () => {
    if (carouselImages.length === 0) return;
    const next = (selectedCarouselIndex + 1) % carouselImages.length;
    handleSelectCarouselIndex(next);
  };

  return (
    <div className="w-full rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl">
      {/* Top Banner with Badges & Tab Toggle */}
      <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            {activeSubStep === 2
              ? (language === 'hi' ? 'चरण 2: पृष्ठभूमि चयन (Lifestyle Staging)' : 'Step 2: Lifestyle Staging')
              : activeSubStep === 1
              ? (language === 'hi' ? 'चरण 1: शिल्प प्रामाणिकता (The Voice Canvas)' : 'Step 1: The Voice Canvas')
              : (language === 'hi' ? 'एआई स्टूडियो रूपांतरण' : 'Autonomous AI Studio')}
          </span>
        </div>

        {/* Right Controls: In Step 2, DO NOT show Image 3 tab bar; only show GI Tag if eligible */}
        {activeSubStep === 2 ? (
          catalogData?.gi_tag_eligible && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-[10.5px] font-bold text-amber-300 shrink-0 whitespace-nowrap">
              <Award className="w-3.5 h-3.5" />
              <span>GI Certified</span>
            </div>
          )
        ) : (
          <div className="flex items-center gap-1.5 shrink-0 flex-nowrap">
            {/* View Switcher Tabs (Primary Studio vs Optional Lifestyle) */}
            {isLifestyleAllowed ? (
              <div className="flex items-center gap-1 p-0.5 bg-slate-900 rounded-full border border-slate-800 text-[11px]">
                <button
                  onClick={() => setActiveViewTab('studio')}
                  className={`px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer ${
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
                  className={`px-2.5 py-1 rounded-full font-bold transition-all flex items-center gap-1 cursor-pointer ${
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
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-[10.5px] font-bold text-amber-300 shrink-0 whitespace-nowrap">
                <Award className="w-3.5 h-3.5" />
                <span>GI Certified</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Visual Display: Step 2 4-Image Comparison Carousel vs Step 1 Split Slider */}
      {activeSubStep === 2 ? (
        /* ==================================================================== */
        /* STEP 2: 4-IMAGE COMPARISON VIEWER (EXACT IMAGE 2 INTERFACE)          */
        /* 1 Clean Studio Image + 3 Suggested Background Lifestyle Composites   */
        /* Clean images (no pins, no tags, no callout lines), < and > buttons,  */
        /* top-right "3/4 • ORIGINAL" badge, bottom-right zoom, and bottom tabs */
        /* ==================================================================== */
        <div className="flex flex-col bg-slate-950">
          <div className="relative w-full aspect-square max-h-[380px] bg-stone-100 dark:bg-slate-950 overflow-hidden select-none flex items-center justify-center">
            {/* Active Image Display */}
            {carouselImages[selectedCarouselIndex]?.src ? (
              <img
                src={carouselImages[selectedCarouselIndex].src}
                alt={carouselImages[selectedCarouselIndex].title}
                className="w-full h-full object-contain transition-all duration-300"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 p-6 text-center text-slate-400">
                <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                <span className="text-xs font-semibold">
                  {language === 'hi' ? 'छवि लोड हो रही है...' : 'Loading staging option...'}
                </span>
              </div>
            )}

            {/* Compositing Overlay Spinner if in progress */}
            {carouselImages[selectedCarouselIndex]?.isCompositing && (
              <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-10 text-white">
                <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                <span className="text-xs font-bold text-amber-300">
                  {language === 'hi' ? 'पृष्ठभूमि कंपोज़िटिंग...' : 'Compositing Staging Scene...'}
                </span>
              </div>
            )}

            {/* Top-Right Badge: Image 2 style "3/4 • ORIGINAL" / "1/4 • CLEAN STUDIO" */}
            <div className="absolute top-3 right-3 z-20 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-white text-[11px] font-black tracking-wider uppercase border border-white/10 shadow-lg flex items-center gap-1.5 pointer-events-none">
              <span className="text-amber-400 font-extrabold">
                {selectedCarouselIndex + 1}/{carouselImages.length}
              </span>
              <span className="text-white/40">•</span>
              <span className="truncate max-w-[130px]">
                {carouselImages[selectedCarouselIndex]?.badge}
              </span>
            </div>

            {/* Left Circular Arrow Button (Vertically centered at far left) */}
            <button
              type="button"
              onClick={handlePrevCarouselImage}
              aria-label="Previous Staging Image"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/95 hover:bg-white text-slate-900 shadow-[0_4px_16px_rgba(0,0,0,0.35)] flex items-center justify-center cursor-pointer transition-all active:scale-90 border border-slate-200/90"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* Right Circular Arrow Button (Vertically centered at far right) */}
            <button
              type="button"
              onClick={handleNextCarouselImage}
              aria-label="Next Staging Image"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/95 hover:bg-white text-slate-900 shadow-[0_4px_16px_rgba(0,0,0,0.35)] flex items-center justify-center cursor-pointer transition-all active:scale-90 border border-slate-200/90"
            >
              <ChevronRight className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* Bottom-Right Zoom Button */}
            <button
              type="button"
              onClick={() => setIsZoomOpen(true)}
              aria-label="Zoom Image"
              className="absolute bottom-3 right-3 z-20 w-8 h-8 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white flex items-center justify-center cursor-pointer backdrop-blur-md border border-white/20 shadow-md transition-all active:scale-90"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Bottom Segmented Tab Bar (Matching Image 2: "बाज़ार | प्रोफेशनल स्टूडियो | मूल | विशेषताएं") */}
          <div className="bg-[#F8F5EE] dark:bg-slate-950 px-2 py-2.5 border-t border-stone-200 dark:border-slate-800 flex items-center justify-around gap-1.5">
            {carouselImages.map((img, idx) => {
              const isActive = selectedCarouselIndex === idx;
              return (
                <button
                  key={img.id || idx}
                  type="button"
                  onClick={() => handleSelectCarouselIndex(idx)}
                  className={`flex-1 py-2 px-1 rounded-xl text-center text-[11px] font-bold transition-all cursor-pointer truncate ${
                    isActive
                      ? 'bg-white dark:bg-slate-800 text-stone-900 dark:text-amber-300 shadow-sm border border-stone-300/80 dark:border-slate-700 ring-1 ring-black/5'
                      : 'text-stone-500 hover:text-stone-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <span className="truncate block max-w-full">{img.tabLabel}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : activeViewTab === 'studio' ? (
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

              {/* Leader Lines SVG: Elegant Hairline Charcoal Lines (#262626) with Smooth Organic Elbows */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
                {containerDimensions.width > 0 && craftPins.map((pin) => {
                  const W = containerDimensions.width;
                  const H = containerDimensions.height;
                  const r = Math.max(34, Math.min(52, W * 0.13));
                  const shelfLen = Math.max(16, Math.min(26, W * 0.07));

                  const anchorX = ((pin.x ?? pin.x_pct ?? 50) / 100) * W;
                  const anchorY = ((pin.y ?? pin.y_pct ?? 50) / 100) * H;
                  const angle = pin.label_angle ?? 0;
                  const rad = (angle * Math.PI) / 180;

                  const kneeX = anchorX + r * Math.cos(rad);
                  const kneeY = anchorY + r * Math.sin(rad);

                  const isRight = Math.cos(rad) >= 0;
                  const endX = kneeX + (isRight ? shelfLen : -shelfLen);
                  const endY = kneeY;

                  // Smooth organic elbow transition using quadratic bezier fillet
                  const fillet = Math.min(7.0, r * 0.25, shelfLen * 0.4);
                  const pStartX = kneeX - fillet * Math.cos(rad);
                  const pStartY = kneeY - fillet * Math.sin(rad);
                  const pEndX = kneeX + (isRight ? fillet : -fillet);
                  const pEndY = kneeY;

                  return (
                    <g key={`buyer-leader-${pin.id}`}>
                      {/* Hairline elegant charcoal line with organic curved elbow transition */}
                      <path
                        d={`M ${anchorX.toFixed(1)} ${anchorY.toFixed(1)} L ${pStartX.toFixed(1)} ${pStartY.toFixed(1)} Q ${kneeX.toFixed(1)} ${kneeY.toFixed(1)} ${pEndX.toFixed(1)} ${pEndY.toFixed(1)} L ${endX.toFixed(1)} ${endY.toFixed(1)}`}
                        stroke="#262626"
                        strokeWidth="1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />
                      {/* Minimalist Dual-Layer Terminal: Translucent Halo + Tiny Solid Center Dot */}
                      <circle
                        cx={anchorX}
                        cy={anchorY}
                        r="4.5"
                        fill="rgba(38, 38, 38, 0.08)"
                        stroke="#262626"
                        strokeWidth="0.75"
                        strokeOpacity="0.45"
                      />
                      <circle
                        cx={anchorX}
                        cy={anchorY}
                        r="1.75"
                        fill="#262626"
                      />
                      {/* Hairline Shelf Terminal Dot */}
                      <circle
                        cx={endX}
                        cy={endY}
                        r="1"
                        fill="#262626"
                        opacity="0.6"
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Ultra-Refined Frosted Glass Radial Callout Cards (Luxury Apple/Net-a-Porter Aesthetic) */}
              <div className="absolute inset-0 pointer-events-auto overflow-hidden">
                {containerDimensions.width > 0 && craftPins.map((pin) => {
                  const W = containerDimensions.width;
                  const H = containerDimensions.height;
                  const r = Math.max(34, Math.min(52, W * 0.13));
                  const shelfLen = Math.max(16, Math.min(26, W * 0.07));
                  const cardWidth = Math.min(148, Math.max(118, W * 0.38));

                  const anchorX = ((pin.x ?? pin.x_pct ?? 50) / 100) * W;
                  const anchorY = ((pin.y ?? pin.y_pct ?? 50) / 100) * H;
                  const angle = pin.label_angle ?? 0;
                  const rad = (angle * Math.PI) / 180;

                  const kneeX = anchorX + r * Math.cos(rad);
                  const kneeY = anchorY + r * Math.sin(rad);

                  const isRight = Math.cos(rad) >= 0;
                  const endX = kneeX + (isRight ? shelfLen : -shelfLen);
                  const endY = kneeY;

                  // Ensure generous padding offsets so layout breathes naturally without clipping
                  let cardLeft = isRight ? endX + 6 : endX - cardWidth - 6;
                  cardLeft = Math.max(12, Math.min(W - cardWidth - 12, cardLeft));

                  let cardTop = Math.max(26, Math.min(H - 32, endY));

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
                      className={`absolute z-20 transition-all duration-200 ${
                        isRotating ? 'scale-105 z-30' : ''
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Frosted Glass Floating Card with 0.5px subtle border & soft shadow */}
                      <div className={`bg-white/85 backdrop-blur-md rounded-2xl px-2.5 py-2 border border-[#E5E7EB] shadow-lg shadow-black/5 text-slate-900 select-none transition-shadow ${
                        isRotating ? 'border-amber-400 ring-2 ring-amber-400/20 shadow-xl' : 'hover:border-slate-300'
                      }`}>
                        {/* Primary Heading: 13px, font-semibold, tracking-wide, #111111 */}
                        <div className="flex items-center justify-between gap-1">
                          <h5 className="font-semibold text-[13px] tracking-wide text-[#111111] leading-tight font-sans truncate">
                            {pin.bank_term || pin.short_label_en || pin.short_label}
                          </h5>
                          <button
                            type="button"
                            onMouseDown={(e) => startRotatePin(e, pin.id)}
                            onTouchStart={(e) => startRotatePin(e, pin.id)}
                            className={`p-0.5 rounded cursor-grab active:cursor-grabbing transition-colors shrink-0 ${
                              isRotating ? 'text-amber-600 bg-amber-50' : 'text-[#888888] hover:text-[#111111]'
                            }`}
                            title="Drag to adjust callout angle"
                          >
                            <Move className="w-2.5 h-2.5 stroke-[1.5]" />
                          </button>
                        </div>

                        {/* Supporting Description: 11px, font-normal, #555555, tightly kerned */}
                        <p className="font-normal text-[11px] text-[#555555] leading-snug tracking-tight font-sans mt-0.5 line-clamp-2">
                          {pin.one_line_summary || pin.full_description_en || pin.full_description}
                        </p>

                        {/* Museum-grade subtle footer */}
                        <div className="flex items-center justify-between mt-1 pt-1 border-t border-[#F0F2F5] text-[9px] text-[#888888] font-sans">
                          <span className="flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${pin.category === 'craft_detail' ? 'bg-amber-500' : 'bg-teal-500'}`} />
                            <span className="font-medium tracking-wider uppercase text-[8px]">
                              {pin.category === 'craft_detail' ? 'Craft Detail' : 'Natural Var.'}
                            </span>
                          </span>
                          <span className="text-[8px] font-mono text-slate-400">
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

      {/* Secondary Action Bar (Fine-Tune, Add Details, View Craft Details, Export for ONDC) - Only in Step 1 */}
      {activeSubStep !== 2 && (
        <div className="px-3.5 py-2.5 bg-slate-950/95 border-t border-slate-800 space-y-2">
          {/* Status Row (Apple/Material 3 clean metadata bar) */}
          <div className="flex items-center justify-between text-[11px] px-0.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span className="font-semibold text-slate-300">
                {language === 'hi' ? 'स्वच्छ 4K स्टूडियो परिणाम' : 'Clean 4K Studio Result'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800">
              {language === 'hi' ? 'ONDC ई-कॉमर्स मानक' : 'ONDC Ready'}
            </span>
          </div>

          {/* Unified 4-Action Toolstrip in EXACTLY ONE Row (Apple / Airbnb / Material 3) */}
          <div className="grid grid-cols-4 gap-1.5 w-full">
            {/* 1. Fine-Tune Studio */}
            <button
              type="button"
              onClick={() => setIsFineTuneOpen(true)}
              className="h-10 px-1.5 rounded-xl bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-400/50 text-slate-200 hover:text-amber-300 transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs active:scale-95 group"
              title={language === 'hi' ? 'एआई स्टूडियो फोटो सुधारें' : 'Fine-Tune Photo'}
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
              <span className="text-[11px] font-bold truncate">
                {language === 'hi' ? 'सुधारें' : 'Fine-Tune'}
              </span>
            </button>

            {/* 2. Add Detail Pin (Tap-to-Annotate) */}
            <button
              type="button"
              onClick={() => {
                setIsAnnotating(!isAnnotating);
                setIsCraftPinsVisible(true);
                setActiveViewTab('studio');
                if (!isAnnotating) setSliderPosition(100);
              }}
              className={`h-10 px-1.5 rounded-xl border transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs active:scale-95 ${
                isAnnotating
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 ring-1 ring-emerald-400/30'
                  : 'bg-slate-900 hover:bg-slate-800/90 border-slate-800 hover:border-amber-400/50 text-slate-200 hover:text-amber-300'
              }`}
              title={language === 'hi' ? 'शिल्प पर नया प्रामाणिकता बिंदु जोड़ें' : 'Add Craft Pin'}
            >
              <MapPin className={`w-3.5 h-3.5 shrink-0 ${isAnnotating ? 'text-emerald-400 animate-bounce' : 'text-amber-400'}`} />
              <span className="text-[11px] font-bold truncate">
                {isAnnotating
                  ? (language === 'hi' ? '✓ संपन्न' : '✓ Done')
                  : (language === 'hi' ? 'पिन जोड़ें' : 'Add Pin')}
              </span>
            </button>

            {/* 3. View / Hide Craft Details Toggle */}
            <button
              type="button"
              onClick={() => {
                setIsCraftPinsVisible(!isCraftPinsVisible);
                if (!isCraftPinsVisible) setActiveViewTab('studio');
              }}
              className={`h-10 px-1.5 rounded-xl border transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs active:scale-95 ${
                isCraftPinsVisible
                  ? 'bg-amber-500/15 border-amber-400/60 text-amber-300'
                  : 'bg-slate-900 hover:bg-slate-800/90 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
              title={language === 'hi' ? 'शिल्प विवरण छुपाएं या दिखाएं' : 'Toggle Pin Visibility'}
            >
              {isCraftPinsVisible ? (
                <EyeOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              ) : (
                <Eye className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              )}
              <span className="text-[11px] font-bold truncate">
                {language === 'hi' ? 'विवरण' : 'Details'}
                {craftPins.length > 0 && ` (${craftPins.length})`}
              </span>
            </button>

            {/* 4. Export for ONDC */}
            <button
              type="button"
              onClick={handleExportOndcImage}
              disabled={isExportingOndc}
              className="h-10 px-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border border-emerald-400/40 text-white transition-all flex items-center justify-center gap-1 cursor-pointer shadow-sm shadow-emerald-950 active:scale-95 disabled:opacity-60"
              title="Export flattened JPEG with technical callouts burned in for ONDC Beckn v1.2"
            >
              {isExportingOndc ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
              ) : (
                <Share2 className="w-3.5 h-3.5 shrink-0" />
              )}
              <span className="text-[11px] font-bold truncate">
                {language === 'hi' ? 'एक्सपोर्ट' : 'Export'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Enhancement summary chips & Craft Pins (Step 1: The Voice Canvas) */}
      {(activeSubStep === 1 || activeSubStep === null) && (
        <>
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
    </>
  )}

      {/* ==================================================================== */}
      {/* STEP 2: LIFESTYLE STAGING CONTEXT & SELECTION SUMMARY                */}
      {/* Guardrail: Only surfaced if camera angle is eligible                 */}
      {/* ==================================================================== */}
      {(activeSubStep === 2 || activeSubStep === null) && isLifestyleAllowed && (
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 space-y-3">
          {/* Custom Voice & Text Prompt Box (4 Backgrounds Simultaneously) */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/30 shadow-lg space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                    <span>{language === 'hi' ? 'अपनी पसंद का परिवेश बताएं' : 'Custom Background Staging'}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30">
                      Voice / AI
                    </span>
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    {language === 'hi'
                      ? 'माइक दबाकर बोलें या लिखें — AI एक साथ 4 नए विकल्प तैयार करेगा'
                      : 'Speak or type — AI generates 4 matching scenes simultaneously'}
                  </p>
                </div>
              </div>
            </div>

            {/* Input Bar with Mic & Action Button */}
            <div className="relative flex items-center gap-1.5 bg-slate-950 border border-slate-700/80 rounded-2xl p-1.5 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20 transition-all">
              {/* Voice Mic Button */}
              <button
                type="button"
                onClick={toggleVoiceListening}
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                  isVoiceListening
                    ? 'bg-rose-500 text-white animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.6)]'
                    : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-400/40'
                }`}
                title={isVoiceListening ? 'सुन रहे हैं... बोलें' : 'माइक दबाकर बोलें'}
              >
                <Mic className={`w-4 h-4 ${isVoiceListening ? 'animate-bounce' : ''}`} />
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={customPromptText}
                onChange={(e) => setCustomPromptText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleTriggerCustomBackgroundSearch(customPromptText);
                  }
                }}
                placeholder={
                  isVoiceListening
                    ? (language === 'hi' ? '🎙️ सुन रहे हैं... अपना परिवेश बोलें...' : '🎙️ Listening... Speak now...')
                    : (language === 'hi' ? 'उदा. दीवाली की रोशनी, सफेद मार्बल, लकड़ी की टेबल...' : 'e.g. Diwali lights, white marble, rustic wood...')
                }
                className="flex-1 bg-transparent px-2 text-xs text-white placeholder-slate-400 outline-none"
              />

              {/* Generate / Search Action Button */}
              <button
                type="button"
                disabled={isLoadingOptions || !customPromptText.trim()}
                onClick={() => handleTriggerCustomBackgroundSearch(customPromptText)}
                className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-40 text-slate-950 font-black text-xs transition-all flex items-center gap-1 cursor-pointer shrink-0 shadow-sm active:scale-95"
              >
                {isLoadingOptions ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>{language === 'hi' ? '4 परिवेश बनाएं' : 'Generate 4'}</span>
              </button>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-[10.5px]">
              <span className="text-slate-400 font-bold shrink-0">{language === 'hi' ? 'त्वरित सुझाव:' : 'Quick:'}</span>
              {[
                { label: '🪔 दीवाली उत्सव', q: 'diwali festive lights pooja' },
                { label: '🪵 लकड़ी की मेज़', q: 'rustic natural wooden table' },
                { label: '🏛️ पारंपरिक आंगन', q: 'traditional indian courtyard ground' },
                { label: '☕ लिविंग रूम', q: 'living room ambient table decor' },
                { label: '🌿 बगीचा व प्रकृति', q: 'lush green garden botanical surface' },
              ].map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => {
                    setCustomPromptText(chip.label.split(' ')[1] || chip.label);
                    handleTriggerCustomBackgroundSearch(chip.q);
                  }}
                  className="px-2.5 py-1 rounded-full bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-400/50 text-slate-300 hover:text-amber-300 font-medium whitespace-nowrap transition cursor-pointer shrink-0 active:scale-95"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Suggested Query, Perspective Pill & Color Harmony Pill */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800/80 flex-wrap gap-2">
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-amber-400 font-extrabold uppercase text-[9px] tracking-wider">
                {language === 'hi' ? 'सक्रिय परिवेश:' : 'Active Setting:'}
              </span>
              <span className="text-slate-200 font-medium italic truncate">"{activeSearchedQuery || effectiveQuery}"</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">
                {language === 'hi' ? '4 परिवेश उपलब्ध' : '4 Scenes Ready'}
              </span>
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
                  <span>{language === 'hi' ? 'कंपोज़िटिंग...' : 'Compositing...'}</span>
                </span>
              )}
            </div>
          </div>

          {/* 4 Background Options Card Grid (Instant Visual Switcher for all 4) */}
          {backgroundCandidates && backgroundCandidates.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span className="font-bold text-slate-300">
                  {language === 'hi' ? 'सभी 4 परिवेश विकल्प (टैप करके चुनें):' : 'All 4 Background Scenes (Tap to View):'}
                </span>
                <span className="text-[10px] text-amber-400">
                  {language === 'hi' ? 'ऊपर तुलना करें ↔' : 'Compare above ↔'}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {backgroundCandidates.slice(0, 4).map((opt, idx) => {
                  const isSelected = selectedBgId === opt.id;
                  const previewSrc = compositeCache[opt.id]?.base64 || compositeCache[opt.id]?.url || opt.thumbnail_url || opt.url;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleSelectBackground(opt)}
                      className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer border-2 transition-all duration-200 active:scale-95 group ${
                        isSelected
                          ? 'border-emerald-400 ring-2 ring-emerald-400/30 shadow-lg scale-[1.02]'
                          : 'border-slate-800 hover:border-slate-700 bg-slate-900/60'
                      }`}
                    >
                      <img
                        src={previewSrc}
                        alt={opt.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {isSelected && (
                        <div className="absolute top-1 right-1 z-10 w-4.5 h-4.5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent p-1 text-center">
                        <span className="text-[9px] font-bold text-slate-200 block truncate">
                          {opt.title || `परिवेश ${idx + 1}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active Selection Feedback Banner */}
          <div className="px-3.5 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-slate-200">
                {selectedCarouselIndex === 0
                  ? (language === 'hi'
                    ? 'स्वच्छ 4K स्टूडियो फोटो चुनी गई है (Amazon 85% मानक)'
                    : 'Clean 4K Studio photo selected (Amazon 85% Standard)')
                  : (language === 'hi'
                    ? `चयनित: ${carouselImages[selectedCarouselIndex]?.title || 'लाइफस्टाइल परिवेश'} (द्वितीयक फोटो)`
                    : `Selected: ${carouselImages[selectedCarouselIndex]?.title || 'Lifestyle Staging'} (2nd Photo)`)}
              </span>
            </div>

            {selectedCarouselIndex > 0 && (
              <button
                type="button"
                onClick={() => handleSelectCarouselIndex(0)}
                className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-300 text-[10px] font-bold border border-slate-700 flex items-center gap-1 transition-all cursor-pointer shrink-0"
              >
                <X className="w-3 h-3 text-rose-400" />
                <span>{language === 'hi' ? 'हटाएं (केवल स्टूडियो)' : 'Remove (Studio only)'}</span>
              </button>
            )}
          </div>
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

      {/* Lightbox / Zoom Modal */}
      {isZoomOpen && (
        <div
          onClick={() => setIsZoomOpen(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 cursor-zoom-out animate-fadeIn"
        >
          <button
            type="button"
            onClick={() => setIsZoomOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer transition-all"
            aria-label="Close Preview"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-2xl max-h-[80vh] w-full flex flex-col items-center justify-center">
            <img
              src={carouselImages[selectedCarouselIndex]?.src || cleanStudioImg}
              alt={carouselImages[selectedCarouselIndex]?.title || 'Zoom Preview'}
              className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl"
            />
            <p className="mt-3 text-white text-xs font-bold text-center">
              {carouselImages[selectedCarouselIndex]?.title}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
