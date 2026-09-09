import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getCraftPresets,
  enhanceImage,
  processVoiceCatalog,
  calculatePricing,
} from '../services/api';

const ArtisanContext = createContext(null);

export const SUPPORTED_LANGUAGES = [
  { code: 'hi', name: 'हिन्दी', label: 'Hindi' },
  { code: 'mr', name: 'मराठी', label: 'Marathi' },
  { code: 'bn', name: 'বাংলা', label: 'Bengali' },
  { code: 'ta', name: 'தமிழ்', label: 'Tamil' },
  { code: 'te', name: 'తెలుగు', label: 'Telugu' },
  { code: 'kn', name: 'ಕನ್ನಡ', label: 'Kannada' },
  { code: 'gu', name: 'ગુજરાતી', label: 'Gujarati' },
  { code: 'or', name: 'ଓଡ଼ିଆ', label: 'Odia' },
  { code: 'en', name: 'English', label: 'English' },
];

export function ArtisanProvider({ children }) {
  const [currentStep, setCurrentStep] = useState(0); // 0: Home, 1: Snap, 2: Speak, 3: Review
  const [language, setLanguage] = useState('hi');
  const [presets, setPresets] = useState([]);
  const [selectedPreset, setSelectedPreset] = useState(null);

  // Images
  const [rawImageBase64, setRawImageBase64] = useState(null);
  const [rawImageUrl, setRawImageUrl] = useState(null);
  const [studioImageBase64, setStudioImageBase64] = useState(null);
  const [studioImageUrl, setStudioImageUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStatusText, setProcessStatusText] = useState('');

  // Voice & Transcript
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);

  // Catalog & Pricing Metadata
  const [catalogData, setCatalogData] = useState(null);
  const [pricingData, setPricingData] = useState(null);
  const [artisanExpectedPrice, setArtisanExpectedPrice] = useState(null);

  // Active Innovation Modals
  const [activeModal, setActiveModal] = useState(null); // 'reel' | 'bargain' | 'watermark' | 'ondc' | 'published'

  // Load presets on mount
  useEffect(() => {
    async function loadPresets() {
      try {
        const data = await getCraftPresets();
        if (data && data.crafts) {
          setPresets(data.crafts);
          // Set initial default preset (Gorakhpur Terracotta)
          const defaultCraft = data.crafts.find(c => c.id.includes('NBCFDC-002')) || data.crafts[0];
          if (defaultCraft) {
            applyPreset(defaultCraft);
          }
        }
      } catch (err) {
        console.error('Error loading presets:', err);
      }
    }
    loadPresets();
  }, []);

  // Set active craft preset
  const applyPreset = async (craft) => {
    setSelectedPreset(craft);
    const rawUrl = craft.raw_image_url || craft.sample_image_url || '/terracotta_pot_raw.png';
    setRawImageUrl(rawUrl);
    setTranscript(craft.sample_transcript_hi || craft.sample_transcript_en || '');
    
    // Fetch image and convert to base64
    try {
      const response = await fetch(rawUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        setRawImageBase64(reader.result);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.warn('Could not pre-load sample image bytes:', err);
    }
  };

  // Automated Text to Speech (TTS)
  const speakVoice = (text, langCode = 'hi-IN') => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel(); // cancel any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    utterance.pitch = 1.0;
    
    // Attempt to pick regional voice
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith(langCode.slice(0, 2)));
    if (voice) {
      utterance.voice = voice;
    }
    window.speechSynthesis.speak(utterance);
  };

  // Run End-to-End AI Enhancement and Catalog Generation
  const processCaptureAndVoice = async (overrideBase64 = null, overrideTranscript = null) => {
    let imgB64 = overrideBase64 || rawImageBase64;
    const txt = overrideTranscript || transcript || selectedPreset?.sample_transcript_hi || 'यह हस्तनिर्मित पारंपरिक भारतीय शिल्प है। 6 घंटे की मेहनत से तैयार हुआ है।';

    // Ensure we have base64 or fetch from rawImageUrl
    if (!imgB64 && (rawImageUrl || selectedPreset?.raw_image_url || selectedPreset?.sample_image_url)) {
      const targetUrl = rawImageUrl || selectedPreset?.raw_image_url || selectedPreset?.sample_image_url || '/terracotta_pot_raw.png';
      try {
        const resp = await fetch(targetUrl);
        const blob = await resp.blob();
        imgB64 = await new Promise(resolve => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
        if (imgB64) setRawImageBase64(imgB64);
      } catch (e) {
        console.warn('Could not auto-fetch raw image base64:', e);
      }
    }

    setIsProcessing(true);
    setProcessStatusText('1. AI Studio: Removing background & synthesizing natural contact shadow...');

    try {
      // Step A: Image Studio Enhancement (Transforms blurry/raw workshop photo into clean 4K studio render)
      const studioRes = await enhanceImage({ imageBase64: imgB64 });
      const cleanUrl = studioRes.studio_url || selectedPreset?.clean_image_url || '/terracotta_pot_clean.png';
      setStudioImageBase64(studioRes.processed_base64);
      setStudioImageUrl(cleanUrl);

      setProcessStatusText('2. Multimodal Cataloger: Generating MoSJE bilingual listing with Gemini 2.5 Flash...');

      // Step B: Catalog Generation
      const catRes = await processVoiceCatalog({
        imageBase64: studioRes.processed_base64,
        language,
        transcript: txt,
        categoryHint: selectedPreset?.craft_category || 'Handicraft',
      });
      setCatalogData(catRes);

      setProcessStatusText('3. Pricing Engine: Calculating statutory living wage & channel tiers...');

      // Step C: Statutory Living Wage Pricing
      const priceRes = await calculatePricing({
        category: catRes.craft_category,
        laborHours: catRes.estimated_hours,
        rawCost: catRes.raw_material_cost_estimate_inr,
        artisanExpectedPrice: artisanExpectedPrice,
      });
      setPricingData(priceRes);

      // Transition to Step 3 (Review & Publish)
      setCurrentStep(3);

      // Auditory Feedback in mother tongue
      setTimeout(() => {
        const titleMsg = language === 'hi'
          ? `आपके शिल्प का शीर्षक है: ${catRes.title_hi}। अनुशंसित उचित मूल्य ₹${priceRes.b2c_price} निर्धारित किया गया है।`
          : `Listing generated: ${catRes.title_en}. Recommended fair living-wage price is ₹${priceRes.b2c_price}.`;
        speakVoice(titleMsg, language === 'hi' ? 'hi-IN' : 'en-IN');
      }, 500);

    } catch (err) {
      console.error('Processing error:', err);
      alert(`AI Studio error: ${err.message}`);
    } finally {
      setIsProcessing(false);
      setProcessStatusText('');
    }
  };

  // Recalculate price when artisan updates labor hours or expected price
  const updatePricing = async (hours, rawCost, expected) => {
    if (!catalogData) return;
    try {
      const priceRes = await calculatePricing({
        category: catalogData.craft_category,
        laborHours: hours,
        rawCost: rawCost,
        artisanExpectedPrice: expected,
      });
      setPricingData(priceRes);
      if (priceRes.is_underpriced && priceRes.underprice_warning_msg_hi) {
        speakVoice(priceRes.underprice_warning_msg_hi, 'hi-IN');
      }
    } catch (e) {
      console.error('Pricing recalculation failed:', e);
    }
  };

  const resetFlow = () => {
    setCurrentStep(0);
    setStudioImageBase64(null);
    setStudioImageUrl(null);
    setCatalogData(null);
    setPricingData(null);
    setActiveModal(null);
  };

  const value = {
    currentStep,
    setCurrentStep,
    language,
    setLanguage,
    presets,
    selectedPreset,
    applyPreset,
    rawImageBase64,
    setRawImageBase64,
    rawImageUrl,
    setRawImageUrl,
    studioImageBase64,
    studioImageUrl,
    isProcessing,
    processStatusText,
    transcript,
    setTranscript,
    isRecording,
    setIsRecording,
    audioBlob,
    setAudioBlob,
    catalogData,
    setCatalogData,
    pricingData,
    setPricingData,
    artisanExpectedPrice,
    setArtisanExpectedPrice,
    activeModal,
    setActiveModal,
    speakVoice,
    processCaptureAndVoice,
    updatePricing,
    resetFlow,
  };

  return (
    <ArtisanContext.Provider value={value}>
      {children}
    </ArtisanContext.Provider>
  );
}

export function useArtisan() {
  const context = useContext(ArtisanContext);
  if (!context) {
    throw new Error('useArtisan must be used within an ArtisanProvider');
  }
  return context;
}
