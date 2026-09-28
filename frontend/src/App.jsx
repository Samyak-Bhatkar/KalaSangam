import React, { useState, useEffect } from 'react';
import {
  Camera,
  Mic,
  CheckCircle,
  Globe2,
  Video,
  Shield,
  Fingerprint,
  RotateCcw,
  Sparkles,
  Volume2,
  Share2,
  HelpCircle,
  Smartphone,
  Home,
  Bookmark,
  FileText,
  Loader2,
  Check,
  PhoneCall,
  LogOut,
  UserCheck,
  Store,
  ChevronDown,
  ShieldCheck,
  X,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Layers,
  Palette,
  IndianRupee,
  CheckCircle2,
  Tag,
  Eye,
} from 'lucide-react';
import { useArtisan, SUPPORTED_LANGUAGES } from './context/ArtisanContext';
import HomeCommandCenter from './components/HomeCommandCenter';
import CameraViewfinder from './components/CameraViewfinder';
import VoiceRecorder from './components/VoiceRecorder';
import StudioReviewCard from './components/StudioReviewCard';
import PricingCard from './components/PricingCard';
import ReelPreviewModal from './components/ReelPreviewModal';
import BargainGuard from './components/BargainGuard';
import DigitalGIWatermarkModal from './components/DigitalGIWatermarkModal';
import ONDCExportBadge from './components/ONDCExportBadge';
import PublicVerifyScreen from './components/PublicVerifyScreen';
import KeypadPhoneSimulator from './components/KeypadPhoneSimulator';
import CoordinatorReviewPanel from './components/CoordinatorReviewPanel';
import AuthLoginScreen from './components/AuthLoginScreen';
import BuyerStorefrontScreen from './components/BuyerStorefrontScreen';
import VyaparNitiScreen from './components/VyaparNitiScreen';
import MotifDecoder from './components/MotifDecoder';
import ExplorerShell from './components/ExplorerShell';

export default function App() {
  const {
    currentStep,
    setCurrentStep,
    language,
    setLanguage,
    resetFlow,
    activeModal,
    setActiveModal,
    catalogData,
    pricingData,
    speakVoice,
    productStatus,
    isSavingDraft,
    isPublishing,
    saveCurrentDraft,
    publishCurrentProduct,
    currentUser,
    logout,
    studioImageUrl,
    lifestyleImageUrl,
    rawImageUrl,
    cutoutBase64,
  } = useArtisan();

  // Prasaran Guided 4-Step Wizard State
  const [activePrasaranStep, setActivePrasaranStep] = useState(1);

  // Slide-over Profile Drawer State
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);

  // Support public heritage explorer shell with NO login (/explore, ?view=explore, ?explore=true)
  const [publicExplorerOpen, setPublicExplorerOpen] = useState(() => {
    if (typeof window === 'undefined') return false;
    const pathname = window.location.pathname;
    if (pathname === '/explore' || pathname.startsWith('/explore')) return true;
    const params = new URLSearchParams(window.location.search);
    return params.get('view') === 'explore' || params.get('explore') === 'true';
  });

  // Support public motif scanner route with NO login (?view=scan or ?scan=true)
  const [publicScanOpen, setPublicScanOpen] = useState(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return params.get('view') === 'scan' || params.get('scan') === 'true';
  });
  const [storefrontSearchQuery, setStorefrontSearchQuery] = useState('');

  // Support public buyer storefront route with NO login (?view=storefront or ?storefront=true)
  const [publicStorefront, setPublicStorefront] = useState(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return params.get('view') === 'storefront' || params.get('storefront') === 'true';
  });

  // Support public item & QR verification route (/item/:id, /verify/:id, /record/:id, ?item=:id, ?verify=:id, ?id=:id)
  const [verifyId, setVerifyId] = useState(() => {
    if (typeof window === 'undefined') return null;
    const pathname = window.location.pathname;
    if (pathname.startsWith('/verify/')) {
      return pathname.replace('/verify/', '').replace(/\/$/, '');
    }
    if (pathname.startsWith('/item/')) {
      return pathname.replace('/item/', '').replace(/\/$/, '');
    }
    if (pathname.startsWith('/record/')) {
      return pathname.replace('/record/', '').replace(/\/$/, '');
    }
    const params = new URLSearchParams(window.location.search);
    return params.get('item') || params.get('verify') || params.get('id') || null;
  });

  // Support ?view=coordinator and ?view=vyapar-niti direct links
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('view') === 'coordinator') {
        setActiveModal('coordinator');
      } else if (params.get('view') === 'vyapar-niti' || params.get('view') === 'pricing') {
        setCurrentStep('vyapar-niti');
      }
    }
  }, [setActiveModal, setCurrentStep]);

  // 0. PUBLIC HERITAGE EXPLORER SHELL (Card 1: Zero login required)
  if (publicExplorerOpen) {
    return (
      <ExplorerShell
        language={language}
        onToggleLanguage={() => setLanguage(language === 'hi' ? 'en' : 'hi')}
        onBack={() => {
          window.history.pushState({}, '', '/');
          setPublicExplorerOpen(false);
        }}
        onOpenMarketplace={() => {
          window.history.pushState({}, '', '?view=storefront');
          setPublicExplorerOpen(false);
          setPublicStorefront(true);
        }}
      />
    );
  }

  // 0.1 PUBLIC MOTIF SCANNER (Zero login required - Rule A1)
  if (publicScanOpen) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-0 md:p-6 select-none font-sans">
        <div className="relative w-full md:max-w-[430px] h-screen md:h-[900px] md:max-h-[95vh] bg-slate-950 md:rounded-[40px] md:border md:border-amber-400/40 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden">
          <MotifDecoder
            isOpen={true}
            mode="public"
            onClose={() => {
              window.history.pushState({}, '', '/');
              setPublicScanOpen(false);
            }}
            onExploreCraft={(cluster) => {
              window.history.pushState({}, '', '?view=storefront');
              setStorefrontSearchQuery(cluster || '');
              setPublicScanOpen(false);
              setPublicStorefront(true);
            }}
          />
        </div>
      </div>
    );
  }

  // 1. PUBLIC BUYER STOREFRONT (Zero login required)
  if (publicStorefront) {
    return (
      <BuyerStorefrontScreen
        onGoToLogin={() => {
          window.history.pushState({}, '', '/');
          setPublicStorefront(false);
        }}
        onOpenExplorer={() => {
          window.history.pushState({}, '', '/explore');
          setPublicStorefront(false);
          setPublicExplorerOpen(true);
        }}
        onScanMotifPublic={() => {
          window.history.pushState({}, '', '?view=scan');
          setPublicScanOpen(true);
        }}
        initialSearchQuery={storefrontSearchQuery}
      />
    );
  }

  // 2. PUBLIC QR VERIFICATION / ITEM DOSSIER ROUTE (Zero login required)
  if (verifyId) {
    return (
      <PublicVerifyScreen
        productId={verifyId}
        onBack={() => {
          window.history.pushState({}, '', '/');
          setVerifyId(null);
        }}
        onBrowseStorefront={() => {
          window.history.pushState({}, '', '?view=storefront');
          setVerifyId(null);
          setPublicStorefront(true);
        }}
      />
    );
  }

  // 3. UNAUTHENTICATED USERS: SHARED PHONE + OTP LOGIN SCREEN
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] text-slate-900 flex items-center justify-center p-0 md:p-6 select-none font-sans">
        <div className="relative w-full md:max-w-[430px] h-screen md:h-[900px] md:max-h-[95vh] bg-[#FDFBF7] md:rounded-[40px] md:border md:border-slate-200/80 shadow-[0_20px_50px_rgba(0,0,0,0.08)] flex flex-col overflow-hidden">
          <AuthLoginScreen
            onBrowseStorefront={() => {
              window.history.pushState({}, '', '?view=storefront');
              setPublicStorefront(true);
            }}
            onScanMotifPublic={() => {
              window.history.pushState({}, '', '?view=scan');
              setPublicScanOpen(true);
            }}
            onOpenExplorer={() => {
              window.history.pushState({}, '', '/explore');
              setPublicExplorerOpen(true);
            }}
          />
        </div>
      </div>
    );
  }

  // 4. COORDINATOR ROLE: DIRECT TO COORDINATOR REVIEW PANEL WORKSPACE
  if (currentUser.role === 'coordinator') {
    return (
      <CoordinatorReviewPanel
        user={currentUser}
        onLogout={logout}
        onClose={null}
      />
    );
  }

  // 5. ARTISAN ROLE: ARTISAN HOME & CATALOGING STUDIO WORKSPACE
  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 flex items-center justify-center p-0 md:p-6 select-none font-sans">
      {/* Mobile-First Application Frame (390px-430px optimized, native bezel on desktop) */}
      <div className="relative w-full md:max-w-[430px] h-screen md:h-[900px] md:max-h-[95vh] bg-[#FDFBF7] md:rounded-[40px] md:border md:border-slate-200/80 shadow-[0_20px_50px_rgba(0,0,0,0.08)] flex flex-col overflow-hidden">
        
        {/* ==================================================================== */}
        {/* REFINED 56px HEADER (Minimal, Verified Trust Badge, Language Pill, Avatar) */}
        {/* ==================================================================== */}
        <header className="z-30 h-14 px-3.5 bg-[#FBF9F5]/95 backdrop-blur-md border-b border-black/[0.06] flex items-center justify-between shrink-0 shadow-xs">
          {/* Left: Brand Emblem + Title + Single Consolidated Verified Badge */}
          <div className="flex items-center gap-2">
            <img
              src="/brand_emblem.png"
              alt="ShilpSetu Emblem"
              className="w-7 h-7 rounded-full ring-1 ring-amber-500/20 object-cover shrink-0 shadow-xs"
            />
            <div className="flex items-center gap-1.5">
              <span className="text-[15px] font-black tracking-tight text-stone-900 font-sans">
                ShilpSetu
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200/80 shadow-2xs">
                <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>{language === 'hi' ? 'सत्यापित कारीगर' : 'Verified Artisan'}</span>
              </span>
            </div>
          </div>

          {/* Right: Quick IVR + Language Pill + Return + Tappable Avatar with Menu */}
          <div className="flex items-center gap-2">
            {/* Quick Missed-Call / IVR Launcher */}
            <button
              onClick={() => setActiveModal('ivr')}
              title="बिना इंटरनेट ऑर्डर - IVR (Keypad Phone)"
              className="w-8 h-8 rounded-full bg-emerald-50 hover:bg-emerald-100/90 border border-emerald-300/80 text-emerald-800 flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-xs"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-700" />
            </button>

            {/* Language Selector Pill */}
            <div className="relative inline-flex items-center rounded-full bg-white border border-stone-200 shadow-2xs px-2.5 py-1 text-xs font-semibold text-stone-700 hover:border-amber-400 transition-colors">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                aria-label="Select Language"
                className="bg-transparent text-stone-800 font-bold text-xs focus:outline-none cursor-pointer pr-4 appearance-none"
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code} className="bg-white text-stone-900">
                    {lang.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-stone-400 pointer-events-none absolute right-2" />
            </div>

            {/* Back/Reset when in deeper steps */}
            {currentStep > 0 && (
              <button
                onClick={resetFlow}
                title="Return to Home / Restart Flow"
                className="w-8 h-8 rounded-full bg-white hover:bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-600 hover:text-stone-900 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Tappable Artisan Avatar */}
            <button
              onClick={() => setIsProfileDrawerOpen(true)}
              title="Artisan Profile & Settings"
              className="relative w-8 h-8 rounded-full ring-2 ring-white border border-stone-300 shadow-xs cursor-pointer active:scale-95 transition-transform overflow-visible shrink-0"
            >
              <img
                src="/artisan_shanti_devi.png"
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
            </button>
          </div>
        </header>

        {/* Slide-over Profile & Session Drawer */}
        {isProfileDrawerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/40 backdrop-blur-xs animate-fadeIn">
            <div className="relative w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl border border-stone-200 text-stone-900 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#C85A32]" />
                  <h3 className="text-sm font-black text-stone-900">कारीगर प्रोफ़ाइल (Profile)</h3>
                </div>
                <button
                  onClick={() => setIsProfileDrawerOpen(false)}
                  className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Artisan Summary */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#FBF9F5] border border-stone-200/80">
                <img
                  src="/artisan_shanti_devi.png"
                  alt="Shanti Devi"
                  className="w-12 h-12 rounded-full border-2 border-amber-400 object-cover shadow-sm shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-black text-stone-900">शांति देवी</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold">सत्यापित</span>
                  </div>
                  <p className="text-[11px] font-mono text-stone-500">{currentUser.phone}</p>
                  <p className="text-[10px] text-[#C85A32] font-semibold">NBCFDC #8492 • गोरखपुर शिल्पकार</p>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => {
                    setIsProfileDrawerOpen(false);
                    window.history.pushState({}, '', '?view=storefront');
                    setPublicStorefront(true);
                  }}
                  className="w-full py-2.5 px-3.5 rounded-2xl bg-stone-100 hover:bg-stone-200/80 text-stone-800 font-bold text-xs flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-[#C85A32]" />
                    <span>सार्वजनिक दुकान देखें (View Store)</span>
                  </div>
                  <span className="text-[10px] text-stone-400">दुकान लिंक &rarr;</span>
                </button>

                <button
                  onClick={() => {
                    setIsProfileDrawerOpen(false);
                    logout();
                  }}
                  className="w-full py-2.5 px-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100/80 text-rose-700 font-bold text-xs flex items-center justify-between border border-rose-200/60 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <LogOut className="w-4 h-4 text-rose-600" />
                    <span>लॉग आउट करें (Log out)</span>
                  </div>
                  <span className="text-[10px] text-rose-400">सत्र समाप्त</span>
                </button>
              </div>

              <div className="pt-2 text-center text-[10px] text-stone-400">
                सामाजिक न्याय और अधिकारिता मंत्रालय (MoSJE) • भारत सरकार
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* MAIN WORKFLOW SCREENS                                                */}
        {/* ==================================================================== */}
        <main className={`flex-1 relative ${currentStep === 1 ? 'overflow-hidden' : 'overflow-y-auto'}`}>
          {currentStep === 0 && (
            <HomeCommandCenter onNavigateToVyaparNiti={() => setCurrentStep('vyapar-niti')} />
          )}
          {currentStep === 'vyapar-niti' && (
            <VyaparNitiScreen onBack={() => setCurrentStep(0)} />
          )}
          {currentStep === 1 && <CameraViewfinder />}
          {currentStep === 2 && <VoiceRecorder />}
          {currentStep === 3 && (
            <div className="p-4 space-y-4 pb-36">
              {/* Apple / Google M3 Guided 4-Step Stepper Header */}
              <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-3xl p-3.5 shadow-xl space-y-3">
                {/* Step Pills Row */}
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 1, labelHi: 'विवरण', labelEn: 'Canvas', icon: Sparkles },
                    { id: 2, labelHi: 'पृष्ठभूमि', labelEn: 'Staging', icon: Palette },
                    { id: 3, labelHi: 'मूल्य', labelEn: 'Economics', icon: IndianRupee },
                    { id: 4, labelHi: 'समीक्षा', labelEn: 'Review', icon: CheckCircle2 },
                  ].map((step) => {
                    const Icon = step.icon;
                    const isActive = activePrasaranStep === step.id;
                    const isDone = activePrasaranStep > step.id;

                    return (
                      <button
                        key={step.id}
                        onClick={() => {
                          setActivePrasaranStep(step.id);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`py-2 px-1 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer relative select-none ${
                          isActive
                            ? 'bg-gradient-to-b from-amber-500 to-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/25 ring-2 ring-amber-400 scale-[1.02]'
                            : isDone
                            ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 font-bold'
                            : 'bg-slate-950/40 border border-slate-800/80 text-slate-400 hover:text-slate-300 font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          {isDone ? (
                            <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-[10px] font-black">
                              ✓
                            </span>
                          ) : (
                            <span
                              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                isActive ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {step.id}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-extrabold tracking-tight truncate max-w-full">
                          {language === 'hi' ? step.labelHi : step.labelEn}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Progress Fill Line */}
                <div className="relative w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-400 transition-all duration-300 ease-out rounded-full"
                    style={{ width: `${(activePrasaranStep / 4) * 100}%` }}
                  />
                </div>

                {/* Micro-Context Subtitle */}
                <div className="flex items-center justify-between text-[11px] px-1 text-slate-400">
                  <span className="font-bold text-slate-200">
                    {activePrasaranStep === 1 &&
                      (language === 'hi'
                        ? 'चरण 1: शिल्प प्रामाणिकता व विवरण (The Voice Canvas)'
                        : 'Step 1: The Voice Canvas (Annotation & Detail)')}
                    {activePrasaranStep === 2 &&
                      (language === 'hi'
                        ? 'चरण 2: पृष्ठभूमि चयन (Lifestyle Staging)'
                        : 'Step 2: Staging (Background Selection)')}
                    {activePrasaranStep === 3 &&
                      (language === 'hi'
                        ? 'चरण 3: 3-स्तरीय पारदर्शी मूल्य निर्धारण (Fair Economics)'
                        : 'Step 3: Economics (Pricing & Tiers)')}
                    {activePrasaranStep === 4 &&
                      (language === 'hi'
                        ? 'चरण 4: अंतिम समीक्षा व ONDC प्रसारण (The Final Review)'
                        : 'Step 4: The Final Review')}
                  </span>
                  <span className="text-[10px] text-amber-400 font-extrabold tracking-wider">
                    {activePrasaranStep} / 4
                  </span>
                </div>
              </div>

              {/* STEP 1: The Voice Canvas (Annotation & Detail) */}
              {activePrasaranStep === 1 && (
                <div className="space-y-4 animate-fadeIn pb-24">
                  <StudioReviewCard activeSubStep={1} />
                </div>
              )}

              {/* STEP 2: Staging (Background Selection) */}
              {activePrasaranStep === 2 && (
                <div className="space-y-4 animate-fadeIn pb-24">
                  <StudioReviewCard activeSubStep={2} />
                </div>
              )}

              {/* STEP 3: Economics (Pricing & Tiers) */}
              {activePrasaranStep === 3 && (
                <div className="space-y-4 animate-fadeIn pb-24">
                  <PricingCard />
                </div>
              )}

              {/* STEP 4: The Final Review */}
              {activePrasaranStep === 4 && (
                <div className="space-y-4 animate-fadeIn">
                  {/* Hero Product Summary Card */}
                  <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                          {language === 'hi' ? 'लाइव कैटलॉग सारांश' : 'Live Catalog Ready'}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                        ONDC Ready
                      </span>
                    </div>

                    <div className="flex gap-3.5 items-center">
                      <div className="w-20 h-20 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                        <img
                          src={
                            lifestyleImageUrl ||
                            studioImageUrl ||
                            (cutoutBase64 ? `data:image/png;base64,${cutoutBase64}` : null) ||
                            rawImageUrl ||
                            '/terracotta_vase.png'
                          }
                          alt="Product Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <h4 className="text-sm font-black text-white truncate">
                          {catalogData?.title_hi || catalogData?.title_en || 'गोरखपुर हस्तनिर्मित टेराकोटा शिल्प'}
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate">
                          {catalogData?.category || 'मिट्टी शिल्प (Terracotta & Clay Craft)'}
                        </p>
                        <div className="flex items-center gap-2 pt-0.5">
                          <span className="text-xs font-black text-amber-400">
                            ₹{pricingData?.consumer_price || catalogData?.consumer_price || '1,850'}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-300 font-bold border border-amber-500/20">
                            सीधा कारीगर मूल्य
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ministry Showcase Breakthroughs: 4 Live Modules */}
                  <div className="space-y-2 pt-1">
                    <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Ministry Showcase Breakthroughs:</span>
                      </span>
                      <span className="text-[9px] text-amber-400 font-bold">4 Live Modules</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Breakthrough 1: AI Reel Storyteller */}
                      <button
                        onClick={() => setActiveModal('reel')}
                        className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-rose-500/40 text-left transition-all active:scale-98 cursor-pointer group shadow-lg"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-7 h-7 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                            <Video className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-bold text-white">15s AI Reel</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-tight">
                          Vertical video with Ken Burns zoom & folk music
                        </p>
                      </button>

                      {/* Breakthrough 2: Bargain Guard */}
                      <button
                        onClick={() => setActiveModal('bargain')}
                        className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-left transition-all active:scale-98 cursor-pointer group shadow-lg"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                            <Shield className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-bold text-white">Bargain Guard</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-tight">
                          Autonomous B2B wholesale voice negotiator
                        </p>
                      </button>

                      {/* Breakthrough 3: Digital GI Watermark */}
                      <button
                        onClick={() => setActiveModal('watermark')}
                        className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/40 text-left transition-all active:scale-98 cursor-pointer group shadow-lg"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-7 h-7 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                            <Fingerprint className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-bold text-white">Digital GI</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-tight">
                          DCT Steganographic anti-counterfeit engine
                        </p>
                      </button>

                      {/* Breakthrough 4: ONDC Beckn Schema */}
                      <button
                        onClick={() => setActiveModal('ondc')}
                        className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 text-left transition-all active:scale-98 cursor-pointer group shadow-lg"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                            <Globe2 className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-bold text-white">ONDC & GeM</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-tight">
                          Beckn Retail v1.2.0 Open Commerce payload
                        </p>
                      </button>
                    </div>
                  </div>


                </div>
              )}

              {/* Persistent High-Contrast Floating Action Dock */}
              <div className="fixed bottom-16 inset-x-0 px-4 z-40 max-w-md mx-auto pointer-events-none">
                <div className="pointer-events-auto bg-slate-950/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-2.5 shadow-[0_8px_30px_rgb(0,0,0,0.7)] flex items-center gap-2.5">
                  {activePrasaranStep > 1 && (
                    <button
                      onClick={() => {
                        setActivePrasaranStep((prev) => Math.max(1, prev - 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="py-3 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>{language === 'hi' ? 'पिछला' : 'Back'}</span>
                    </button>
                  )}

                  {activePrasaranStep < 4 ? (
                    <button
                      onClick={() => {
                        setActivePrasaranStep((prev) => Math.min(4, prev + 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-500/25 flex items-center justify-center gap-1.5 transition-all active:scale-97 cursor-pointer"
                    >
                      <span>
                        {language === 'hi'
                          ? activePrasaranStep === 1
                            ? 'आगे बढ़ें: पृष्ठभूमि (Staging)'
                            : activePrasaranStep === 2
                            ? 'आगे बढ़ें: मूल्य निर्धारण'
                            : 'आगे बढ़ें: अंतिम समीक्षा'
                          : activePrasaranStep === 1
                          ? 'Next: Staging'
                          : activePrasaranStep === 2
                          ? 'Next: Economics'
                          : 'Next: Final Review'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    /* Step 4 Dual Action: Draft & Live Publish */
                    <div className="flex-1 grid grid-cols-5 gap-2">
                      <button
                        onClick={saveCurrentDraft}
                        disabled={isSavingDraft || isPublishing}
                        className="col-span-2 py-2.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-bold text-xs shadow-xs active:scale-97 transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        {isSavingDraft ? (
                          <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                        ) : (
                          <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                        )}
                        <span className="truncate">{language === 'hi' ? 'ड्राफ्ट' : 'Draft'}</span>
                      </button>

                      <button
                        onClick={publishCurrentProduct}
                        disabled={isSavingDraft || isPublishing}
                        className="col-span-3 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-xl shadow-emerald-500/30 active:scale-97 transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        {isPublishing ? (
                          <Loader2 className="w-3.5 h-3.5 text-slate-950 animate-spin" />
                        ) : (
                          <Globe2 className="w-3.5 h-3.5 text-slate-950" />
                        )}
                        <span className="truncate">{language === 'hi' ? 'ONDC पर प्रकाशित' : 'Publish Live'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>

        {/* ==================================================================== */}
        {/* POPUP MODALS FOR INNOVATIONS                                        */}
        {/* ==================================================================== */}
        <ReelPreviewModal />
        <BargainGuard />
        <DigitalGIWatermarkModal />
        <ONDCExportBadge />
        {activeModal === 'ivr' && <KeypadPhoneSimulator onClose={() => setActiveModal(null)} />}
        {activeModal === 'coordinator' && <CoordinatorReviewPanel onClose={() => setActiveModal(null)} />}

        {/* ==================================================================== */}
        {/* FLOATING BOTTOM NAVIGATION DOCK (Thumb-Friendly, Large Targets)      */}
        {/* ==================================================================== */}
        {currentStep !== 'vyapar-niti' && (
          <nav
            aria-label="Workflow Navigation"
            className="absolute bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-xl border-t border-stone-200/90 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] px-3 pt-2 pb-2.5 flex items-center justify-around"
          >
            {[
              { step: 0, label: language === 'hi' ? 'होम' : 'Home', icon: Home },
              { step: 1, label: language === 'hi' ? 'फ़ोटो' : 'Snap', icon: Camera },
              { step: 2, label: language === 'hi' ? 'आवाज' : 'Speak', icon: Mic },
              { step: 3, label: language === 'hi' ? 'प्रसारण' : 'Price', icon: CheckCircle },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = currentStep === item.step;
              const isDone = currentStep > item.step;
              return (
                <button
                  key={item.step}
                  onClick={() => setCurrentStep(item.step)}
                  className={`flex-1 py-1.5 px-1 rounded-full flex flex-col items-center justify-center gap-0.5 min-w-[56px] transition-all cursor-pointer select-none active:scale-95 ${
                    isActive
                      ? 'text-[#C85A32] font-black bg-[#C85A32]/10 scale-105 shadow-2xs'
                      : isDone
                      ? 'text-emerald-700 font-semibold hover:text-emerald-800'
                      : 'text-stone-400 hover:text-stone-600 font-medium'
                  }`}
                >
                  <div className="relative">
                    <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
                    {isDone && !isActive && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500" />
                    )}
                  </div>
                  <span className="text-[10px] tracking-tight leading-none">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
}
