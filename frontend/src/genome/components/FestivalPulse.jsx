import React, { useMemo } from 'react';
import { Calendar, Sparkles, MapPin, X, ChevronRight, Flame } from 'lucide-react';
import { CULTURAL_TYPES } from '../utils/constants';

const MONTHS = [
  { id: 1, nameEn: 'Jan', nameHi: 'जनवरी', indic: 'पौष-माघ' },
  { id: 2, nameEn: 'Feb', nameHi: 'फ़रवरी', indic: 'माघ-फाल्गुन' },
  { id: 3, nameEn: 'Mar', nameHi: 'मार्च', indic: 'फाल्गुन-चैत्र' },
  { id: 4, nameEn: 'Apr', nameHi: 'अप्रैल', indic: 'चैत्र-वैशाख' },
  { id: 5, nameEn: 'May', nameHi: 'मई', indic: 'वैशाख-ज्येष्ठ' },
  { id: 6, nameEn: 'Jun', nameHi: 'जून', indic: 'ज्येष्ठ-आषाढ़' },
  { id: 7, nameEn: 'Jul', nameHi: 'जुलाई', indic: 'आषाढ़-श्रावण' },
  { id: 8, nameEn: 'Aug', nameHi: 'अगस्त', indic: 'श्रावण-भाद्रपद' },
  { id: 9, nameEn: 'Sep', nameHi: 'सितंबर', indic: 'भाद्रपद-अश्विन' },
  { id: 10, nameEn: 'Oct', nameHi: 'अक्टूबर', indic: 'अश्विन-कार्तिक' },
  { id: 11, nameEn: 'Nov', nameHi: 'नवंबर', indic: 'कार्तिक-मार्गशीर्ष' },
  { id: 12, nameEn: 'Dec', nameHi: 'दिसंबर', indic: 'मार्गशीर्ष-पौष' }
];

export default function FestivalPulse({
  isOpen = false,
  onClose = () => {},
  selectedMonth = 10, // Default October (Navratri, Durga Puja, Bastar Dussehra)
  onSelectMonth = () => {},
  elements = [],
  onSelectElement = () => {}
}) {
  // Aggregate elements by typical_month
  const elementsByMonth = useMemo(() => {
    const map = {};
    MONTHS.forEach((m) => {
      map[m.id] = [];
    });
    elements.forEach((el) => {
      if (el.typical_month && map[el.typical_month]) {
        map[el.typical_month].push(el);
      }
    });
    return map;
  }, [elements]);

  const activeFestivals = elementsByMonth[selectedMonth] || [];
  const currentMonthData = MONTHS.find((m) => m.id === selectedMonth) || MONTHS[9];

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-2xl px-4 animate-in slide-in-from-bottom duration-300">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-4 shadow-2xl flex flex-col gap-3">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-black text-white">
                  उत्सव पल्स (Festival Pulse)
                </h3>
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  {currentMonthData.nameHi} • {currentMonthData.indic}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                मासिक भारतीय सांस्कृतिक व लोक उत्सव चक्र
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 12-Month Selector Ribbon */}
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-1 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
          {MONTHS.map((m) => {
            const isSelected = selectedMonth === m.id;
            const count = elementsByMonth[m.id]?.length || 0;
            return (
              <button
                key={m.id}
                onClick={() => onSelectMonth(m.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-gradient-to-b from-amber-400 to-orange-500 text-slate-950 font-black shadow-md scale-105'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span className="text-[10px] font-bold leading-tight">{m.nameEn}</span>
                {count > 0 && (
                  <span
                    className={`text-[8px] font-black px-1 rounded-full mt-0.5 ${
                      isSelected
                        ? 'bg-slate-950 text-amber-300'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Festivals for Selected Month */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>
              {currentMonthData.nameHi} में मनाए जाने वाले उत्सव ({activeFestivals.length}):
            </span>
            <span className="text-amber-400 text-[10px] font-bold">
              स्थान पर ज़ूम करने हेतु क्लिक करें
            </span>
          </div>

          {activeFestivals.length === 0 ? (
            <div className="p-3 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl">
              इस महीने के लिए वर्तमान डेटासेट में कोई सूचीबद्ध उत्सव नहीं है
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
              {activeFestivals.map((fest) => {
                const typeConfig = CULTURAL_TYPES[fest.type] || {
                  labelHi: 'उत्सव',
                  color: '#F59E0B'
                };
                return (
                  <div
                    key={fest.id}
                    onClick={() => onSelectElement(fest)}
                    className="p-2 rounded-xl bg-slate-950/60 hover:bg-amber-500/10 border border-slate-800 hover:border-amber-500/40 flex items-center justify-between gap-2 cursor-pointer transition-all active:scale-98"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-white truncate">
                          {fest.name_hi}
                        </span>
                        <span
                          className="text-[8px] px-1 py-0.2 rounded-full font-bold uppercase shrink-0"
                          style={{
                            backgroundColor: `${typeConfig.color}20`,
                            color: typeConfig.color
                          }}
                        >
                          {typeConfig.labelHi}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                        <MapPin className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                        <span>{fest.place_name || fest.district}, {fest.state}</span>
                      </p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
