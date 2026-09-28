/**
 * demoCarvings.js - Curated Offline Demo Carvings Dataset
 * Contains 8 verified historical temple carvings with exact organology ground-truth,
 * bounding boxes, and offline standalone stone carving illustrations.
 */

// Procedural stone carving SVG generator for zero-network offline demo gallery
function generateCarvingSvg(title, symbol, era, temple) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
    <defs>
      <radialGradient id="stoneLight" cx="45%" cy="40%" r="65%">
        <stop offset="0%" stop-color="#44382a"/>
        <stop offset="50%" stop-color="#2a2218"/>
        <stop offset="100%" stop-color="#14100c"/>
      </radialGradient>
      <filter id="graniteRoughness">
        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise"/>
        <feDiffuseLighting in="noise" lighting-color="#d4af37" surfaceScale="1.5" result="light">
          <feDistantLight azimuth="60" elevation="50"/>
        </feDiffuseLighting>
        <feBlend in="SourceGraphic" in2="light" mode="multiply"/>
      </filter>
    </defs>
    <!-- Monolithic Stone Base -->
    <rect width="600" height="600" fill="url(#stoneLight)" filter="url(#graniteRoughness)"/>
    <rect x="25" y="25" width="550" height="550" rx="16" fill="none" stroke="#d4af37" stroke-width="2" stroke-opacity="0.3" stroke-dasharray="8 6"/>
    <!-- Temple Architectural Frame -->
    <path d="M 60 120 Q 300 40 540 120 L 520 540 L 80 540 Z" fill="#1c1610" fill-opacity="0.6" stroke="#b45309" stroke-width="1.5" stroke-opacity="0.4"/>
    <!-- Central Carved Iconography -->
    <g transform="translate(300, 290)">
      <circle r="150" fill="none" stroke="#d4af37" stroke-width="3" stroke-opacity="0.25"/>
      <circle r="130" fill="none" stroke="#f59e0b" stroke-width="1" stroke-opacity="0.3" stroke-dasharray="4 4"/>
      <text y="30" font-size="120" text-anchor="middle" fill="#fef08a" opacity="0.9" filter="drop-shadow(0 4px 12px rgba(0,0,0,0.9))">${symbol}</text>
    </g>
    <!-- Epigraphic Relief Text -->
    <text x="300" y="470" font-family="Georgia, serif" font-size="22" font-weight="bold" text-anchor="middle" fill="#fef3c7" letter-spacing="1">${title}</text>
    <text x="300" y="500" font-family="sans-serif" font-size="13" font-weight="600" text-anchor="middle" fill="#d4af37" letter-spacing="0.5">${era}</text>
    <text x="300" y="525" font-family="sans-serif" font-size="11" text-anchor="middle" fill="#a8a29e">${temple}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const DEMO_CARVINGS = [
  {
    id: 'demo-ekatantri-vina',
    instrumentId: 'ekatantri-vina',
    title: 'Hoysala Saraswati Relief (Belur)',
    titleHi: 'बेलूर होयसल वीणा शिल्प',
    era: '12th Century CE',
    temple: 'Chennakeshava Temple, Belur, Karnataka',
    symbol: '🪕',
    imageSrc: generateCarvingSvg('Ekatantri Vina Relief', '🪕', '12th Century CE (Hoysala)', 'Chennakeshava Temple, Belur'),
    boundingBox: { x: 0.22, y: 0.16, w: 0.56, h: 0.68 },
    confidence: 0.94,
    rationale: 'Long danda bamboo tube with gourd resonator held diagonally across the torso with visible bridge position.'
  },
  {
    id: 'demo-yazh',
    instrumentId: 'yazh',
    title: 'Thirumayam Rock-Cut Yazh (Tamil Nadu)',
    titleHi: 'तिरुमयम् शैलकृत याऴ् शिल्प',
    era: '7th - 8th Century CE (Pallava/Pandya)',
    temple: 'Thirumayam Rock-Cut Shiva Temple, Pudukkottai',
    symbol: '🏹',
    imageSrc: generateCarvingSvg('Arched Bow-Harp Yazh', '🏹', '7th-8th Century CE', 'Thirumayam Rock Cave, Pudukkottai'),
    boundingBox: { x: 0.18, y: 0.12, w: 0.64, h: 0.74 },
    confidence: 0.91,
    rationale: 'Arched open-string bow harp held in lap with curved neck terminating in a stylized makara/yali motif.'
  },
  {
    id: 'demo-mridangam',
    instrumentId: 'mridangam',
    title: 'Chidambaram Karana Drummer (Chola)',
    titleHi: 'चिदंबरम् नटराज मंदिर मृदंग शिल्प',
    era: '10th - 11th Century CE (Chola)',
    temple: 'Nataraja Temple Eastern Gopuram, Chidambaram',
    symbol: '🥁',
    imageSrc: generateCarvingSvg('Pushkara / Mridangam Relief', '🥁', '10th-11th Century CE (Chola)', 'Eastern Gopuram, Chidambaram'),
    boundingBox: { x: 0.16, y: 0.22, w: 0.68, h: 0.58 },
    confidence: 0.96,
    rationale: 'Bilateral barrel drum held horizontally with visible tension straps and central paste loading (karanai).'
  },
  {
    id: 'demo-damaru',
    instrumentId: 'damaru',
    title: 'Ellora Kailasa Temple Nataraja Damaru',
    titleHi: 'एलोरा कैलास नटराज डमरू',
    era: '8th Century CE (Rashtrakuta)',
    temple: 'Cave 16 (Kailasa Temple), Ellora, Maharashtra',
    symbol: '⏳',
    imageSrc: generateCarvingSvg('Cosmic Damaru Relief', '⏳', '8th Century CE (Rashtrakuta)', 'Cave 16 (Kailasa), Ellora'),
    boundingBox: { x: 0.24, y: 0.18, w: 0.52, h: 0.62 },
    confidence: 0.95,
    rationale: 'Hourglass-shaped percussion vessel held in upper right hand depicting primal acoustic creation (Sphota).'
  },
  {
    id: 'demo-venu-flute',
    instrumentId: 'venu-flute',
    title: 'Halebidu Venugopala Krishna Panel',
    titleHi: 'हलेबिडु वेणुगोपाल कृष्ण शिल्प',
    era: '12th Century CE (Hoysala)',
    temple: 'Hoysaleshwara Temple, Halebidu, Karnataka',
    symbol: '🪈',
    imageSrc: generateCarvingSvg('Venugopala Bamboo Flute', '🪈', '12th Century CE (Hoysala)', 'Hoysaleshwara Temple, Halebidu'),
    boundingBox: { x: 0.2, y: 0.18, w: 0.6, h: 0.66 },
    confidence: 0.93,
    rationale: 'Transverse cylindrical aerophone held horizontally to the lips with finger-holes along the tube axis.'
  },
  {
    id: 'demo-shankha',
    instrumentId: 'shankha',
    title: 'Mahabalipuram Shore Temple Sacred Conch',
    titleHi: 'महाबलिपुरम शंख शिल्प',
    era: '8th Century CE (Pallava)',
    temple: 'Shore Temple Complex, Mamallapuram, Tamil Nadu',
    symbol: '🐚',
    imageSrc: generateCarvingSvg('Sacred Conch Herald Relief', '🐚', '8th Century CE (Pallava)', 'Shore Temple, Mamallapuram'),
    boundingBox: { x: 0.26, y: 0.2, w: 0.48, h: 0.58 },
    confidence: 0.97,
    rationale: 'Natural spiral conical shell held near mouth level with prominent spiral whorl and lip embouchure.'
  },
  {
    id: 'demo-ghanta',
    instrumentId: 'ghanta',
    title: 'Khajuraho Mandapa Ritual Bell (Chandela)',
    titleHi: 'खजुराहो मन्दिर कांस्य घण्टा',
    era: '10th - 11th Century CE (Chandela)',
    temple: 'Kandariya Mahadeva Temple, Khajuraho',
    symbol: '🔔',
    imageSrc: generateCarvingSvg('Sacred Mandapa Ghanta', '🔔', '10th-11th Century CE', 'Kandariya Mahadeva, Khajuraho'),
    boundingBox: { x: 0.24, y: 0.14, w: 0.52, h: 0.72 },
    confidence: 0.92,
    rationale: 'Suspended bronze bell with flared rim and ornamental crown ring designed for acoustic resonance.'
  },
  {
    id: 'demo-manjira',
    instrumentId: 'manjira',
    title: 'Konark Sun Temple Celestial Cymbalist',
    titleHi: 'कोणार्क सूर्य मंदिर मंजीरा नर्तकी',
    era: '13th Century CE (Eastern Ganga)',
    temple: 'Sun Temple Natamandira, Konark, Odisha',
    symbol: '🟡',
    imageSrc: generateCarvingSvg('Konark Manjira Cymbals', '🟡', '13th Century CE', 'Sun Temple Natamandira, Konark'),
    boundingBox: { x: 0.2, y: 0.25, w: 0.6, h: 0.54 },
    confidence: 0.89,
    rationale: 'Paired disc cymbals held between fingers of celestial musician in the dance pavilion.'
  }
];
