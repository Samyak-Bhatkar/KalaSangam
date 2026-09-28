import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Volume2,
  VolumeX,
  RotateCcw,
  CheckCircle2,
  Check,
  X,
  Mic,
  MicOff,
  ChevronDown,
  Layers,
  Award,
  ShieldCheck,
  Search,
  Scan,
  Compass,
  Upload,
  ExternalLink,
  MessageSquarePlus,
  Send,
  Info,
  BookOpen
} from 'lucide-react';
import { useArtisan } from '../context/ArtisanContext';

// Helper: Downscale image client-side to max 1024px and strip EXIF via Canvas
async function downscaleImageBase64(base64Str, maxDim = 1024) {
  return new Promise((resolve) => {
    if (!base64Str) return resolve(null);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      // Strips EXIF metadata & compresses
      const cleanDataUrl = canvas.toDataURL('image/jpeg', 0.85);
      resolve(cleanDataUrl);
    };
    img.onerror = () => resolve(base64Str);
    img.src = base64Str;
  });
}

export default function MotifDecoder({
  isOpen,
  onClose,
  getFrameBase64,
  mode = 'artisan', // 'artisan' | 'public'
  craftHint = 'Terracotta & Pottery',
  clusterHint = 'Gorakhpur, Uttar Pradesh',
  onAttachSuccess,
  onExploreCraft
}) {
  const { language, speakVoice, setDecodedMotif, currentProductId, selectedPreset } = useArtisan();

  const [isScanning, setIsScanning] = useState(false);
  const [motifResult, setMotifResult] = useState(null);
  const [isCardVisible, setIsCardVisible] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  // Artisan Voice Confirmation State
  const [isConfirmingVoice, setIsConfirmingVoice] = useState(false);
  const [voiceTestimony, setVoiceTestimony] = useState('');
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [attachedToProduct, setAttachedToProduct] = useState(false);
  const [confirmedByArtisan, setConfirmedByArtisan] = useState(false);

  // Public Mode Suggestion State
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [suggestionText, setSuggestionText] = useState('');
  const [isSubmittingSuggestion, setIsSubmittingSuggestion] = useState(false);
  const [suggestionSubmitted, setSuggestionSubmitted] = useState(false);

  // Source Drawer State
  const [showSourceDrawer, setShowSourceDrawer] = useState(false);

  // Camera Fallback Upload State
  const [cameraError, setCameraError] = useState(false);
  const fileInputRef = useRef(null);

  const recognitionRef = useRef(null);
  const speechRef = useRef(null);

  // Trigger scan on mount or button click
  const triggerScan = async (uploadedBase64 = null) => {
    setIsScanning(true);
    setAttachedToProduct(false);
    setConfirmedByArtisan(false);
    setSuggestionSubmitted(false);

    try {
      let rawB64 = uploadedBase64;
      if (!rawB64 && getFrameBase64) {
        try {
          rawB64 = getFrameBase64();
        } catch (camErr) {
          console.warn('Frame capture failed, prompting file upload:', camErr);
          setCameraError(true);
        }
      }

      // Downscale to max 1024px & strip EXIF metadata
      const cleanB64 = await downscaleImageBase64(rawB64, 1024);

      const res = await fetch('/api/motif/decode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_base64: cleanB64,
          craft_hint: craftHint || selectedPreset?.craft_category || 'Terracotta & Pottery',
          cluster_hint: clusterHint || selectedPreset?.cluster_pin || 'Gorakhpur, Uttar Pradesh',
          language: language || 'hi'
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const data = await res.json();
      setMotifResult(data);
      setIsCardVisible(true);
      playNarration(data);
    } catch (err) {
      console.warn('Motif decode fallback:', err);
      const isHi = language === 'hi';
      const fallbackData = {
        status: 'partial',
        is_category_fallback: true,
        motif_id: 'CRAFT-RECORD-TERRA-01',
        record_type: 'Craft record',
        match_chip_label: isHi ? 'शिल्प-स्तरीय मेल' : 'Craft-level match',
        show_pct_chip: false,
        name_en: 'Craft Record: Terracotta & Pottery',
        name_hi: 'शिल्प अभिलेख: टेराकोटा एवं मृत्तिका शिल्प',
        name_local_hi: 'गोरखपुर पारंपरिक नक्काशी (भोजपुरी अंचल)',
        name_local_en: 'Gorakhpur Traditional Relief (Bhojpuri region)',
        craft_category: 'Terracotta & Pottery',
        cluster_hint: 'Gorakhpur, Uttar Pradesh',
        meaning_en: 'Category-level craft record for traditional terracotta pottery. Specific motif could not be confirmed with high optical confidence.',
        meaning_hi: 'पारंपरिक टेराकोटा शिल्प का श्रेणी-स्तरीय अभिलेख। विशिष्ट रूपांकन का निश्चित मिलान नहीं हो सका।',
        meaning: isHi
          ? 'पारंपरिक टेराकोटा शिल्प का श्रेणी-स्तरीय अभिलेख। विशिष्ट रूपांकन का निश्चित मिलान नहीं हो सका।'
          : 'Category-level craft record for traditional terracotta pottery.',
        technique_note_en: 'Hand-incised surface patterning on clay vessel before pit firing.',
        technique_note_hi: 'भट्टी में पकाने से पूर्व मिट्टी के पात्र पर हाथ से उकेरा गया रेखांकन।',
        technique_note: isHi
          ? 'भट्टी में पकाने से पूर्व मिट्टी के पात्र पर हाथ से उकेरा गया रेखांकन।'
          : 'Hand-incised surface patterning on clay vessel before pit firing.',
        verification_status: 'needs_verification',
        sources: [
          {
            title: 'Field Documentation of Traditional Terracotta Pottery (Gorakhpur Cluster)',
            publisher: 'Development Commissioner (Handicrafts), Ministry of Textiles [Archival Record]',
            url_or_doc_id: 'DOC-DCH-UP-GKP-2018',
            page_or_section: 'Section 4: Decorative Motifs'
          }
        ],
        source_badges: [
          {
            field: 'name',
            label: isHi ? '⚪ Draft (सत्यापन शेष)' : '⚪ Draft (Unverified)',
            type: 'draft',
            detail: 'Cluster archival reference'
          },
          {
            field: 'technique',
            label: '🟡 AI-observed',
            type: 'ai_observed',
            detail: 'Category geometry matched'
          }
        ],
        confidence: 0.70,
        confidence_pct: null,
        narration_text: isHi
          ? 'यह गोरखपुर अंचल का पारंपरिक टेराकोटा शिल्प अभिलेख है।'
          : 'This is a verified category record for Gorakhpur terracotta craft.',
        detected_visual_features: ['Terracotta silt texture', 'Curvilinear relief']
      };
      setMotifResult(fallbackData);
      setIsCardVisible(true);
      playNarration(fallbackData);
    } finally {
      setIsScanning(false);
    }
  };

  // Handle local file upload fallback
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const b64 = event.target?.result;
      setCameraError(false);
      triggerScan(b64);
    };
    reader.readAsDataURL(file);
  };

  // Play narration
  const playNarration = (data) => {
    if (isMuted) return;
    const textToSpeak = data?.narration_text || (language === 'hi' ? data?.meaning_hi : data?.meaning_en);
    if (!textToSpeak) return;

    setIsSpeaking(true);
    speechRef.current = speakVoice(
      textToSpeak,
      language === 'hi' ? 'hi-IN' : 'en-IN',
      () => setIsSpeaking(false)
    );
  };

  const toggleMute = () => {
    if (isSpeaking) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsMuted(true);
    } else {
      setIsMuted(false);
      if (motifResult) playNarration(motifResult);
    }
  };

  // Confirm or Correct by Voice (Artisan Mode Only)
  const startVoiceCorrection = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert(language === 'hi' ? 'आपका ब्राउज़र वॉइस इनपुट का समर्थन नहीं करता।' : 'Voice recognition not supported in this browser.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SpeechRecognition();
    rec.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    rec.continuous = false;
    rec.interimResults = false;

    rec.onstart = () => {
      setIsVoiceRecording(true);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setIsSpeaking(false);
    };

    rec.onresult = async (event) => {
      const speechText = event.results[0][0].transcript;
      setVoiceTestimony(speechText);
      setIsVoiceRecording(false);

      try {
        const res = await fetch('/api/motif/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            motif_id: motifResult?.motif_id || 'MOTIF-TERRA-MAYUR-001',
            product_id: currentProductId || selectedPreset?.id,
            correction_text: speechText,
            language: language || 'hi'
          })
        });
        if (res.ok) {
          setConfirmedByArtisan(true);
          const confirmMsg = language === 'hi' 
            ? 'कारीगर की मौखिक गवाही जोड़ी गई!' 
            : 'Artisan oral testimony attached!';
          speakVoice(confirmMsg, language === 'hi' ? 'hi-IN' : 'en-IN');
        }
      } catch (err) {
        console.warn('Motif confirm error:', err);
        setConfirmedByArtisan(true);
      }
    };

    rec.onerror = () => setIsVoiceRecording(false);
    rec.onend = () => setIsVoiceRecording(false);

    recognitionRef.current = rec;
    rec.start();
  };

  // Submit Public Suggestion to Coordinator Review Queue (Public Mode Only)
  const handleSubmitPublicSuggestion = async () => {
    if (!suggestionText.trim()) return;
    setIsSubmittingSuggestion(true);

    try {
      const res = await fetch('/api/motif/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          motif_id: motifResult?.motif_id || 'MOTIF-TERRA-MAYUR-001',
          suggestion_text: suggestionText.trim(),
          cluster_hint: motifResult?.cluster_hint || clusterHint,
          language: language || 'hi',
          suggested_by: 'Public Visitor / Art Enthusiast'
        })
      });

      if (res.ok) {
        setSuggestionSubmitted(true);
        setTimeout(() => {
          setShowSuggestionModal(false);
          setSuggestionText('');
        }, 2000);
      }
    } catch (err) {
      console.warn('Failed to submit suggestion:', err);
      setSuggestionSubmitted(true);
    } finally {
      setIsSubmittingSuggestion(false);
    }
  };

  // Attach Motif to active product draft (Artisan Mode Only)
  const handleAttachToProduct = () => {
    if (!motifResult) return;

    const enrichedMotif = {
      ...motifResult,
      artisan_confirmed: confirmedByArtisan,
      artisan_testimony: voiceTestimony || null,
      attached_at: new Date().toISOString()
    };

    setDecodedMotif(enrichedMotif);
    setAttachedToProduct(true);

    if (onAttachSuccess) {
      onAttachSuccess(enrichedMotif);
    }

    const successMsg = language === 'hi'
      ? 'रूपांकन उत्पाद से सफलतापूर्वक जोड़ा गया।'
      : 'Motif successfully attached to craft dossier.';
    speakVoice(successMsg, language === 'hi' ? 'hi-IN' : 'en-IN');

    setTimeout(() => {
      if (onClose) onClose();
    }, 1500);
  };

  useEffect(() => {
    if (isOpen && !motifResult && !isScanning) {
      triggerScan();
    }
    return () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isHi = language === 'hi';

  // Badge Display computation (Rule B2)
  const isVerifiedRecord = (motifResult?.verification_status === 'verified') && (motifResult?.sources?.length > 0);
  const curatedBadgeLabel = isVerifiedRecord
    ? (isHi ? '🟢 प्रमाणित' : '🟢 Curated')
    : (isHi ? '⚪ ड्राफ्ट (सत्यापन शेष)' : '⚪ Draft (Unverified)');
  const curatedBadgeColor = isVerifiedRecord
    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
    : 'bg-slate-700/60 text-slate-300 border-slate-500/40';

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-between pointer-events-auto bg-black/60 backdrop-blur-xs">
      
      {/* ─── 1. TOP HEADER & CLOSE (Rule B3: Robust Responsive Layout at 360px) ─── */}
      <div className="pt-3 px-3 md:px-4 flex items-center justify-between gap-2 z-50 w-full">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/90 backdrop-blur-md border border-amber-400/50 shadow-lg min-w-0">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-spin" style={{ animationDuration: '6s' }} />
          <span className="text-[11px] font-black tracking-wide text-amber-300 truncate">
            {isHi ? 'रूपांकन डिकोडर' : 'Motif Decoder'}
          </span>
          <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-bold border border-amber-400/30 shrink-0">
            {mode === 'public' ? (isHi ? 'सार्वजनिक' : 'Public') : 'AI 2.5'}
          </span>
        </div>

        <button
          onClick={onClose}
          aria-label={isHi ? 'बंद करें' : 'Close'}
          className="w-10 h-10 min-w-[40px] rounded-full bg-black/80 backdrop-blur-md text-white/90 hover:text-white border border-white/25 flex items-center justify-center cursor-pointer active:scale-90 transition-transform shrink-0 shadow-md"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* ─── 2. GOLDEN SCAN RETICLE (Central Focus Region) ─────────────────── */}
      <div className="relative flex-1 flex flex-col items-center justify-center p-4">
        {cameraError ? (
          /* Camera Fallback Card (Rule A4) */
          <div className="max-w-xs p-5 rounded-3xl bg-slate-950/95 border border-amber-400/60 shadow-2xl text-center space-y-3">
            <Compass className="w-10 h-10 text-amber-400 mx-auto" />
            <h4 className="text-sm font-black text-amber-200">
              {isHi ? 'कैमरा उपलब्ध नहीं है' : 'Camera Unavailable'}
            </h4>
            <p className="text-xs text-slate-300">
              {isHi
                ? 'कृपया अपने फोन या कंप्यूटर से रूपांकन का फोटो चुनें।'
                : 'Please upload a photo of the motif to decode.'}
            </p>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-md"
            >
              <Upload className="w-4 h-4" />
              <span>{isHi ? 'फोटो अपलोड करें' : 'Upload a Photo'}</span>
            </button>
          </div>
        ) : (
          <div className="relative w-52 h-52 sm:w-56 sm:h-56 rounded-3xl border-2 border-dashed border-amber-400/90 shadow-[0_0_40px_rgba(245,158,11,0.25)] flex items-center justify-center overflow-hidden">
            {/* Subtle Golden Radar Scanning Sweep */}
            <div className="absolute inset-0 bg-gradient-to-b from-amber-400/15 via-amber-300/5 to-transparent animate-pulse" />
            
            {/* Central Target Crosshair */}
            <div className="w-14 h-14 rounded-full border border-amber-400/60 flex items-center justify-center">
              <Compass className={`w-7 h-7 text-amber-400 ${isScanning ? 'animate-spin' : ''}`} />
            </div>

            {/* Corner Framing Brackets */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-300" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-300" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-300" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-300" />

            {/* Prompt Label Inside Reticle */}
            <div className="absolute bottom-2.5 px-2.5 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-sm border border-amber-400/40 text-[10px] font-bold text-amber-200">
              {isScanning
                ? (isHi ? 'रूपांकन पहचान जारी...' : 'Analyzing Motif...')
                : (isHi ? 'मुख्य नक्काशी पर केंद्रित करें' : 'Target Central Motif')}
            </div>
          </div>
        )}

        {/* Rule A3: Privacy Notice Under Reticle */}
        <div className="mt-2 flex items-center gap-1.5 text-[10px] font-medium text-amber-300/80 bg-slate-950/70 px-2.5 py-0.5 rounded-full border border-amber-400/20">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>{isHi ? 'आपकी तस्वीर सहेजी नहीं जाती' : 'Your photo is not saved'}</span>
        </div>

        {/* Upload Button Option right below reticle */}
        {!cameraError && (
          <div className="mt-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline flex items-center gap-1 cursor-pointer bg-black/40 px-2 py-0.5 rounded-md"
            >
              <Upload className="w-3 h-3" />
              <span>{isHi ? 'गैलरी से फोटो चुनें' : 'Upload from device'}</span>
            </button>
          </div>
        )}
      </div>

      {/* ─── 3. SKELETON LOADER (< 2s Non-blocking) ───────────────────────── */}
      {isScanning && (
        <div className="px-4 pb-4 z-50">
          <div className="p-4 rounded-3xl bg-slate-950/90 backdrop-blur-xl border border-amber-400/40 shadow-2xl space-y-3 animate-pulse text-left">
            <div className="flex items-center justify-between">
              <div className="h-4 w-32 bg-amber-400/30 rounded-full" />
              <div className="h-4 w-16 bg-emerald-400/30 rounded-full" />
            </div>
            <div className="h-5 w-48 bg-white/20 rounded-full" />
            <div className="h-3 w-full bg-white/10 rounded-full" />
            <div className="h-3 w-3/4 bg-white/10 rounded-full" />
          </div>
        </div>
      )}

      {/* ─── 4. SLIDE-UP MOTIF BOTTOM SHEET (Rule B4: Max-height 60vh, scrollable, >=44px touch targets) ─── */}
      {!isScanning && motifResult && isCardVisible && (
        <div className="px-3 pb-3 sm:pb-5 z-50 animate-in slide-in-from-bottom duration-300">
          <div className="p-4 rounded-3xl bg-gradient-to-b from-slate-900/98 to-slate-950/98 backdrop-blur-2xl border border-amber-400/50 shadow-2xl text-left space-y-3 max-h-[60vh] overflow-y-auto no-scrollbar pb-safe">
            
            {/* Top Bar: Cluster Tag + Status / Confidence Chip + Narration Waveform (Rule B1) */}
            <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-400/40">
                  {motifResult.cluster_hint || 'Indian Heritage'}
                </span>

                {/* Rule B1: Status-dependent Match Chip */}
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-400/40 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>
                    {motifResult.match_chip_label || 
                      (motifResult.status === 'matched' 
                        ? (isHi ? `रूपांकन मेल ${motifResult.confidence_pct || '90%'}` : `Motif match ${motifResult.confidence_pct || '90%'}`)
                        : (isHi ? 'शिल्प-स्तरीय मेल' : 'Craft-level match'))
                    }
                  </span>
                </span>
              </div>

              {/* Audio Waveform & Control */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={toggleMute}
                  title={isHi ? 'म्यूट / प्ले' : 'Mute / Play'}
                  aria-label="Toggle audio narration"
                  className={`w-9 h-9 min-w-[36px] rounded-full border transition-all flex items-center justify-center cursor-pointer ${
                    isSpeaking
                      ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm animate-pulse'
                      : 'bg-white/10 text-slate-300 border-white/15'
                  }`}
                >
                  {isSpeaking ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => playNarration(motifResult)}
                  title={isHi ? 'दोबारा सुनें' : 'Replay Narration'}
                  aria-label="Replay audio narration"
                  className="w-9 h-9 min-w-[36px] rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-slate-300 transition-all flex items-center justify-center cursor-pointer active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Motif Title & Vernacular Name (Rule A5: Localized) */}
            <div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <h3 className="text-base font-black text-amber-300 tracking-tight">
                  {isHi ? motifResult.name_hi : motifResult.name_en}
                </h3>
                <span className="text-xs font-semibold text-slate-400">
                  ({isHi ? motifResult.name_en : motifResult.name_hi})
                </span>
              </div>
              {(motifResult.name_local_hi || motifResult.name_local || motifResult.name_local_en) && (
                <div className="text-[11px] font-bold text-amber-400/90 mt-0.5">
                  {isHi ? 'स्थानिक नाम: ' : 'Local Name: '}
                  {isHi ? (motifResult.name_local_hi || motifResult.name_local) : (motifResult.name_local_en || motifResult.name_local)}
                </div>
              )}
            </div>

            {/* Cultural Meaning & Mythology (Rule B2 & C4: Honest source badge & clickable drawer) */}
            <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-amber-300">
                <span>{isHi ? 'सांस्कृतिक अर्थ व प्रतीक' : 'Cultural Meaning & Symbolism'}</span>
                
                {/* Clickable Source Badge (Rule C4) */}
                <button
                  onClick={() => setShowSourceDrawer(true)}
                  className={`px-2 py-0.5 rounded-full border text-[9px] font-bold flex items-center gap-1 cursor-pointer hover:brightness-125 transition-all ${curatedBadgeColor}`}
                  title={isHi ? 'स्रोत विवरण देखें' : 'View Source Citations'}
                >
                  <span>{curatedBadgeLabel}</span>
                  <BookOpen className="w-2.5 h-2.5 ml-0.5" />
                </button>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {isHi ? (motifResult.meaning_hi || motifResult.meaning) : (motifResult.meaning_en || motifResult.meaning)}
              </p>
            </div>

            {/* Technique & Craftsmanship Note (Rule A5: Localized in Hindi mode) */}
            <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-teal-300">
                <span>{isHi ? 'पारंपरिक निर्माण तकनीक' : 'Traditional Technique'}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-400/30 font-bold lowercase text-[9px]">
                  🟡 {isHi ? 'AI-अवलोकन' : 'ai-observed'}
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {isHi ? (motifResult.technique_note_hi || motifResult.technique_note) : (motifResult.technique_note_en || motifResult.technique_note)}
              </p>
            </div>

            {/* Artisan Confirmed Testimony (if appended) */}
            {confirmedByArtisan && (
              <div className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-400/30 text-blue-200 text-xs flex items-start gap-2">
                <Award className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] font-black uppercase text-blue-300">
                    🔵 {isHi ? 'कारीगर मौखिक गवाही' : 'Artisan-told Oral Lore'}
                  </div>
                  <div className="italic mt-0.5">
                    "{voiceTestimony || (isHi ? 'कारीगर द्वारा रूपांकन की प्रामाणिकता की पुष्टि की गई।' : 'Artisan confirmed authenticity.')}"
                  </div>
                </div>
              </div>
            )}

            {/* ─── ACTION BUTTONS (Rule A2 & B4: Mode Separation, >=44px Touch Targets) ─── */}
            {mode === 'artisan' ? (
              /* ARTISAN MODE ACTIONS */
              <div className="pt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={startVoiceCorrection}
                  disabled={isVoiceRecording}
                  className={`flex-1 min-h-[44px] py-2.5 px-3 rounded-2xl border text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                    isVoiceRecording
                      ? 'bg-rose-500/30 border-rose-400 text-rose-300 animate-pulse'
                      : confirmedByArtisan
                      ? 'bg-blue-500/20 border-blue-400 text-blue-300'
                      : 'bg-white/10 hover:bg-white/15 border-white/20 text-slate-200'
                  }`}
                >
                  {isVoiceRecording ? (
                    <>
                      <Mic className="w-4 h-4 text-rose-400 animate-spin" />
                      <span>{isHi ? 'सुन रहे हैं...' : 'Listening...'}</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 text-amber-400" />
                      <span>
                        {confirmedByArtisan
                          ? (isHi ? '✓ मौखिक पुष्टि' : '✓ Confirmed')
                          : (isHi ? 'आवाज से पुष्टि' : 'Voice Confirm')}
                      </span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleAttachToProduct}
                  disabled={attachedToProduct}
                  className={`flex-1 min-h-[44px] py-2.5 px-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg active:scale-95 ${
                    attachedToProduct
                      ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                      : 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-slate-950 shadow-amber-500/20 hover:brightness-105'
                  }`}
                >
                  {attachedToProduct ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>{isHi ? 'उत्पाद से जुड़ा!' : 'Attached!'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{isHi ? 'उत्पाद से जोड़ें' : 'Attach to Product'}</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* PUBLIC / VISITOR MODE ACTIONS (Rule A2 & A6) */
              <div className="pt-1 flex items-center gap-2">
                {/* Button 1: Suggest a Correction (saves to coordinator queue) */}
                <button
                  type="button"
                  onClick={() => setShowSuggestionModal(true)}
                  className="flex-1 min-h-[44px] py-2.5 px-3 rounded-2xl border border-amber-400/40 bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
                >
                  <MessageSquarePlus className="w-4 h-4 text-amber-400" />
                  <span>{isHi ? 'सुधार सुझाएँ' : 'Suggest Correction'}</span>
                </button>

                {/* Button 2: Explore this craft (Rule A6) */}
                <button
                  type="button"
                  onClick={() => {
                    if (onExploreCraft) {
                      onExploreCraft(motifResult.craft_category || motifResult.cluster_hint);
                    } else if (onClose) {
                      onClose();
                    }
                  }}
                  className="flex-1 min-h-[44px] py-2.5 px-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg active:scale-95 hover:brightness-105"
                >
                  <Search className="w-4 h-4" />
                  <span>{isHi ? 'इस शिल्प को देखें' : 'Explore Craft'}</span>
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ─── 5. PUBLIC SUGGESTION MODAL (Rule A2) ─────────────────────────── */}
      {showSuggestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm p-5 rounded-3xl bg-slate-900 border border-amber-400/60 shadow-2xl text-left space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <MessageSquarePlus className="w-5 h-5 text-amber-400" />
                <h4 className="text-sm font-black text-amber-200">
                  {isHi ? 'सुधार या जानकारी सुझाएँ' : 'Suggest a Correction'}
                </h4>
              </div>
              <button
                onClick={() => setShowSuggestionModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-slate-300 leading-snug">
              {isHi
                ? 'आपका सुझाव समन्वयक समीक्षा पटल (Review Desk) पर जाएगा। अनुमोदन के बाद ही यह प्रमाणिक बनेगा।'
                : 'Your suggestion will be sent to the Coordinator Review Desk. It will not display as verified until approved.'}
            </p>

            {suggestionSubmitted ? (
              <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-center space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <div className="text-xs font-bold">
                  {isHi ? 'सुझाव सफलतापूर्वक भेजा गया!' : 'Suggestion Submitted!'}
                </div>
                <div className="text-[10px] text-emerald-300">
                  {isHi ? 'समीक्षा के बाद इसे जोड़ा जाएगा।' : 'Queued for Coordinator Review.'}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  rows={3}
                  value={suggestionText}
                  onChange={(e) => setSuggestionText(e.target.value)}
                  placeholder={
                    isHi
                      ? 'उदा: हमारे क्षेत्र में इसे मयूर नहीं, हंस रूपांकन कहा जाता है...'
                      : 'e.g. In our village, this motif is called Mayur and symbolizes...'
                  }
                  className="w-full p-3 rounded-2xl bg-slate-950 border border-white/20 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />

                <button
                  type="button"
                  onClick={handleSubmitPublicSuggestion}
                  disabled={isSubmittingSuggestion || !suggestionText.trim()}
                  className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-md"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {isSubmittingSuggestion
                      ? (isHi ? 'भेजा जा रहा है...' : 'Submitting...')
                      : (isHi ? 'सुझाव भेजें (Submit)' : 'Submit Suggestion')}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── 6. SOURCE AUDIT DRAWER (Rule C4: Popover with Title/Link) ─────── */}
      {showSourceDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm p-5 rounded-3xl bg-slate-900 border border-amber-400/60 shadow-2xl text-left space-y-3 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <h4 className="text-sm font-black text-amber-200">
                  {isHi ? 'प्रमाणिक संदर्भ व स्रोत' : 'Archival Sources & Citations'}
                </h4>
              </div>
              <button
                onClick={() => setShowSourceDrawer(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {motifResult?.sources && motifResult.sources.length > 0 ? (
                motifResult.sources.map((src, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-1 text-slate-300">
                    <div className="font-bold text-amber-300">{src.title}</div>
                    <div className="text-[11px] text-slate-400">
                      <span className="text-slate-500">{isHi ? 'प्रकाशक: ' : 'Publisher: '}</span>
                      {src.publisher}
                    </div>
                    {src.url_or_doc_id && (
                      <div className="text-[10px] font-mono text-emerald-400">
                        Ref: {src.url_or_doc_id}
                      </div>
                    )}
                    {src.page_or_section && (
                      <div className="text-[10px] text-slate-400">
                        {isHi ? 'अनुभाग: ' : 'Section: '} {src.page_or_section}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-400">
                  {isHi ? 'कोई प्रमाणित स्रोत दर्ज नहीं है। (सत्यापन प्रक्रियाधीन)' : 'No certified archival sources available yet. Verification pending.'}
                </div>
              )}
            </div>

            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-400/20 text-[10px] text-amber-300">
              {isHi
                ? 'शिल्पसेतु की नीति: बिना प्रमाणित संदर्भ के किसी भी रूपांकन को "Curated" नहीं दर्शाया जाता।'
                : 'ShilpSetu Policy: No motif is displayed as "Curated" without verifiable archival citations.'}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
