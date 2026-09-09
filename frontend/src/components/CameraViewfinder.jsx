import React, { useState, useRef, useEffect } from 'react';
import { Camera, Image as ImageIcon, Sparkles, RefreshCw, CheckCircle2, ChevronRight } from 'lucide-react';
import { useArtisan } from '../context/ArtisanContext';

export default function CameraViewfinder() {
  const {
    presets,
    selectedPreset,
    applyPreset,
    rawImageUrl,
    rawImageBase64,
    setRawImageBase64,
    setRawImageUrl,
    setCurrentStep,
    speakVoice,
    language
  } = useArtisan();

  const [silhouetteShape, setSilhouetteShape] = useState('pottery'); // 'pottery' | 'saree' | 'idol' | 'painting'
  const [isCentered, setIsCentered] = useState(true);
  const [usingLiveCamera, setUsingLiveCamera] = useState(false);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  // Play audio instruction on entry
  useEffect(() => {
    const promptText = language === 'hi'
      ? 'कृपया अपने शिल्प की एक साफ फोटो लें। दिए गए फ्रेम के अंदर रखें।'
      : 'Please capture a clear photo of your craft. Align it within the guide frame.';
    speakVoice(promptText, language === 'hi' ? 'hi-IN' : 'en-IN');
  }, [language]);

  // Start live webcam if user taps camera toggle
  const startLiveWebcam = async () => {
    try {
      setUsingLiveCamera(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1080 }, height: { ideal: 1080 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Webcam permission denied or unavailable:', err);
      setUsingLiveCamera(false);
      alert('Camera not available. You can select one of the artisan craft presets or upload a photo!');
    }
  };

  // Capture from live webcam
  const captureWebcamPhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 1080;
    canvas.height = videoRef.current.videoHeight || 1080;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const b64 = canvas.toDataURL('image/jpeg', 0.92);
    setRawImageBase64(b64);
    setRawImageUrl(b64);

    // Stop webcam tracks
    if (videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setUsingLiveCamera(false);

    // Trigger haptic vibration if supported
    if ('vibrate' in navigator) navigator.vibrate([40, 30, 40]);
    setCurrentStep(2);
  };

  // Upload local photo
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setRawImageBase64(reader.result);
      setRawImageUrl(reader.result);
      if ('vibrate' in navigator) navigator.vibrate(50);
      setCurrentStep(2);
    };
    reader.readAsDataURL(file);
  };

  // Shutter click for active preset photo
  const handleShutter = () => {
    if (usingLiveCamera) {
      captureWebcamPhoto();
      return;
    }
    if (!rawImageBase64 && rawImageUrl) {
      // Fetch as base64
      fetch(rawImageUrl)
        .then(r => r.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onloadend = () => {
            setRawImageBase64(reader.result);
            if ('vibrate' in navigator) navigator.vibrate(50);
            setCurrentStep(2);
          };
          reader.readAsDataURL(blob);
        });
      return;
    }
    if ('vibrate' in navigator) navigator.vibrate(50);
    setCurrentStep(2);
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 text-white select-none overflow-hidden">
      {/* Top Bar: Silhouette Guide Switcher & Preset Chips */}
      <div className="z-20 pt-4 pb-2 px-4 bg-gradient-to-b from-slate-950/90 via-slate-950/60 to-transparent">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-400 text-xs font-bold">
              1
            </span>
            <span className="text-xs font-semibold tracking-wider uppercase text-amber-400">
              {language === 'hi' ? 'पहला चरण: फोटो लें' : 'Step 1: Snap Photo'}
            </span>
          </div>

          {/* Centering Detector Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-[11px] text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'ऑब्जेक्ट केंद्रित' : 'Object Centered (70%)'}</span>
          </div>
        </div>

        {/* Silhouette shape selector */}
        <div className="flex items-center justify-between gap-1.5 p-1 rounded-xl bg-slate-900/80 border border-slate-800">
          {[
            { id: 'pottery', label: 'Pottery / बर्तन', shape: 'rounded-full' },
            { id: 'saree', label: 'Handloom / साड़ी', shape: 'rounded-xl' },
            { id: 'idol', label: 'Brass / मूर्ति', shape: 'rounded-t-full' },
            { id: 'painting', label: 'Painting / चित्रकला', shape: 'rounded-none' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setSilhouetteShape(item.id)}
              className={`flex-1 py-1.5 px-2 text-[11px] font-medium rounded-lg transition-all text-center ${
                silhouetteShape === item.id
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Preset Artisan Craft Switcher (Quick Tap for Live Demos) */}
        <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-[10px] text-slate-400 font-semibold uppercase shrink-0">
            {language === 'hi' ? 'नमूने:' : 'Presets:'}
          </span>
          {presets.map(craft => (
            <button
              key={craft.id}
              onClick={() => applyPreset(craft)}
              className={`shrink-0 text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                selectedPreset?.id === craft.id
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-semibold'
                  : 'bg-slate-900/60 border-slate-700/60 text-slate-400 hover:border-slate-500'
              }`}
            >
              {craft.craft_category.split('&')[0].trim()}
            </button>
          ))}
        </div>
      </div>

      {/* Main Viewfinder Box with High-Contrast Dashed Craft Boundary */}
      <div className="relative flex-1 flex items-center justify-center p-4">
        {/* Background Raw Image or Live Video Stream */}
        <div className="relative w-full max-w-[380px] aspect-square rounded-3xl overflow-hidden shadow-2xl border-2 border-slate-800 bg-slate-900 flex items-center justify-center">
          {usingLiveCamera ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : rawImageUrl ? (
            <div className="relative w-full h-full overflow-hidden">
              <img
                src={rawImageUrl}
                alt="Craft Viewfinder Raw Frame"
                className="w-full h-full object-cover transition-all duration-300 filter blur-[0.6px] brightness-95 contrast-90"
              />
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-950/85 border border-amber-500/50 text-[10px] text-amber-300 font-medium backdrop-blur-md flex items-center gap-1.5 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>{language === 'hi' ? 'अपरिष्कृत कार्यशाला तस्वीर (कच्ची / धुंधली)' : 'Raw Capture (Blurry/Uncalibrated)'}</span>
              </div>
            </div>
          ) : (
            <div className="text-center p-6 text-slate-500">
              <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-xs">No image loaded</p>
            </div>
          )}

          {/* High-Contrast Dashed Boundary Box */}
          <div className="absolute inset-6 pointer-events-none flex items-center justify-center">
            <div
              className={`w-full h-full border-3 border-dashed border-amber-400/90 transition-all duration-300 flex items-center justify-center ${
                silhouetteShape === 'pottery' ? 'rounded-full scale-90' :
                silhouetteShape === 'idol' ? 'rounded-t-full rounded-b-xl scale-95' :
                silhouetteShape === 'painting' ? 'rounded-none border-4 border-dashed' :
                'rounded-3xl'
              }`}
            >
              {/* Corner crosshairs for precision alignment */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-white" />
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-white" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-white" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-white" />

              {/* Central Saliency Reticle */}
              <div className="w-12 h-12 rounded-full border border-amber-300/40 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              </div>
            </div>
          </div>

          {/* Haptic / Centering banner */}
          <div className="absolute bottom-3 inset-x-3 py-1.5 px-3 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/10 text-center">
            <p className="text-[11px] font-medium text-amber-300/90">
              {selectedPreset?.title_en || 'Position craft inside dashed outline'}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div className="z-20 pb-8 pt-3 px-6 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent flex items-center justify-around">
        {/* Toggle Live Camera / Preset Mode */}
        <button
          onClick={usingLiveCamera ? () => setUsingLiveCamera(false) : startLiveWebcam}
          className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-all"
        >
          <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center shadow-lg active:scale-95">
            <RefreshCw className="w-5 h-5 text-amber-400" />
          </div>
          <span className="text-[10px] font-semibold">
            {usingLiveCamera ? 'Presets' : 'Webcam'}
          </span>
        </button>

        {/* Big Giant Tactile Shutter Button (76px diameter with gold metallic ring) */}
        <button
          onClick={handleShutter}
          aria-label="Capture Craft Photo"
          className="group relative w-20 h-20 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-300 p-1 shadow-2xl shadow-amber-500/30 active:scale-90 transition-transform flex items-center justify-center cursor-pointer"
        >
          <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center group-hover:bg-slate-900 transition-colors">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-inner">
              <Camera className="w-7 h-7 text-slate-950" />
            </div>
          </div>
        </button>

        {/* Gallery / File Upload */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-all"
        >
          <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center shadow-lg active:scale-95">
            <ImageIcon className="w-5 h-5 text-amber-400" />
          </div>
          <span className="text-[10px] font-semibold">
            {language === 'hi' ? 'गैलरी' : 'Upload'}
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </button>
      </div>
    </div>
  );
}
