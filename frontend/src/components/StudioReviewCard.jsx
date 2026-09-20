import React, { useState, useEffect } from 'react';
import { Sparkles, Award, Check, ImagePlus, RefreshCw, X, Eye, Edit3 } from 'lucide-react';
import { useArtisan } from '../context/ArtisanContext';
import { fetchBackgroundOptions, compositeLifestyleImage } from '../services/api';
import FineTuneStudioModal from './FineTuneStudioModal';

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
    activeAngleIndex
  } = useArtisan();

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
          rawImageBase64: rawImageBase64,
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
  const effectiveCutout = cutoutBase64 || studioImageBase64 || rawImageBase64;

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
          rawImageBase64: rawImageBase64,
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
          rawImageBase64: rawImageBase64,
          rotationDeg: customRot,
        });

        if (compRes && compRes.lifestyle_url) {
          newCache[opt.id] = {
            url: compRes.lifestyle_url,
            base64: compRes.lifestyle_base64 || compRes.lifestyle_url,
          };
          setCompositeCache({ ...newCache });
        }
      } catch (e) {
        console.warn(`Composite failed for ${opt.id}:`, e);
      }
    }
    setIsCompositing(false);
  };

  const handleSelectBackground = async (opt) => {
    setSelectedBgId(opt.id);
    setHasSkipped(false);

    // If already composited in cache, apply immediately
    if (compositeCache[opt.id]) {
      const cached = compositeCache[opt.id];
      setLifestyleImageUrl(cached.url);
      setLifestyleImageBase64(cached.base64);
      setActiveViewTab('lifestyle');
      return;
    }

    // Otherwise, generate composite now
    setIsCompositing(true);
    try {
      const compRes = await compositeLifestyleImage({
        backgroundUrl: opt.url,
        cutoutBase64: effectiveCutout,
        rawImageBase64: rawImageBase64,
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
        setActiveViewTab('lifestyle');
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

  const activeLifestyleDisplay = lifestyleImageBase64 ||
    lifestyleImageUrl ||
    (selectedBgId && compositeCache[selectedBgId]?.base64) ||
    (selectedBgId && compositeCache[selectedBgId]?.url);

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
              className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${activeViewTab === 'studio'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              {language === 'hi' ? 'प्राथमिक स्टूडियो' : 'Primary Studio'}
            </button>
            <button
              onClick={() => {
                if (activeLifestyleDisplay) {
                  setActiveViewTab('lifestyle');
                } else if (backgroundCandidates.length > 0) {
                  const rec = backgroundCandidates.find(o => o.recommended) || backgroundCandidates[0];
                  handleSelectBackground(rec);
                }
              }}
              disabled={!activeLifestyleDisplay && backgroundCandidates.length === 0}
              className={`px-3 py-1 rounded-full font-bold transition-all flex items-center gap-1.5 ${(!activeLifestyleDisplay && backgroundCandidates.length === 0)
                  ? 'opacity-40 cursor-not-allowed text-slate-500'
                  : activeViewTab === 'lifestyle'
                    ? 'bg-amber-500 text-slate-950 shadow-xs font-black cursor-pointer'
                    : 'text-amber-400 hover:text-amber-300 cursor-pointer'
                }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>{language === 'hi' ? 'लाइफस्टाइल (2nd)' : 'Lifestyle (2nd)'}</span>
              {activeLifestyleDisplay && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
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

      {/* Main Visual Display: Primary Clean Studio or Secondary Lifestyle Preview */}
      {activeViewTab === 'studio' ? (
        <div className="relative w-full aspect-square max-h-[340px] bg-[#F8F9FA] overflow-hidden flex items-center justify-center select-none">
          <img
            src={studioSrc}
            alt="Clean AI Studio Output"
            className="w-full h-full object-contain p-3"
          />
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-600/90 text-white text-[10px] font-bold shadow-md flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>{language === 'hi' ? 'स्वच्छ 4K स्टूडियो (मुख्य)' : 'Clean Studio (Primary)'}</span>
          </div>
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700 text-slate-300 text-[10px] font-bold shadow-md flex items-center gap-1">
            <span>{language === 'hi' ? 'तटस्थ पृष्ठभूमि (सफेद)' : 'Neutral White Background'}</span>
          </div>
        </div>
      ) : (
        /* Secondary Lifestyle Preview Screen */
        <div className="relative w-full aspect-square max-h-[340px] bg-slate-950 overflow-hidden flex items-center justify-center select-none">
          <img
            src={activeLifestyleDisplay}
            alt="Lifestyle Contextual Render"
            className="w-full h-full object-cover"
          />
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

      {/* Secondary Fine-Tune Action Bar (Below Split Slider) */}
      <div className="px-4 py-2.5 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-medium text-slate-300">
            {language === 'hi' ? 'स्वच्छ 4K स्टूडियो परिणाम' : 'Clean 4K Studio Result'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsFineTuneOpen(true)}
          className="min-h-[48px] px-4 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-400/60 text-amber-300 hover:text-amber-200 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
        >
          <Edit3 className="w-4 h-4 text-amber-400" />
          <span>{language === 'hi' ? '✏️ सुधारें (Fine-Tune)' : '✏️ Fine-Tune'}</span>
        </button>
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
                const isSelected = selectedBgId === opt.id || (lifestyleImageUrl && lifestyleImageUrl === compositeCache[opt.id]?.url);
                const previewSrc = compositeCache[opt.id]?.base64 || compositeCache[opt.id]?.url || opt.thumbnail_url;

                return (
                  <div
                    key={opt.id}
                    onClick={() => handleSelectBackground(opt)}
                    className={`group relative aspect-square rounded-2xl overflow-hidden cursor-pointer border-2 transition-all duration-200 active:scale-95 ${isSelected
                        ? 'border-amber-400 ring-3 ring-amber-400/30 shadow-xl shadow-amber-500/20 scale-[1.02]'
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
    </div>
  );
}
