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
  ShieldCheck,
  LogOut,
  UserCheck,
  Store
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

  // Support public buyer storefront route with NO login (?view=storefront or ?storefront=true)
  const [publicStorefront, setPublicStorefront] = useState(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return params.get('view') === 'storefront' || params.get('storefront') === 'true';
  });

  // Support public QR verification route /verify/:id or ?verify=:id
  const [verifyId, setVerifyId] = useState(() => {
    if (typeof window === 'undefined') return null;
    const pathname = window.location.pathname;
    if (pathname.startsWith('/verify/')) {
      return pathname.replace('/verify/', '').replace(/\/$/, '');
    }
    const params = new URLSearchParams(window.location.search);
    return params.get('verify') || params.get('id') || null;
  });

  // Support ?view=coordinator direct link
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('view') === 'coordinator') {
        setActiveModal('coordinator');
      }
    }
  }, [setActiveModal]);

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

  // 2. PUBLIC QR VERIFICATION ROUTE (Zero login required)
  if (verifyId) {
    return (
      <PublicVerifyScreen
        productId={verifyId}
        onBack={() => {
          window.history.pushState({}, '', '/');
          setVerifyId(null);
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
        {/* PERSISTENT STAKEHOLDER SESSION BAR & LOGOUT                          */}
        {/* ==================================================================== */}
        <div className="z-40 px-3.5 py-1.5 flex items-center justify-between text-[11px] font-bold bg-[#2A1810] text-amber-200 border-b border-amber-950">
          <div className="flex items-center gap-1.5 truncate">
            <UserCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">
              Logged in as <strong className="text-white">Artisan</strong> — <span className="font-mono text-amber-300">{currentUser.phone}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                window.history.pushState({}, '', '?view=storefront');
                setPublicStorefront(true);
              }}
              title="View Public Marketplace Storefront"
              className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Store className="w-3 h-3 text-amber-300" />
              <span className="hidden sm:inline">Store</span>
            </button>

            <button
              onClick={logout}
              title="Log out and return to Phone + OTP screen"
              className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 border border-red-500/30 flex items-center gap-1 cursor-pointer transition-colors active:scale-95"
            >
              <LogOut className="w-3 h-3" />
              <span>Log out</span>
            </button>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* TOP STATUS BAR & MoSJE GOVT EMBLEM HEADER                           */}
        {/* ==================================================================== */}
        <header className="z-30 px-4 pt-3 pb-2.5 bg-white/95 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-2.5">
            {/* ShilpSetu Brand Emblem */}
            <img
              src="/brand_emblem.png"
              alt="ShilpSetu Emblem"
              className="w-8 h-8 rounded-full border border-amber-500/40 object-cover shrink-0 shadow-xs"
            />

            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-black tracking-tight text-slate-900 flex items-center gap-1">
                  <span>ShilpSetu AI</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-50 text-amber-800 font-mono font-bold border border-amber-200">
                    MoSJE
                  </span>
                </h1>
              </div>
              <p className="text-[9px] text-slate-500 font-medium tracking-tight">
                NBCFDC / NSFDC Virtual Business Manager
              </p>
            </div>
          </div>

          {/* Quick Header Launchers */}
          <div className="flex items-center gap-1.5">
            {/* Zero-Smartphone Voice-IVR Launcher */}
            <button
              onClick={() => setActiveModal('ivr')}
              title="Zero-Smartphone IVR (Keypad Phone Simulator)"
              className="py-1 px-2.5 rounded-full bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-300 text-emerald-800 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-xs"
            >
              <PhoneCall className="w-3 h-3 text-emerald-600 animate-pulse" />
              <span className="font-extrabold">IVR</span>
            </button>

            {/* Village Coordinator Review Panel Launcher */}
            <button
              onClick={() => setActiveModal('coordinator')}
              title="Village Field Coordinator Review Panel (Human Checkpoint)"
              className="py-1 px-2 rounded-full bg-amber-50 hover:bg-amber-100/80 border border-amber-300 text-amber-900 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-xs"
            >
              <ShieldCheck className="w-3 h-3 text-amber-700" />
              <span className="font-extrabold">{language === 'hi' ? 'समन्वयक' : 'Review'}</span>
            </button>

            {/* Regional Dialect / Language Selector */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              aria-label="Select Language"
              className="py-1 px-2 rounded-full bg-slate-100 hover:bg-slate-200/70 border border-slate-200 text-slate-800 font-bold text-xs focus:outline-none focus:border-amber-500 cursor-pointer transition-colors"
            >
              {SUPPORTED_LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code} className="bg-white text-slate-900">
                  {lang.name} ({lang.label})
                </option>
              ))}
            </select>

            {currentStep > 0 && (
              <button
                onClick={resetFlow}
                title="Return to Home / Restart Flow"
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-all cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </header>

        {/* ==================================================================== */}
        {/* 4-STAGE WORKFLOW STEPPER (Stitch Screen 1 -> 2 -> 3 -> 4)            */}
        {/* ==================================================================== */}
        <nav className="z-20 px-3 py-2 bg-white border-b border-slate-200/70 flex items-center justify-between shrink-0 shadow-xs">
          {[
            { step: 0, label: language === 'hi' ? 'होम' : 'Home', icon: Home },
            { step: 1, label: language === 'hi' ? 'फोटो' : '1. Snap', icon: Camera },
            { step: 2, label: language === 'hi' ? 'आवाज' : '2. Speak', icon: Mic },
            { step: 3, label: language === 'hi' ? 'प्रसारण' : '3. Price', icon: CheckCircle },
          ].map((item, idx) => {
            const Icon = item.icon;
            const isActive = currentStep === item.step;
            const isDone = currentStep > item.step;
            return (
              <React.Fragment key={item.step}>
                <button
                  onClick={() => setCurrentStep(item.step)}
                  className={`flex items-center gap-1 cursor-pointer transition-all ${
                    isActive ? 'text-amber-700 font-extrabold' : isDone ? 'text-emerald-700 font-semibold' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${
                      isActive
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : isDone
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                        : 'bg-slate-100 text-slate-400 border-slate-200'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                  </div>
                  <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
                </button>
                {idx < 3 && (
                  <div className={`flex-1 h-0.5 mx-1.5 rounded-full ${isDone ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                )}
              </React.Fragment>
            );
          })}
        </nav>

        {/* ==================================================================== */}
        {/* MAIN WORKFLOW SCREENS                                                */}
        {/* ==================================================================== */}
        <main className="flex-1 relative overflow-y-auto">
          {currentStep === 0 && <HomeCommandCenter />}
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

        {/* Bottom Ambient Footer Bar */}
        <footer className="z-20 py-2.5 px-4 bg-white/95 border-t border-slate-200/80 text-center text-[10px] text-slate-500 flex items-center justify-between shrink-0 shadow-xs">
          <span className="font-semibold text-slate-700">MoSJE GoI • NSFDC / NBCFDC</span>
          <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            Zero-Text Voice UI Active
          </span>
        </footer>
      </div>
    </div>
  );
}
