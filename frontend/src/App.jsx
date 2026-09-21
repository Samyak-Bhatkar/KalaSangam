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
  X
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
  } = useArtisan();

  // Slide-over Profile Drawer State
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);

  // Support public buyer storefront route with NO login (?view=storefront or ?storefront=true)
  const [publicStorefront, setPublicStorefront] = useState(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return params.get('view') === 'storefront' || params.get('storefront') === 'true';
  });

  // Support public item & QR verification route (/item/:id, /verify/:id, ?item=:id, ?verify=:id, ?id=:id)
  const [verifyId, setVerifyId] = useState(() => {
    if (typeof window === 'undefined') return null;
    const pathname = window.location.pathname;
    if (pathname.startsWith('/verify/')) {
      return pathname.replace('/verify/', '').replace(/\/$/, '');
    }
    if (pathname.startsWith('/item/')) {
      return pathname.replace('/item/', '').replace(/\/$/, '');
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

  // 1. PUBLIC BUYER STOREFRONT (Zero login required)
  if (publicStorefront) {
    return (
      <BuyerStorefrontScreen
        onGoToLogin={() => {
          window.history.pushState({}, '', '/');
          setPublicStorefront(false);
        }}
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
                <span>सत्यापित कारीगर</span>
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
        <main className="flex-1 relative overflow-y-auto pb-24">
          {currentStep === 0 && (
            <HomeCommandCenter onNavigateToVyaparNiti={() => setCurrentStep('vyapar-niti')} />
          )}
          {currentStep === 'vyapar-niti' && (
            <VyaparNitiScreen onBack={() => setCurrentStep(0)} />
          )}
          {currentStep === 1 && <CameraViewfinder />}
          {currentStep === 2 && <VoiceRecorder />}
          {currentStep === 3 && (
            <div className="p-4 space-y-4 pb-28">
              {/* Screen 3 Top Half: Before/After Slider */}
              <StudioReviewCard />

              {/* Screen 3 Bottom Half: Pricing Breakdown & Channel Tiers */}
              <PricingCard />

              {/* Breakthrough Innovation Quick Triggers Bar */}
              <div className="space-y-2 pt-2">
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

              {/* Apple / Airbnb Grade Dual Action Dock: Draft vs Publish Lifecycle */}
              <div className="pt-3 space-y-2.5">
                <div className="grid grid-cols-5 gap-2.5">
                  {/* Action A: Save as Draft (Subtle, tactile pill) */}
                  <button
                    onClick={saveCurrentDraft}
                    disabled={isSavingDraft || isPublishing}
                    className="col-span-2 py-3.5 px-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-extrabold text-xs shadow-xs active:scale-97 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <div className="flex items-center gap-1.5">
                      {isSavingDraft ? (
                        <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
                      ) : (
                        <Bookmark className="w-4 h-4 text-amber-600" />
                      )}
                      <span>{language === 'hi' ? 'ड्राफ्ट सेव करें' : 'Save Draft'}</span>
                    </div>
                    <span className="text-[9px] text-slate-400 font-medium">
                      {language === 'hi' ? 'कोई QR नहीं बनेगा' : 'No public QR'}
                    </span>
                  </button>

                  {/* Action B: Hero Publish to ONDC & GeM */}
                  <button
                    onClick={publishCurrentProduct}
                    disabled={isSavingDraft || isPublishing}
                    className="col-span-3 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 hover:from-emerald-500 hover:to-teal-300 text-slate-950 font-black text-xs shadow-xl shadow-emerald-500/30 active:scale-97 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer uppercase tracking-wider disabled:opacity-50"
                  >
                    <div className="flex items-center gap-1.5">
                      {isPublishing ? (
                        <Loader2 className="w-4 h-4 text-slate-950 animate-spin" />
                      ) : (
                        <Globe2 className="w-4 h-4 text-slate-950" />
                      )}
                      <span>{language === 'hi' ? 'ONDC पर प्रकाशित करें' : 'Publish Live'}</span>
                    </div>
                    <span className="text-[9px] text-slate-900/80 font-bold normal-case">
                      {language === 'hi' ? 'सत्यापित QR कोड जनरेट होगा' : 'Generates verified QR'}
                    </span>
                  </button>
                </div>

                {/* State Reassurance Callout */}
                <div className="text-center">
                  <span className="text-[10px] text-slate-500 font-medium">
                    {productStatus === 'draft' ? (
                      <span className="text-amber-700 font-bold inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        ड्राफ्ट सुरक्षित है • 24 घंटे बाद स्वतः साफ़ होगा
                      </span>
                    ) : productStatus === 'published' ? (
                      <span className="text-emerald-700 font-bold inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        ONDC व GeM पर लाइव प्रसारित • सत्यापन QR सक्रिय
                      </span>
                    ) : (
                      'परीक्षण सुरक्षित: प्रकाशित करने तक कोई भी सार्वजनिक QR नहीं बनता।'
                    )}
                  </span>
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
            className="absolute bottom-3 left-3 right-3 z-30 bg-white/95 backdrop-blur-xl rounded-full border border-stone-200/90 shadow-[0_8px_30px_rgba(0,0,0,0.12)] px-2 py-1.5 flex items-center justify-around"
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
