import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  RotateCcw,
  Check,
  Volume2,
  Sparkles,
  Sun,
  Palette,
  Contrast,
  Loader2,
  MousePointerClick
} from 'lucide-react';
import { useArtisan } from '../context/ArtisanContext';
import { clearSpotAtPoint, enhanceImage } from '../services/api';

export default function FineTuneStudioModal({
  isOpen,
  onClose,
  initialStudioSrc,
  initialCutoutSrc,
  rawSrc,
  onApply,
}) {
  const { speakVoice, language } = useArtisan();

  // Internal visual state
  const [currentStudio, setCurrentStudio] = useState(initialStudioSrc);
  const [currentCutout, setCurrentCutout] = useState(initialCutoutSrc);

  // Baseline copies for "Reset to AI Original"
  const baselineStudioRef = useRef(initialStudioSrc);
  const baselineCutoutRef = useRef(initialCutoutSrc);

  // Color tone toggle: false = AI 6500K, true = Original Color
  const [preserveOriginalTones, setPreserveOriginalTones] = useState(false);
  const [isTogglingTone, setIsTogglingTone] = useState(false);
  const cachedToneVariants = useRef({
    aiStudio: initialStudioSrc,
    rawTonesStudio: null,
  });

  // 3 Adjustment sliders (percentages, baseline 100)
  const [brightness, setBrightness] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [contrast, setContrast] = useState(100);

  // Single-tap hole removal state
  const [isClearingSpot, setIsClearingSpot] = useState(false);
  const [tapRipple, setTapRipple] = useState(null); // { xPct, yPct }
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  const previewImageRef = useRef(null);

  // Synchronize initial source when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStudio(initialStudioSrc);
      setCurrentCutout(initialCutoutSrc);
      baselineStudioRef.current = initialStudioSrc;
      baselineCutoutRef.current = initialCutoutSrc;
      cachedToneVariants.current.aiStudio = initialStudioSrc;
      setPreserveOriginalTones(false);
      setBrightness(100);
      setSaturation(100);
      setContrast(100);
      setTapRipple(null);
      setFeedbackMsg(null);
    }
  }, [isOpen, initialStudioSrc, initialCutoutSrc]);

  if (!isOpen) return null;

  // Audio tip announcement
  const playAudioGuideTip = () => {
    const tipText =
      language === 'hi'
        ? 'अगर कोई हिस्सा छूट गया है, फोटो पर उस जगह टैप करें। असली रंग वापस पाने के लिए ऊपर वाला बटन दबाएं।'
        : 'If an enclosed spot was missed, tap on that spot on the photo. Tap the button above to switch to original colors.';
    speakVoice(tipText, language === 'hi' ? 'hi-IN' : 'en-IN');
  };

  // Slider speaker readouts
  const speakSliderLabel = (type) => {
    let msg = '';
    if (type === 'brightness') {
      msg = language === 'hi' ? `रोशनी: ${brightness} प्रतिशत` : `Brightness: ${brightness} percent`;
    } else if (type === 'saturation') {
      msg = language === 'hi' ? `रंग का गाढ़ापन: ${saturation} प्रतिशत` : `Color richness: ${saturation} percent`;
    } else if (type === 'contrast') {
      msg = language === 'hi' ? `गहराई और कंट्रास्ट: ${contrast} प्रतिशत` : `Contrast depth: ${contrast} percent`;
    }
    speakVoice(msg, language === 'hi' ? 'hi-IN' : 'en-IN');
  };

  // Single-tap hole removal handler
  const handlePreviewTap = async (e) => {
    if (isClearingSpot || !previewImageRef.current) return;

    const rect = previewImageRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    if (clickX < 0 || clickX > rect.width || clickY < 0 || clickY > rect.height) return;

    const xPct = (clickX / rect.width) * 100;
    const yPct = (clickY / rect.height) * 100;

    // Show instant visual tap ripple indicator
    setTapRipple({ xPct, yPct });
    setIsClearingSpot(true);
    setFeedbackMsg(language === 'hi' ? 'छेद साफ़ किया जा रहा है...' : 'Clearing enclosed spot...');

    // Project onto 1080x1080 canonical canvas
    const canvasX = (clickX / rect.width) * 1080;
    const canvasY = (clickY / rect.height) * 1080;

    try {
      const res = await clearSpotAtPoint({
        cutoutBase64: currentCutout || currentStudio,
        imageBase64: rawSrc,
        x: canvasX,
        y: canvasY,
        canvasWidth: 1080,
        canvasHeight: 1080,
        tolerance: 24,
        preserveOriginalTones,
        tier: 'lightweight',
      });

      if (res && res.studio_base64) {
        setCurrentStudio(res.studio_base64);
        if (res.cutout_base64) {
          setCurrentCutout(res.cutout_base64);
        }
        setFeedbackMsg(
          language === 'hi'
            ? `✓ ${res.cleared_pixels || 'अवशिष्ट'} पिक्सेल साफ़ किए गए`
            : `✓ Cleared spot (${res.cleared_pixels || 0} px)`
        );
      }
    } catch (err) {
      console.error('Hole clear error:', err);
      setFeedbackMsg(language === 'hi' ? 'छेद साफ़ नहीं हो सका' : 'Could not clear spot');
    } finally {
      setIsClearingSpot(false);
      setTimeout(() => setTapRipple(null), 1200);
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  // Switch between AI 6500K and Original Colors
  const handleToggleColorTone = async (newPreserveTones) => {
    if (newPreserveTones === preserveOriginalTones || isTogglingTone) return;

    setPreserveOriginalTones(newPreserveTones);

    if (newPreserveTones) {
      // Switching to Original Tones
      if (cachedToneVariants.current.rawTonesStudio) {
        setCurrentStudio(cachedToneVariants.current.rawTonesStudio);
      } else {
        setIsTogglingTone(true);
        try {
          const res = await enhanceImage({
            imageBase64: rawSrc,
            preserveOriginalTones: true,
          });
          if (res && (res.processed_base64 || res.studio_url)) {
            const toneImg = res.processed_base64 || res.studio_url;
            cachedToneVariants.current.rawTonesStudio = toneImg;
            setCurrentStudio(toneImg);
            if (res.cutout_base64) setCurrentCutout(res.cutout_base64);
          }
        } catch (e) {
          console.warn('Could not re-render raw tones:', e);
        } finally {
          setIsTogglingTone(false);
        }
      }
      speakVoice(
        language === 'hi' ? 'असली रंग मोड सक्रिय' : 'Original raw color active',
        language === 'hi' ? 'hi-IN' : 'en-IN'
      );
    } else {
      // Switching back to AI 6500K
      if (cachedToneVariants.current.aiStudio) {
        setCurrentStudio(cachedToneVariants.current.aiStudio);
      }
      speakVoice(
        language === 'hi' ? 'एआई 6500K संतुलित मोड सक्रिय' : 'AI 6500K balance active',
        language === 'hi' ? 'hi-IN' : 'en-IN'
      );
    }
  };

  // Reset to AI Original
  const handleResetToOriginal = () => {
    setCurrentStudio(baselineStudioRef.current);
    setCurrentCutout(baselineCutoutRef.current);
    setPreserveOriginalTones(false);
    setBrightness(100);
    setSaturation(100);
    setContrast(100);
    setTapRipple(null);
    setFeedbackMsg(language === 'hi' ? 'मूल एआई रूप में रीसेट किया गया' : 'Reset to AI Original');
    setTimeout(() => setFeedbackMsg(null), 2500);
    speakVoice(
      language === 'hi' ? 'मूल एआई रूप में रीसेट कर दिया गया' : 'Reset to AI original',
      language === 'hi' ? 'hi-IN' : 'en-IN'
    );
  };

  // Commit changes and close
  const handleApply = async () => {
    // If sliders are modified, bake CSS filters into a 1080x1080 canvas
    if (brightness !== 100 || saturation !== 100 || contrast !== 100) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1080;
        const ctx = canvas.getContext('2d');
        ctx.filter = `brightness(${brightness}%) saturate(${saturation}%) contrast(${contrast}%)`;

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          ctx.drawImage(img, 0, 0, 1080, 1080);
          const bakedBase64 = canvas.toDataURL('image/jpeg', 0.95);
          onApply({
            studioBase64: bakedBase64,
            cutoutBase64: currentCutout,
            preserveOriginalTones,
            brightness,
            saturation,
            contrast,
          });
          onClose();
        };
        img.onerror = () => {
          onApply({
            studioBase64: currentStudio,
            cutoutBase64: currentCutout,
            preserveOriginalTones,
            brightness,
            saturation,
            contrast,
          });
          onClose();
        };
        img.src = currentStudio;
        return;
      } catch (e) {
        console.warn('Canvas filter bake fallback:', e);
      }
    }

    onApply({
      studioBase64: currentStudio,
      cutoutBase64: currentCutout,
      preserveOriginalTones,
      brightness,
      saturation,
      contrast,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md transition-opacity">
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in slide-in-from-bottom duration-300"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fine-tune-title"
      >
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <div>
              <h3 id="fine-tune-title" className="text-sm font-black text-slate-100 flex items-center gap-2">
                <span>{language === 'hi' ? 'स्टूडियो फोटो सुधारें' : 'Fine-Tune Studio Photo'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 font-bold">
                  वैकल्पिक
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                {language === 'hi' ? 'अवशिष्ट हिस्से हटाएं और रंग समायोजित करें' : 'Clear residual spots & adjust tones'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Tip Button */}
            <button
              type="button"
              onClick={playAudioGuideTip}
              className="min-h-[48px] min-w-[48px] px-3 py-2 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              aria-label="ऑडियो गाइड सुनें"
            >
              <Volume2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-[11px] hidden xs:inline">{language === 'hi' ? 'टिप सुनें' : 'Audio Tip'}</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="min-h-[48px] min-w-[48px] rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="बंद करें"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          {/* SECTION A & B: LIVE PREVIEW WITH TAP-TO-CLEAR */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-amber-400 font-extrabold flex items-center gap-1.5">
                <MousePointerClick className="w-3.5 h-3.5" />
                <span>
                  {language === 'hi'
                    ? 'यहाँ टैप करें अगर कुछ छूट गया'
                    : 'Tap here if something was missed'}
                </span>
              </span>
              {isClearingSpot && (
                <span className="text-amber-300 font-bold flex items-center gap-1 text-[10px]">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>प्रक्रियाधीन...</span>
                </span>
              )}
            </div>

            {/* Tappable Studio Canvas Container */}
            <div
              onClick={handlePreviewTap}
              className="relative w-full aspect-square max-h-[290px] rounded-2xl bg-[#F8F9FA] border-2 border-slate-700/80 hover:border-amber-400/80 overflow-hidden cursor-crosshair select-none transition-colors shadow-inner flex items-center justify-center group"
            >
              <img
                ref={previewImageRef}
                src={currentStudio}
                alt="Studio Fine-Tune Live Preview"
                style={{
                  filter: `brightness(${brightness}%) saturate(${saturation}%) contrast(${contrast}%)`,
                }}
                className="w-full h-full object-contain p-2 transition-[filter] duration-100"
              />

              {/* Tap Ripple Indicator */}
              {tapRipple && (
                <div
                  style={{ left: `${tapRipple.xPct}%`, top: `${tapRipple.yPct}%` }}
                  className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2"
                >
                  <span className="block w-8 h-8 rounded-full border-2 border-amber-400 bg-amber-400/30 animate-ping" />
                  <span className="absolute inset-0 m-auto w-2.5 h-2.5 rounded-full bg-amber-400" />
                </div>
              )}

              {/* Tapping Overlay Guide Badge */}
              <div className="absolute bottom-2 inset-x-2 pointer-events-none flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800 text-slate-300 text-[10px] font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>
                    {language === 'hi'
                      ? 'होल/छेद पर टैप करें'
                      : 'Single-tap hole to clear'}
                  </span>
                </span>
                {feedbackMsg && (
                  <span className="px-2.5 py-1 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold">
                    {feedbackMsg}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* SECTION C: COLOR MODE TOGGLE SWITCH */}
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-300">
                {language === 'hi' ? 'रंग संतुलन मोड:' : 'Color Balance Mode:'}
              </span>
              {isTogglingTone && (
                <span className="text-[10px] text-amber-400 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>बदल रहे हैं...</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 rounded-2xl border border-slate-800">
              {/* AI 6500K Mode */}
              <button
                type="button"
                onClick={() => handleToggleColorTone(false)}
                className={`min-h-[48px] py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 ${
                  !preserveOriginalTones
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>✨ AI 6500K</span>
              </button>

              {/* Original Raw Color Mode */}
              <button
                type="button"
                onClick={() => handleToggleColorTone(true)}
                className={`min-h-[48px] py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 ${
                  preserveOriginalTones
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🏺</span>
                <span>{language === 'hi' ? 'असली रंग' : 'Original Color'}</span>
              </button>
            </div>
          </div>

          {/* SECTION D: THREE ICON-LABELED SLIDERS WITH AUDIO READOUT */}
          <div className="space-y-3 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
            {/* Slider 1: Brightness */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-slate-200">
                    {language === 'hi' ? '☀️ रोशनी (Brightness)' : '☀️ Brightness'}
                  </span>
                  <button
                    type="button"
                    onClick={() => speakSliderLabel('brightness')}
                    className="min-h-[48px] min-w-[48px] p-2 text-slate-400 hover:text-amber-400 cursor-pointer flex items-center justify-center"
                    aria-label="रोशनी का विवरण सुनें"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="font-mono text-slate-400 text-xs font-bold">{brightness}%</span>
              </div>
              <div className="min-h-[48px] flex items-center">
                <input
                  type="range"
                  min="70"
                  max="130"
                  step="1"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  aria-label="रोशनी स्लाइडर"
                />
              </div>
            </div>

            {/* Slider 2: Saturation */}
            <div className="space-y-1.5 border-t border-slate-800/80 pt-2.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-slate-200">
                    {language === 'hi' ? '🎨 रंग का गाढ़ापन (Saturation)' : '🎨 Color Richness'}
                  </span>
                  <button
                    type="button"
                    onClick={() => speakSliderLabel('saturation')}
                    className="min-h-[48px] min-w-[48px] p-2 text-slate-400 hover:text-emerald-400 cursor-pointer flex items-center justify-center"
                    aria-label="रंग का गाढ़ापन सुनें"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="font-mono text-slate-400 text-xs font-bold">{saturation}%</span>
              </div>
              <div className="min-h-[48px] flex items-center">
                <input
                  type="range"
                  min="50"
                  max="150"
                  step="1"
                  value={saturation}
                  onChange={(e) => setSaturation(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                  aria-label="रंग गाढ़ापन स्लाइडर"
                />
              </div>
            </div>

            {/* Slider 3: Contrast */}
            <div className="space-y-1.5 border-t border-slate-800/80 pt-2.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Contrast className="w-4 h-4 text-blue-400" />
                  <span className="font-bold text-slate-200">
                    {language === 'hi' ? '🌓 गहराई (Contrast/Depth)' : '🌓 Contrast & Depth'}
                  </span>
                  <button
                    type="button"
                    onClick={() => speakSliderLabel('contrast')}
                    className="min-h-[48px] min-w-[48px] p-2 text-slate-400 hover:text-blue-400 cursor-pointer flex items-center justify-center"
                    aria-label="गहराई सुनें"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="font-mono text-slate-400 text-xs font-bold">{contrast}%</span>
              </div>
              <div className="min-h-[48px] flex items-center">
                <input
                  type="range"
                  min="70"
                  max="130"
                  step="1"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-400"
                  aria-label="कंट्रास्ट स्लाइडर"
                />
              </div>
            </div>
          </div>

          {/* SECTION E: RESET TO AI ORIGINAL */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleResetToOriginal}
              className="min-h-[48px] px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span>{language === 'hi' ? 'जैसे पहले था (Reset to AI Original)' : 'Reset to AI Original'}</span>
            </button>
          </div>
        </div>

        {/* SECTION F: FOOTER ACTION BUTTONS (>=48PX TOUCH TARGETS) */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-3">
          {/* Cancel Button */}
          <button
            type="button"
            onClick={onClose}
            className="min-h-[48px] px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
          >
            <X className="w-4 h-4" />
            <span>{language === 'hi' ? 'रद्द करें' : 'Cancel'}</span>
          </button>

          {/* Apply Changes Button */}
          <button
            type="button"
            onClick={handleApply}
            className="min-h-[48px] flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-transform"
          >
            <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
            <span>{language === 'hi' ? 'सुरक्षित करें (Apply Changes)' : 'Apply Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
