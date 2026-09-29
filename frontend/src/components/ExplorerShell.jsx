import React, { useState } from 'react';
import {
  Compass,
  Camera,
  MapPin,
  BookOpen,
  GraduationCap,
  ShoppingBag,
  Share2,
  Check,
  Sparkles,
  Info,
  X,
  ExternalLink,
  ChevronRight,
  Globe2,
  Copy,
  ShieldCheck,
  Bookmark
} from 'lucide-react';
import MotifDecoder from './MotifDecoder';
import { EXPLORER_STRINGS } from '../i18n/explorer';
import { BRANDING_CONFIG } from '../config/branding';

const NaadVirasatContainer = React.lazy(() => import('../features/naad-virasat'));

export default function ExplorerShell({ onBack, onOpenMarketplace, initialTab = 'scan', language = 'hi', onToggleLanguage }) {
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      if (p.get('view') === 'naad' || p.get('tab') === 'naad' || p.get('naad') === 'true' || p.get('demo') === '1') {
        return 'naad';
      }
      if (p.get('tab')) return p.get('tab');
    }
    return initialTab;
  });
  const [studentLensActive, setStudentLensActive] = useState(false);
  const [citationModalOpen, setCitationModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const t = EXPLORER_STRINGS[language] || EXPLORER_STRINGS.hi;

  // Stable permalink stub for reference product
  const STUB_RECORD_ID = 'CRAFT-NBCFDC-002';
  const getPermalink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://shilpsetu.org';
    return `${origin}/record/${STUB_RECORD_ID}?v=1`;
  };

  const getCitationString = () => {
    const today = new Date().toISOString().split('T')[0];
    return `ShilpSetu Heritage Archive (2024). "Gorakhpur Terracotta Mayur Motif & Ritual Vessels". Craft Cluster: Gorakhpur, Uttar Pradesh, India. Permanent Record ID: ${STUB_RECORD_ID}. Available at: ${getPermalink()} (Accessed: ${today}).`;
  };

  const handleCopyCitation = () => {
    const text = getCitationString();
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-3 py-2.5 sm:px-6 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
            title={t.backToHome}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs sm:text-sm font-black text-amber-400 tracking-wide truncate">
                {t.title}
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold shrink-0">
                {BRANDING_CONFIG.badge}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate hidden sm:block">
              {t.subTitle}
            </p>
          </div>
        </div>

        {/* Header Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Student Lens Toggle */}
          <button
            onClick={() => setStudentLensActive(!studentLensActive)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
              studentLensActive
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm shadow-amber-500/30'
                : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
            }`}
            title={t.studentLensDesc}
          >
            <GraduationCap className="w-4 h-4" />
            <span className="hidden xs:inline">{t.studentLens}</span>
            {studentLensActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            )}
          </button>

          {/* Cite This Button */}
          <button
            onClick={() => setCitationModalOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 hover:border-amber-500/50 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Cite this record"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.citeThis}</span>
          </button>

          {/* Aural Heritage / Naad-Virasat Header Button */}
          <button
            onClick={() => setActiveTab('naad')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
              activeTab === 'naad'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm shadow-amber-500/30'
                : 'bg-amber-950/40 text-amber-300 hover:bg-amber-900/50 border-amber-500/40'
            }`}
            title={language === 'hi' ? 'नाद धरोहर: पाषाण वाद्य अन्वेषण' : 'Aural Heritage: Ancient Instrument Studio'}
          >
            <span>🪕</span>
            <span className="hidden xs:inline">{language === 'hi' ? 'नाद धरोहर' : 'Aural Heritage'}</span>
          </button>

          {/* Language Toggle */}
          {onToggleLanguage && (
            <button
              onClick={onToggleLanguage}
              className="px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              {language === 'hi' ? 'EN' : 'हिन्दी'}
            </button>
          )}
        </div>
      </header>

      {/* Student Lens Banner Notice (when active) */}
      {studentLensActive && (
        <div className="bg-amber-950/60 border-b border-amber-600/30 px-4 py-2 flex items-center justify-between gap-3 text-xs text-amber-200/90 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 min-w-0">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate">
              <strong>{language === 'hi' ? 'अकादमिक मोड सक्रिय' : 'Academic Mode Active'}:</strong>{' '}
              {t.studentLensDesc}
            </span>
          </div>
          <button
            onClick={handleCopyCitation}
            className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-bold border border-amber-500/40 shrink-0 flex items-center gap-1 cursor-pointer"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? t.citationCopied : t.citeThis}</span>
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-20">
        {/* TAB 1: SCAN MOTIF */}
        {activeTab === 'scan' && (
          <div className="w-full">
            <MotifDecoder
              mode="public"
              language={language}
              onClose={onBack}
              onExploreCraft={() => setActiveTab('atlas')}
              onPlayAuralHeritage={() => setActiveTab('naad')}
            />
          </div>
        )}

        {/* TAB: AURAL HERITAGE / NAAD-VIRASAT */}
        {activeTab === 'naad' && (
          <div className="w-full animate-in fade-in duration-300">
            <React.Suspense fallback={
              <div className="flex items-center justify-center py-24 text-amber-400 font-bold">
                लोड हो रहा है... (Loading Naad-Virasat Studio)
              </div>
            }>
              <NaadVirasatContainer />
            </React.Suspense>
          </div>
        )}

        {/* TAB 2: HERITAGE ATLAS (COMING SOON PREVIEW) */}
        {activeTab === 'atlas' && (
          <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 animate-in fade-in duration-300">
            <div className="text-center space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold">
                <Compass className="w-3.5 h-3.5" />
                {t.comingSoon.tag}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-100">
                {t.comingSoon.atlasTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
                {t.comingSoon.atlasDesc}
              </p>
            </div>

            {/* Teaser Cluster Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
              {[
                { name: 'Gorakhpur Terracotta', state: 'Uttar Pradesh', motifs: 'Mayur, Elephant, Horse', status: 'Curated' },
                { name: 'Chanderi Handloom', state: 'Madhya Pradesh', motifs: 'Kalka (Paisley), Ashavali', status: 'Curated' },
                { name: 'Bastar Dhokra', state: 'Chhattisgarh', motifs: 'Gaja, Tribal Bell, Deer', status: 'Curated' },
                { name: 'Mithila Folk Painting', state: 'Bihar', motifs: 'Tree of Life, Fish, Sun', status: 'Curated' }
              ].map((c, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-amber-300">{c.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                      {c.state}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    <strong className="text-slate-300">रूपांकन / Motifs:</strong> {c.motifs}
                  </p>
                  <div className="pt-2 flex items-center justify-between text-[11px] text-amber-500 font-bold border-t border-slate-800/80">
                    <span>{t.comingSoon.badge}</span>
                    <span className="text-[10px] text-slate-500">{t.comingSoon.plannedMilestone} (Card 8)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: STORY KEEPER (COMING SOON PREVIEW) */}
        {activeTab === 'stories' && (
          <div className="max-w-2xl mx-auto px-4 py-12 text-center space-y-4 animate-in fade-in duration-300">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-xs font-bold">
              <BookOpen className="w-3.5 h-3.5" />
              {t.comingSoon.tag}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-100">
              {t.comingSoon.storiesTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              {t.comingSoon.storiesDesc}
            </p>
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-left space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <Sparkles className="w-4 h-4" />
                <span>मौखिक धरोहर संचय (Oral Lore Preservation)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                "मोर पंख रूपांकन केवल चित्रकारी नहीं, अपितु गोरखपुर के कुम्हारों में सावन की पहली फुहार और अन्नपूर्णा के आगमन का लोकगीत है..."
              </p>
              <div className="text-[10px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-800">
                <span>अभिलेख स्थिति: आगामी नवाचार (Card 11)</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 font-bold">{t.comingSoon.badge}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: GURU-SHISHYA LEARN (COMING SOON PREVIEW) */}
        {activeTab === 'learn' && (
          <div className="max-w-2xl mx-auto px-4 py-12 text-center space-y-4 animate-in fade-in duration-300">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
              <GraduationCap className="w-3.5 h-3.5" />
              {t.comingSoon.tag}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-100">
              {t.comingSoon.learnTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              {t.comingSoon.learnDesc}
            </p>
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
              <div className="text-sm font-bold text-slate-200">
                उस्ताद कारीगरों से सीधे सीखें (Master-Led Audio Lessons)
              </div>
              <p className="text-xs text-slate-400">
                मिट्टी गूंथने से लेकर साल की पत्तियों के धुएं में पकाने तक की 7 पारंपरिक विधियां।
              </p>
              <div className="inline-block text-[11px] px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 mt-2">
                कार्ड 17 में उपलब्ध होगा (Card 17 Guru-Shishya)
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SHOP / LIVE MARKETPLACE */}
        {activeTab === 'shop' && (
          <div className="max-w-2xl mx-auto px-4 py-12 text-center space-y-4 animate-in fade-in duration-300">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold">
              <ShoppingBag className="w-3.5 h-3.5" />
              {t.tabs.shop}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-100">
              प्रमाणित शिल्प बाज़ार (Fair Trade Marketplace)
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              मध्यस्थों के बिना, सीधे प्रमाणित कारीगरों से हस्तशिल्प खरीदें। प्रत्येक उत्पाद के साथ डिजिटल जीआई पासपोर्ट संलग्न है।
            </p>
            <button
              onClick={onOpenMarketplace}
              className="mt-4 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-extrabold text-sm inline-flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-transform cursor-pointer"
            >
              <span>लाइव बाज़ार खोलें (Open Live Marketplace)</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>

      {/* Bottom Navigation Bar (Sticky Footer) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 safe-area-bottom">
        <div className="max-w-md sm:max-w-xl mx-auto grid grid-cols-6 h-16">
          {[
            { id: 'scan', label: t.tabs.scan, icon: Camera },
            { id: 'naad', label: language === 'hi' ? 'नाद धरोहर' : 'Aural', icon: Sparkles },
            { id: 'atlas', label: t.tabs.atlas, icon: MapPin },
            { id: 'stories', label: t.tabs.stories, icon: BookOpen },
            { id: 'learn', label: t.tabs.learn, icon: GraduationCap },
            { id: 'shop', label: t.tabs.shop, icon: ShoppingBag }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center gap-1 transition-all cursor-pointer min-h-[44px] ${
                  isActive
                    ? 'text-amber-400 font-extrabold scale-105'
                    : 'text-slate-400 hover:text-slate-200 font-medium'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
                <span className="text-[10px] leading-tight truncate px-1">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Academic Citation Modal ("Cite this" / उद्धृत करें) */}
      {citationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm sm:text-base font-extrabold text-slate-100">
                  {t.citationModal.title}
                </h3>
              </div>
              <button
                onClick={() => setCitationModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  {t.citationModal.formatLabel}
                </label>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-amber-300/90 leading-relaxed select-text">
                  {getCitationString()}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  {t.citationModal.permalinkLabel}
                </label>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 flex items-center justify-between gap-2 select-text">
                  <span className="truncate">{getPermalink()}</span>
                  <ExternalLink className="w-4 h-4 text-slate-500 shrink-0" />
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setCitationModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                {t.citationModal.close}
              </button>
              <button
                onClick={handleCopyCitation}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-950" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? t.citationModal.copiedButton : t.citationModal.copyButton}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
