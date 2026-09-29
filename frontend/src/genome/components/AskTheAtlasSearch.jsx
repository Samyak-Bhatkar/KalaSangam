import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, Sparkles, MapPin, ChevronRight, Compass } from 'lucide-react';
import { CULTURAL_TYPES } from '../utils/constants';

export default function AskTheAtlasSearch({
  elements = [],
  onSelectElement = () => {},
  isOpen = false,
  onClose = () => {}
}) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setActiveIndex(0);
    }
  }, [isOpen]);

  // Filter elements
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return elements
      .filter((el) => {
        const en = (el.name_en || '').toLowerCase();
        const hi = (el.name_hi || '').toLowerCase();
        const state = (el.state || '').toLowerCase();
        const dist = (el.district || '').toLowerCase();
        const place = (el.place_name || '').toLowerCase();
        const type = (el.type || '').toLowerCase();
        const typeHi = (CULTURAL_TYPES[el.type]?.labelHi || '').toLowerCase();
        const typeEn = (CULTURAL_TYPES[el.type]?.labelEn || '').toLowerCase();
        const descEn = (el.description_en || '').toLowerCase();

        return (
          en.includes(q) ||
          hi.includes(q) ||
          state.includes(q) ||
          dist.includes(q) ||
          place.includes(q) ||
          type.includes(q) ||
          typeHi.includes(q) ||
          typeEn.includes(q) ||
          descEn.includes(q)
        );
      })
      .slice(0, 8);
  }, [elements, query]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter' && results.length > 0) {
      e.preventDefault();
      handleSelect(results[activeIndex] || results[0]);
    }
  };

  const handleSelect = (el) => {
    onSelectElement(el);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Search Bar Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <Search className="w-5 h-5 text-amber-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="एटलस से पूछें... जैसे: वारली, कथक, गरबा, चंदेरी, ओडिशा, बिरयानी..."
            className="w-full bg-transparent text-sm font-medium text-white placeholder-slate-400 focus:outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
          >
            Esc
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-800/60">
          {query && results.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs">
              <Compass className="w-8 h-8 mx-auto mb-2 text-slate-500 opacity-60" />
              <p className="font-bold text-slate-300">कोई सांस्कृतिक तत्व नहीं मिला</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                कृपया कोई अन्य कला, नृत्य, व्यंजन, शिल्प या स्थान खोजें
              </p>
            </div>
          )}

          {!query && (
            <div className="p-4 text-xs text-slate-400">
              <p className="font-black text-[11px] uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>लोकप्रिय खोज सुझाव (Popular Queries):</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {['वारली चित्रकला', 'कथक', 'गरबा', 'चंदेरी', 'पिथौरा', 'बस्तर ढोकरा', 'सौरा कला', 'दुर्गा पूजा'].map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-slate-300 text-xs cursor-pointer transition-all hover:text-amber-300"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.map((el, idx) => {
            const typeConfig = CULTURAL_TYPES[el.type] || {
              labelHi: el.type,
              labelEn: el.type,
              color: '#38BDF8'
            };
            const isSelected = idx === activeIndex;

            return (
              <div
                key={el.id}
                onClick={() => handleSelect(el)}
                onMouseEnter={() => setActiveIndex(idx)}
                className={`p-3.5 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                  isSelected ? 'bg-amber-500/15 border-l-4 border-amber-400' : 'hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border"
                    style={{
                      backgroundColor: `${typeConfig.color}20`,
                      borderColor: `${typeConfig.color}40`,
                      color: typeConfig.color
                    }}
                  >
                    <span className="text-sm">
                      {el.type === 'craft' ? '🏺' : el.type === 'dance' ? '💃' : el.type === 'music' ? '🎵' : el.type === 'cuisine' ? '🍲' : el.type === 'festival' ? '🪔' : el.type === 'monument' ? '🏛️' : '✨'}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-black text-white truncate">
                        {el.name_hi}
                      </span>
                      <span className="text-[11px] text-slate-400 truncate hidden sm:inline">
                        • {el.name_en}
                      </span>
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase shrink-0 border"
                        style={{
                          backgroundColor: `${typeConfig.color}15`,
                          color: typeConfig.color,
                          borderColor: `${typeConfig.color}30`
                        }}
                      >
                        {typeConfig.labelHi}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-400" />
                        <span>{el.place_name || el.district}, {el.state}</span>
                      </span>
                      {el.rarity && (
                        <span className="text-amber-300 font-semibold">
                          ★ दुर्लभता {el.rarity}/5
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'text-amber-400 translate-x-1' : 'text-slate-600'}`} />
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
          <span>नेविगेट करने के लिए ↑↓ तीर, चुनने के लिए Enter दबाएं</span>
          <span className="text-amber-400 font-bold">{elements.length} सत्यापित सांस्कृतिक धरोहर</span>
        </div>
      </div>
    </div>
  );
}
