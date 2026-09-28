/**
 * Cultural Genome Constants & Category Definitions
 */

export const CULTURAL_TYPES = {
  craft: {
    id: 'craft',
    name_en: 'Handicraft & Art',
    name_hi: 'हस्तशिल्प व लोककला',
    color: '#F59E0B', // Amber
    bg: 'bg-amber-500/20',
    border: 'border-amber-500/40',
    text: 'text-amber-300',
    dot: 'bg-amber-400',
    icon: 'Hammer'
  },
  textile: {
    id: 'textile',
    name_en: 'Weaving & Textiles',
    name_hi: 'हथकरघा व वस्त्र',
    color: '#EC4899', // Pink
    bg: 'bg-pink-500/20',
    border: 'border-pink-500/40',
    text: 'text-pink-300',
    dot: 'bg-pink-400',
    icon: 'Scissors'
  },
  dance: {
    id: 'dance',
    name_en: 'Classical & Folk Dance',
    name_hi: 'शास्त्रीय व लोकनृत्य',
    color: '#8B5CF6', // Purple
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/40',
    text: 'text-purple-300',
    dot: 'bg-purple-400',
    icon: 'Footprints'
  },
  music: {
    id: 'music',
    name_en: 'Classical & Folk Music',
    name_hi: 'संगीत व गायन',
    color: '#06B6D4', // Cyan
    bg: 'bg-cyan-500/20',
    border: 'border-cyan-500/40',
    text: 'text-cyan-300',
    dot: 'bg-cyan-400',
    icon: 'Music'
  },
  instrument: {
    id: 'instrument',
    name_en: 'Indigenous Instruments',
    name_hi: 'पारंपरिक वाद्य',
    color: '#10B981', // Emerald
    bg: 'bg-emerald-500/20',
    border: 'border-emerald-500/40',
    text: 'text-emerald-300',
    dot: 'bg-emerald-400',
    icon: 'Radio'
  },
  monument: {
    id: 'monument',
    name_en: 'Heritage Architecture',
    name_hi: 'धरोहर स्थापत्य',
    color: '#EAB308', // Yellow
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500/40',
    text: 'text-yellow-300',
    dot: 'bg-yellow-400',
    icon: 'Landmark'
  },
  cuisine: {
    id: 'cuisine',
    name_en: 'Culinary Traditions',
    name_hi: 'पारंपरिक व्यंजन',
    color: '#F97316', // Orange
    bg: 'bg-orange-500/20',
    border: 'border-orange-500/40',
    text: 'text-orange-300',
    dot: 'bg-orange-400',
    icon: 'Utensils'
  },
  festival: {
    id: 'festival',
    name_en: 'Sacred Festivals',
    name_hi: 'पवित्र उत्सव व मेले',
    color: '#EF4444', // Red
    bg: 'bg-red-500/20',
    border: 'border-red-500/40',
    text: 'text-red-300',
    dot: 'bg-red-400',
    icon: 'Sparkles'
  },
  dialect: {
    id: 'dialect',
    name_en: 'Dialects & Oral Idioms',
    name_hi: 'लोक बोलियाँ व मुहावरे',
    color: '#6366F1', // Indigo
    bg: 'bg-indigo-500/20',
    border: 'border-indigo-500/40',
    text: 'text-indigo-300',
    dot: 'bg-indigo-400',
    icon: 'Languages'
  },
  folk_story: {
    id: 'folk_story',
    name_en: 'Folk Legends & Myths',
    name_hi: 'लोकगाथाएं व मिथक',
    color: '#14B8A6', // Teal
    bg: 'bg-teal-500/20',
    border: 'border-teal-500/40',
    text: 'text-teal-300',
    dot: 'bg-teal-400',
    icon: 'BookOpen'
  }
};

export const RARITY_LABELS = {
  1: { label: 'Common Tradition', label_hi: 'सुलभ परंपरा', stars: '★☆☆☆☆', color: 'text-slate-400' },
  2: { label: 'Regional Craft', label_hi: 'क्षेत्रीय धरोहर', stars: '★★☆☆☆', color: 'text-blue-400' },
  3: { label: 'Vulnerable Heritage', label_hi: 'संवेदनशील कला', stars: '★★★☆☆', color: 'text-amber-400' },
  4: { label: 'Rare Micro-Cluster', label_hi: 'दुर्लभ सूक्ष्म क्लस्टर', stars: '★★★★☆', color: 'text-orange-400' },
  5: { label: 'Endangered Cultural Gem', label_hi: 'अति-दुर्लभ संकटग्रस्त धरोहर', stars: '★★★★★', color: 'text-red-400' }
};

export const MAP_CENTER_INDIA = [78.9629, 22.5937]; // [lng, lat]
export const MAP_DEFAULT_ZOOM = 4.3;
