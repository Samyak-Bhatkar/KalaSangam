import React, { useState, useEffect } from 'react';
import { BookOpen, Volume2, VolumeX, Pause, Play, X, ShieldAlert, Sparkles, Languages } from 'lucide-react';
import { speakText, stopSpeech, pauseSpeech, resumeSpeech } from '../utils/speech';

export default function StoryModal({
  story = null,
  element = null,
  onClose = () => {}
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [narrationLang, setNarrationLang] = useState('hi-IN'); // 'hi-IN' or 'en-US'

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  if (!story) return null;

  const currentText = narrationLang === 'hi-IN' ? story.retelling_hi : story.retelling_en;

  const handleTogglePlay = () => {
    if (isPlaying) {
      if (isPaused) {
        resumeSpeech();
        setIsPaused(false);
      } else {
        pauseSpeech();
        setIsPaused(true);
      }
    } else {
      speakText({
        text: currentText,
        lang: narrationLang,
        onStart: () => {
          setIsPlaying(true);
          setIsPaused(false);
        },
        onEnd: () => {
          setIsPlaying(false);
          setIsPaused(false);
        },
        onError: () => {
          setIsPlaying(false);
          setIsPaused(false);
        }
      });
    }
  };

  const handleStop = () => {
    stopSpeech();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const handleLanguageChange = (lang) => {
    handleStop();
    setNarrationLang(lang);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-teal-500/50 rounded-3xl p-6 shadow-2xl overflow-hidden glow-cyan max-h-[90vh] flex flex-col justify-between">
        {/* Modal Top Bar */}
        <div>
          <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 font-black uppercase tracking-wider">
                  मौखिक परंपरा व लोककथा (Story Map)
                </span>
                <h3 className="text-xl font-black text-white mt-0.5">
                  {story.title_hi}
                </h3>
                <h4 className="text-xs font-semibold text-slate-400">
                  {story.title_en}
                </h4>
              </div>
            </div>
            <button
              onClick={() => {
                handleStop();
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mandatory AI-Narrated Label */}
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-bold">
                AI-narrated retelling • Source: {story.source}
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-black/40 text-amber-300 font-extrabold">
              मौखिक धरोहर
            </span>
          </div>

          {/* Retelling Body */}
          <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="text-[10px] font-black uppercase text-teal-400 tracking-wider mb-2">
                हिंदी कथा वाचन (Hindi Oral Folktale)
              </div>
              <p className="text-sm text-slate-200 leading-relaxed font-normal">
                {story.retelling_hi}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80">
              <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">
                English Narrative Lore
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                {story.retelling_en}
              </p>
            </div>
          </div>
        </div>

        {/* Audio Narration Control Dock */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {/* Language Switch */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => handleLanguageChange('hi-IN')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                narrationLang === 'hi-IN'
                  ? 'bg-teal-500 text-slate-950 font-black shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              हिंदी वाचन
            </button>
            <button
              onClick={() => handleLanguageChange('en-US')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                narrationLang === 'en-US'
                  ? 'bg-teal-500 text-slate-950 font-black shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              English Voice
            </button>
          </div>

          {/* Play/Pause/Stop Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleTogglePlay}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 text-xs font-black shadow-lg transition-all cursor-pointer active:scale-95"
            >
              {isPlaying && !isPaused ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>विराम (Pause)</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>{isPaused ? 'जारी रखें (Resume)' : 'कहानी सुनें (Listen Audio)'}</span>
                </>
              )}
            </button>

            {isPlaying && (
              <button
                onClick={handleStop}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Stop Audio"
              >
                <VolumeX className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
