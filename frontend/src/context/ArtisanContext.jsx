import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getCraftPresets,
  enhanceImage,
  processVoiceCatalog,
  calculatePricing,
  saveProductDraft,
  publishProduct,
  fetchArtisanProducts,
  deleteProductDraft,
} from '../services/api';

const ArtisanContext = createContext(null);

export const SUPPORTED_LANGUAGES = [
  { code: 'hi', label: 'हिन्दी', name: 'Hindi' },
  { code: 'en', label: 'English', name: 'English' },
  { code: 'bn', label: 'বাংলা', name: 'Bengali' },
  { code: 'te', label: 'తెలుగు', name: 'Telugu' },
  { code: 'mr', label: 'मराठी', name: 'Marathi' },
  { code: 'ta', label: 'தமிழ்', name: 'Tamil' },
];

export const MOCK_USERS = [
  {
    phone: '9876543210',
    name: 'राजेश कुमार (Field Coordinator)',
    role: 'coordinator',
    district: 'Varanasi',
    state: 'Uttar Pradesh'
  },
  {
    phone: '9820011223',
    name: 'शांति देवी (Shanti Devi)',
    role: 'artisan',
    artisan_id: 'ART-NBCFDC-8492',
    craft: 'Gorakhpur Terracotta',
    district: 'Gorakhpur',
    state: 'Uttar Pradesh'
  }
];

export function ArtisanProvider({ children }) {
  // Auth & Role State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('shilpsetu_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const loginWithPhone = (phoneNumber) => {
    const cleanPhone = (phoneNumber || '').replace(/\D/g, '').slice(-10);
    let user = MOCK_USERS.find(u => u.phone === cleanPhone);
    if (!user) {
      // Auto-register new artisan matching zero-smartphone IVR pattern
      user = {
        phone: cleanPhone,
        name: `कारीगर #${cleanPhone.slice(-4)}`,
        role: 'artisan',
        artisan_id: `ART-${cleanPhone.slice(-4)}`,
        craft: 'हस्तशिल्प (Craft)',
        isNew: true
      };
    }
    setCurrentUser(user);
    try {
      localStorage.setItem('shilpsetu_user', JSON.stringify(user));
    } catch (e) {
      console.warn('Failed to save session to localStorage', e);
    }
    return user;
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('shilpsetu_user');
    } catch (e) {
      console.warn('Failed to clear session from localStorage', e);
    }
  };

  // Step in workflow: 0 = Home, 1 = Camera, 2 = Voice, 3 = Review & Publish
  const [currentStep, setCurrentStep] = useState(0);
  const [language, setLanguage] = useState('hi');
  const [presets, setPresets] = useState([]);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [activeCategoryMode, setActiveCategoryMode] = useState('auto'); // 'auto' | 'pottery' | 'saree' | 'idol' | 'painting' | 'craft'

  // Images & Multi-Angle Studio Gallery
  const [rawImageBase64, setRawImageBase64] = useState(null);
  const [rawImageUrl, setRawImageUrl] = useState(null);
  const [studioImageBase64, setStudioImageBase64] = useState(null);
  const [studioImageUrl, setStudioImageUrl] = useState(null);
  const [lifestyleImageUrl, setLifestyleImageUrl] = useState(null);
  const [lifestyleImageBase64, setLifestyleImageBase64] = useState(null);
  const [cutoutBase64, setCutoutBase64] = useState(null);
  const [cutoutUrl, setCutoutUrl] = useState(null);
  const [suggestedBackgroundQuery, setSuggestedBackgroundQuery] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStatusText, setProcessStatusText] = useState('');

  // Multi-Angle Workflow: 0 = Hero Front, 1 = Side 45°, 2 = Back/Detail
  const [activeAngleIndex, setActiveAngleIndex] = useState(0);
  const [anglePhotos, setAnglePhotos] = useState([
    { id: 'hero', key: 'hero', title_en: 'Front View (Hero)', title_hi: 'सामने का मुख्य दृश्य', rawBase64: null, studioBase64: null, quality: null },
    { id: 'side', key: 'side', title_en: 'Side Profile (45°)', title_hi: 'किनारे का दृश्य (45°)', rawBase64: null, studioBase64: null, quality: null },
    { id: 'detail', key: 'detail', title_en: 'Back / Detail', title_hi: 'पीछे / बारीक विवरण', rawBase64: null, studioBase64: null, quality: null },
  ]);

  const saveAnglePhoto = (index, { rawBase64, studioBase64, quality }) => {
    setAnglePhotos(prev => {
      const next = [...prev];
      if (next[index]) {
        next[index] = {
          ...next[index],
          rawBase64: rawBase64 !== undefined ? rawBase64 : next[index].rawBase64,
          studioBase64: studioBase64 !== undefined ? studioBase64 : next[index].studioBase64,
          quality: quality !== undefined ? quality : next[index].quality,
        };
      }
      return next;
    });

    if (index === 0) {
      if (rawBase64) {
        setRawImageBase64(rawBase64);
        setRawImageUrl(rawBase64);
      }
      if (studioBase64) {
        setStudioImageBase64(studioBase64);
        setStudioImageUrl(studioBase64);
      }
    }
  };

  // Voice & Transcript
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);

  // Catalog & Pricing Metadata
  const [catalogData, setCatalogData] = useState(null);
  const [pricingData, setPricingData] = useState(null);
  const [artisanExpectedPrice, setArtisanExpectedPrice] = useState(null);

  // Product Lifecycle State: 'session' | 'draft' | 'published'
  const [currentProductId, setCurrentProductId] = useState(() => `ART-${Date.now()}`);
  const [productStatus, setProductStatus] = useState('session'); // 'session' | 'draft' | 'published'
  const [publishedProduct, setPublishedProduct] = useState(null);
  const [savedDrafts, setSavedDrafts] = useState([]);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

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
  const speakVoice = (text, langCode = 'hi-IN', onEnd = null) => {
    if (!('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }
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

    if (onEnd) {
      utterance.onend = () => onEnd();
      utterance.onerror = () => onEnd();
    }

    window.speechSynthesis.speak(utterance);
    return utterance;
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
      if (studioRes.cutout_base64) setCutoutBase64(studioRes.cutout_base64);
      if (studioRes.cutout_url) setCutoutUrl(studioRes.cutout_url);

      setProcessStatusText('2. Multimodal Cataloger: Generating MoSJE bilingual listing with Gemini 2.5 Flash...');

      // Determine effective category hint
      let determinedHint = 'General Handicraft';
      if (activeCategoryMode === 'pottery') determinedHint = 'Terracotta & Pottery';
      else if (activeCategoryMode === 'saree') determinedHint = 'Handloom Textiles';
      else if (activeCategoryMode === 'idol') determinedHint = 'Dhokra & Metalware';
      else if (activeCategoryMode === 'painting') determinedHint = 'Folk Painting';
      else if (activeCategoryMode === 'craft') determinedHint = 'Wood & Bamboo Craft';
      else if (selectedPreset && !overrideBase64 && activeCategoryMode !== 'auto') determinedHint = selectedPreset.craft_category;

      // Step B: Catalog Generation
      const catRes = await processVoiceCatalog({
        imageBase64: studioRes.processed_base64,
        language,
        transcript: txt,
        categoryHint: determinedHint,
      });
      setCatalogData(catRes);
      if (catRes?.suggested_background_query) {
        setSuggestedBackgroundQuery(catRes.suggested_background_query);
      }

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

  // Draft & Publish Lifecycle Handlers
  const refreshDrafts = async () => {
    try {
      const res = await fetchArtisanProducts(true);
      if (res && res.products) {
        setSavedDrafts(res.products.filter(p => p.status === 'draft'));
      }
    } catch (err) {
      console.warn('Could not load drafts:', err);
    }
  };

  useEffect(() => {
    refreshDrafts();
  }, []);

  const saveCurrentDraft = async () => {
    if (!catalogData) return;
    setIsSavingDraft(true);
    try {
      const productId = currentProductId || selectedPreset?.id || `ART-${Date.now()}`;
      const payload = {
        id: productId,
        title_hi: catalogData.title_hi || '',
        title_en: catalogData.title_en || '',
        description_hi: catalogData.description_hi || '',
        description_en: catalogData.description_en || '',
        craft_category: catalogData.craft_category || '',
        technique: catalogData.technique || '',
        raw_cost: pricingData?.raw_cost || catalogData.raw_material_cost_estimate_inr || 0,
        labor_hours: pricingData?.labor_hours || catalogData.estimated_hours || 0,
        b2c_price: pricingData?.b2c_price || 0,
        b2b_price: pricingData?.b2b_price || 0,
        gem_price: pricingData?.gem_price || 0,
        artisan_name: selectedPreset?.artisan_name || 'Shanti Devi',
        beneficiary_id: selectedPreset?.beneficiary_id || 'MoSJE-NBCFDC-01',
        cluster_pin: selectedPreset?.cluster_pin || '273001',
        raw_image_url: rawImageUrl || '',
        studio_image_url: studioImageUrl || '',
        lifestyle_image_url: lifestyleImageUrl || '',
      };
      const res = await saveProductDraft(payload);
      setProductStatus('draft');
      await refreshDrafts();
      const msg = language === 'hi'
        ? 'कलाकृति का ड्राफ्ट सुरक्षित कर लिया गया है। यह 24 घंटे तक सुरक्षित रहेगा।'
        : 'Draft saved successfully. It will remain saved for 24 hours.';
      speakVoice(msg, language === 'hi' ? 'hi-IN' : 'en-IN');
      return res;
    } catch (err) {
      console.error('Error saving draft:', err);
      alert(`Draft save error: ${err.message}`);
    } finally {
      setIsSavingDraft(false);
    }
  };

  const publishCurrentProduct = async () => {
    if (!catalogData) return;
    setIsPublishing(true);
    try {
      const productId = currentProductId || selectedPreset?.id || `ART-${Date.now()}`;
      const payload = {
        id: productId,
        title_hi: catalogData.title_hi || '',
        title_en: catalogData.title_en || '',
        description_hi: catalogData.description_hi || '',
        description_en: catalogData.description_en || '',
        craft_category: catalogData.craft_category || '',
        technique: catalogData.technique || '',
        raw_cost: pricingData?.raw_cost || catalogData.raw_material_cost_estimate_inr || 0,
        labor_hours: pricingData?.labor_hours || catalogData.estimated_hours || 0,
        b2c_price: pricingData?.b2c_price || 0,
        b2b_price: pricingData?.b2b_price || 0,
        gem_price: pricingData?.gem_price || 0,
        artisan_name: selectedPreset?.artisan_name || 'Shanti Devi',
        beneficiary_id: selectedPreset?.beneficiary_id || 'MoSJE-NBCFDC-01',
        cluster_pin: selectedPreset?.cluster_pin || '273001',
        raw_image_url: rawImageUrl || '',
        studio_image_url: studioImageUrl || '',
        lifestyle_image_url: lifestyleImageUrl || '',
      };
      const res = await publishProduct(productId, {
        productData: payload,
        pricingData,
        artisanInfo: {
          beneficiary_id: payload.beneficiary_id,
          artisan_name: payload.artisan_name,
          cluster_pin: payload.cluster_pin,
        },
        verifyBaseUrl: window.location.origin
      });
      setProductStatus('published');
      setPublishedProduct(res);
      await refreshDrafts();
      setActiveModal('published');
      const msg = language === 'hi'
        ? 'बधाई हो! आपका शिल्प ओएनडीसी और जीईएम पर लाइव प्रसारित हो गया है और सत्यापन क्यूआर कोड बन गया है।'
        : 'Congratulations! Your craft is now broadcast live on ONDC & GeM with verified QR code.';
      speakVoice(msg, language === 'hi' ? 'hi-IN' : 'en-IN');
      return res;
    } catch (err) {
      console.error('Error publishing product:', err);
      alert(`Publish error: ${err.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const resumeDraft = (draft) => {
    setCurrentProductId(draft.id);
    setProductStatus('draft');
    setStudioImageUrl(draft.studio_image_url || draft.raw_image_url);
    setRawImageUrl(draft.raw_image_url);
    if (draft.lifestyle_image_url) {
      setLifestyleImageUrl(draft.lifestyle_image_url);
      setLifestyleImageBase64(draft.lifestyle_image_url);
    }
    setCatalogData({
      title_hi: draft.title_hi,
      title_en: draft.title_en,
      description_hi: draft.description_hi,
      description_en: draft.description_en,
      craft_category: draft.craft_category,
      technique: draft.technique,
      estimated_hours: draft.labor_hours,
      raw_material_cost_estimate_inr: draft.raw_cost,
    });
    setPricingData({
      b2c_price: draft.b2c_price,
      b2b_price: draft.b2b_price,
      gem_price: draft.gem_price,
      raw_cost: draft.raw_cost,
      labor_hours: draft.labor_hours,
    });
    setCurrentStep(3);
    const msg = language === 'hi' ? `ड्राफ्ट लोड हुआ: ${draft.title_hi || draft.title_en}` : `Draft resumed: ${draft.title_en}`;
    speakVoice(msg, language === 'hi' ? 'hi-IN' : 'en-IN');
  };

  const discardDraft = async (productId) => {
    try {
      await deleteProductDraft(productId);
      await refreshDrafts();
      if (currentProductId === productId) {
        resetFlow();
      }
    } catch (err) {
      console.error('Error discarding draft:', err);
    }
  };

  const resetFlow = () => {
    setCurrentStep(0);
    setStudioImageBase64(null);
    setStudioImageUrl(null);
    setLifestyleImageUrl(null);
    setLifestyleImageBase64(null);
    setCutoutBase64(null);
    setCutoutUrl(null);
    setSuggestedBackgroundQuery(null);
    setRawImageBase64(null);
    setRawImageUrl(null);
    setActiveAngleIndex(0);
    setAnglePhotos([
      { id: 'hero', key: 'hero', title_en: 'Front View (Hero)', title_hi: 'सामने का मुख्य दृश्य', rawBase64: null, studioBase64: null, quality: null },
      { id: 'side', key: 'side', title_en: 'Side Profile (45°)', title_hi: 'किनारे का दृश्य (45°)', rawBase64: null, studioBase64: null, quality: null },
      { id: 'detail', key: 'detail', title_en: 'Back / Detail', title_hi: 'पीछे / बारीक विवरण', rawBase64: null, studioBase64: null, quality: null },
    ]);
    setCatalogData(null);
    setPricingData(null);
    setActiveModal(null);
    setProductStatus('session');
    setPublishedProduct(null);
    setCurrentProductId(`ART-${Date.now()}`);
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
    setStudioImageBase64,
    setStudioImageUrl,
    lifestyleImageUrl,
    setLifestyleImageUrl,
    lifestyleImageBase64,
    setLifestyleImageBase64,
    cutoutBase64,
    setCutoutBase64,
    cutoutUrl,
    setCutoutUrl,
    suggestedBackgroundQuery,
    setSuggestedBackgroundQuery,
    activeAngleIndex,
    setActiveAngleIndex,
    anglePhotos,
    setAnglePhotos,
    saveAnglePhoto,
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
    activeCategoryMode,
    setActiveCategoryMode,
    currentProductId,
    productStatus,
    publishedProduct,
    savedDrafts,
    isSavingDraft,
    isPublishing,
    saveCurrentDraft,
    publishCurrentProduct,
    resumeDraft,
    discardDraft,
    refreshDrafts,
    speakVoice,
    processCaptureAndVoice,
    updatePricing,
    resetFlow,
    currentUser,
    loginWithPhone,
    logout,
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

