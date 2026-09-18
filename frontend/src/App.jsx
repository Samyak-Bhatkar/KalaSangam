import React from 'react';
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
  Home
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

export default function App() {
  const {
    currentStep,
    setCurrentStep,
    language,
    setLanguage,
    resetFlow,
    setActiveModal,
    catalogData,
    pricingData,
    speakVoice
  } = useArtisan();

  const handlePublish = () => {
    setActiveModal('published');
    speakVoice(
      language === 'hi'
        ? 'बधाई हो! आपका शिल्प ओएनडीसी और जीईएम राष्ट्रीय नेटवर्क पर प्रसारित हो गया है।'
        : 'Congratulations! Your craft listing is now broadcast live on ONDC and GeM national networks.',
      language === 'hi' ? 'hi-IN' : 'en-IN'
    );
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 flex items-center justify-center p-0 md:p-6 select-none font-sans">
      {/* Mobile-First Application Frame (390px-430px optimized, native bezel on desktop) */}
      <div className="relative w-full md:max-w-[430px] h-screen md:h-[900px] md:max-h-[95vh] bg-[#FDFBF7] md:rounded-[40px] md:border md:border-slate-200/80 shadow-[0_20px_50px_rgba(0,0,0,0.08)] flex flex-col overflow-hidden">
        
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

          {/* Regional Dialect / Language Selector */}
          <div className="flex items-center gap-2">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              aria-label="Select Language"
              className="py-1 px-2.5 rounded-full bg-slate-100 hover:bg-slate-200/70 border border-slate-200 text-slate-800 font-bold text-xs focus:outline-none focus:border-amber-500 cursor-pointer transition-colors"
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

              {/* Single Giant Green Action Button: Publish to ONDC & GeM */}
              <div className="pt-2">
                <button
                  onClick={handlePublish}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 hover:from-emerald-500 hover:to-teal-300 text-slate-950 font-black text-base shadow-2xl shadow-emerald-500/40 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                >
                  <Globe2 className="w-6 h-6" />
                  <span>
                    {language === 'hi' ? 'ONDC और GeM पर तुरंत प्रसारित करें' : 'Publish to ONDC & GeM'}
                  </span>
                </button>
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
