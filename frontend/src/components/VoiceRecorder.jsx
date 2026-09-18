import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, ArrowLeft, ArrowRight, Sparkles, AlertCircle, CheckCircle, Languages, RefreshCw, Edit3 } from 'lucide-react';
import { useArtisan } from '../context/ArtisanContext';

export default function VoiceRecorder() {
  const {
    language,
    setLanguage,
    selectedPreset,
    transcript,
    setTranscript,
    setCurrentStep,
    speakVoice,
    processCaptureAndVoice,
    isProcessing,
    processStatusText,
    rawImageUrl,
    studioImageUrl
  } = useArtisan();

  const [isListening, setIsListening] = useState(false);
  const [audioLevels, setAudioLevels] = useState([12, 24, 8, 32, 18, 28, 14, 30, 10, 20]);
  const [activeDialect, setActiveDialect] = useState('hi');
  const [speechError, setSpeechError] = useState(null);
  const [isEditingManually, setIsEditingManually] = useState(false);

  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const streamRef = useRef(null);

  // Dialect presets matching SIH Hackathon & MoSJE Demographics
  const DIALECTS = [
    { code: 'hi', label: 'Hindi', badge: 'हि', langCode: 'hi-IN', region: 'मानक हिन्दी' },
    { code: 'bhojpuri', label: 'Bhojpuri', badge: 'भोज', langCode: 'hi-IN', region: 'गोरखपुर / पूर्वांचल' },
    { code: 'bundeli', label: 'Bundeli', badge: 'बु', langCode: 'hi-IN', region: 'चंदेरी / बुंदेलखंड' },
    { code: 'malwi', label: 'Malwi', badge: 'म', langCode: 'hi-IN', region: 'मालवा / मध्य प्रदेश' },
    { code: 'mr', label: 'Marathi', badge: 'मरा', langCode: 'mr-IN', region: 'महाराष्ट्र' },
    { code: 'bn', label: 'Bengali', badge: 'বাং', langCode: 'bn-IN', region: 'पश्चिम बंगाल' },
    { code: 'en', label: 'English', badge: 'EN', langCode: 'en-IN', region: 'Export Pitch' },
  ];

  // Craft-specific authentic vernacular voice samples
  const craftVoicePresets = {
    terracotta: {
      hi: 'यह गोरखपुर का हस्तनिर्मित टेराकोटा मिट्टी का कलश और हांडी है। तालाब की शुद्ध मिट्टी से चाक पर बनाया है। नक्काशी करने और पकाने में 6 घंटे लगे हैं। कच्चा माल ₹180 का लगा है।',
      bhojpuri: 'ई गोरखपुर के शुद्ध लाल माटी के कलश आ हांडी ह। चाक पर हाथ से 6 घंटा में गढ़ले बानी। भट्ठी में पकाइल गइल बा, माटी आ ईंधन के खरच ₹180 लागल बा।',
      bundeli: 'ई हमार हाथ से बनो टेराकोटा को कलश है। चाक पै 6 घंटा मेहनत करी, भट्टी में पकाय के त्यार करो है। लागत करीब 180 रुपिया आई है।',
      malwi: 'म्हारा हाथ सू बणायो विशुद्ध माटी को कलश अर हांडी छे। 6 घंटा री मेहनत लागी, ₹180 रो खर्चो आयो।',
      mr: 'हे अस्सल मातीचे पारंपरिक भांडे व कलश आहे. चाकावर हाताने घडवले असून 6 तास लागले. कच्चा माल ₹180 चा आहे.',
      bn: 'এটি খাঁটি পোড়ামাটির ঐতিহ্যবাহী মাটির হাঁড়ি ও কলসি। চাকায় ঘুরিয়ে তৈরি করতে ৬ ঘণ্টা সময় লেগেছে, খরচ ₹১৮০।',
      en: 'This is a handcrafted Gorakhpur terracotta clay cooking handi pot. Wheel-thrown using pure riverbed clay, kiln-fired for 6 hours. Material cost is around ₹180.'
    },
    saree: {
      hi: 'यह शुद्ध चंदेरी सिल्क की हाथ से बुनी ज़री साड़ी है। हथकरघे पर 18 घंटे की बुनाई से तैयार हुई है। शुद्ध जरी और रेशम का खर्च ₹1400 आया है।',
      bhojpuri: 'ई शुद्ध चंदेरी सिल्क के हाथ से बीनल जरी साड़ी ह। हथकरघा पर 18 घंटा के कठिन मिहनत से बनल बा। कच्चा सिल्क आ जरी के खरच ₹1400 आइल बा।',
      bundeli: 'ई हमार हथकरघा पै बुनी चंदेरी सिल्क की साड़ी है। 18 घंटा को काम है, जरी और रेशम ₹1400 को लगो है।',
      malwi: 'म्हारी चंदेरी सिल्क री साड़ी छे, 18 घंटा हथकरघा पै काम करयो, जरी अर रेशम रो खर्चो ₹1400 आयो।',
      mr: 'ही अस्सल चंदेरी सिल्क हातमाग साडी आहे. 18 तास विणकाम केले असून कच्चा माल ₹1400 चा लागला आहे.',
      bn: 'এটি খাঁটি চান্দেরি সিল্ক জরি শাড়ি। তাঁতে ১৮ ঘণ্টা বুনে তৈরি করা হয়েছে। সুতো ও জরির খরচ ₹১৪০০।',
      en: 'This is an authentic handwoven Chanderi silk saree with pure zari border. Crafted on traditional pit looms over 18 hours. Raw silk and metallic zari cost around ₹1400.'
    },
    dhokra: {
      hi: 'यह बस्तर का पारंपरिक ढोकरा शिल्प है। मोम के धागे और पीतल ढालकर बनाया है। 12 घंटे की मेहनत लगी है। कच्चा माल ₹480 का है।',
      bhojpuri: 'ई बस्तर के पारंपरिक ढोकरा शिल्प ह। मोम के धागा आ पीतल ढाल के 12 घंटा में बनवले बानी। खरच ₹480 बा।',
      bundeli: 'ई बस्तर को ढोकरा शिल्प है। मोम और पीतल से 12 घंटा में त्यार करो है। कच्चो माल ₹480 को लगो है।',
      malwi: 'म्हारो बस्तर ढोकरा शिल्प छे, 12 घंटा लाग्या, ₹480 रो पीतल अर मोम लाग्यो।',
      mr: 'हे बस्तरचे पारंपरिक ढोकरा पितळी शिल्प आहे. 12 तास मेहनत लागली असून खर्च ₹480 झाला आहे.',
      bn: 'এটি বাস্তার ডোকরা ঐতিহ্যবাহী ধাতব শিল্পকলা। তৈরি করতে ১২ ঘণ্টা সময় লেগেছে, কাঁচামাল ₹৪৮০।',
      en: 'This is an authentic Bastar Dhokra lost-wax cast bell metal sculpture. Crafted by tribal artisans over 12 hours. Raw brass and wax cost ₹480.'
    },
    madhubani: {
      hi: 'यह मिथिला की पारंपरिक कल्पवृक्ष मधुबनी पेंटिंग है। बांस की तीली और प्राकृतिक रंगों से 10 घंटे में बनाई है। खर्च ₹250 है।',
      bhojpuri: 'ई मिथिला के कल्पवृक्ष मधुबनी पेंटिंग ह। बांस के तीली आ प्राकृतिक रंग से 10 घंटा में बनवले बानी। खरच ₹250 आइल बा।',
      bundeli: 'ई मधुबनी पेंटिंग है। बांस की तीली और कुदरती रंगन से 10 घंटा में बनाई है। खर्च ₹250 है।',
      malwi: 'म्हारी कल्पवृक्ष मधुबनी पेंटिंग छे, 10 घंटा में बणाई, ₹250 रो खर्चो आयो।',
      mr: 'ही पारंपरिक मधुबनी कल्पवृक्ष पेंटिंग आहे. नैसर्गिक रंगांनी 10 तासात रेखाटली असून खर्च ₹250 आहे.',
      bn: 'এটি ঐতিহ্যবাহী মধুবনী কল্পবৃক্ষ লোকশিল্প। প্রাকৃতিক রঙে আঁকতে ১০ ঘণ্টা সময় লেগেছে, খরচ ₹২৫০।',
      en: 'This is an authentic Mithila Madhubani Tree of Life folk painting. Hand-painted using bamboo twigs and botanical pigments over 10 hours. Cost is ₹250.'
    }
  };

  const getActiveCraftType = () => {
    const cat = (selectedPreset?.craft_category || '').toLowerCase();
    const id = (selectedPreset?.id || '').toLowerCase();
    if (cat.includes('textile') || id.includes('001') || cat.includes('saree')) return 'saree';
    if (cat.includes('metal') || id.includes('003') || cat.includes('dhokra')) return 'dhokra';
    if (cat.includes('paint') || id.includes('004') || cat.includes('madhubani')) return 'madhubani';
    return 'terracotta';
  };

  const currentVoiceSamples = craftVoicePresets[getActiveCraftType()];

  // Voice guidance prompt on entry
  const playVoicePrompt = () => {
    const promptText = language === 'hi'
      ? 'कृपया अपने शिल्प के बारे में बोलें - सामग्री, बनाने का समय और लागत बताएं।'
      : 'Please describe your craft - mention materials, hours invested, and raw material cost.';
    speakVoice(promptText, language === 'hi' ? 'hi-IN' : 'en-IN');
  };

  useEffect(() => {
    // Set initial sample transcript if empty
    if (!transcript) {
      const initialText = currentVoiceSamples[activeDialect] || currentVoiceSamples['hi'];
      setTranscript(initialText);
    }
    playVoicePrompt();

    return () => {
      stopListening();
    };
  }, []);

  // Web Audio Visualizer
  const startAudioVisualizer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateWaveform = () => {
        analyser.getByteFrequencyData(dataArray);
        const levels = Array.from(dataArray.slice(0, 10)).map(v => Math.max(6, Math.min(48, v / 4)));
        setAudioLevels(levels);
        animationFrameRef.current = requestAnimationFrame(updateWaveform);
      };
      updateWaveform();
    } catch (e) {
      console.warn('Microphone permission not granted, using simulated audio visualizer:', e);
      simulateWaveform();
    }
  };

  const simulateWaveform = () => {
    const interval = setInterval(() => {
      setAudioLevels(Array.from({ length: 10 }, () => Math.floor(Math.random() * 38) + 8));
    }, 100);
    animationFrameRef.current = interval;
  };

  const stopAudioVisualizer = () => {
    if (animationFrameRef.current) {
      if (typeof animationFrameRef.current === 'number') {
        cancelAnimationFrame(animationFrameRef.current);
        clearInterval(animationFrameRef.current);
      }
    }
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach(t => t.stop());
      } catch (e) {}
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
    }
  };

  // Web Speech Recognition
  const startListening = () => {
    setSpeechError(null);
    setIsListening(true);
    startAudioVisualizer();

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        const currentLangObj = DIALECTS.find(d => d.code === activeDialect) || DIALECTS[0];
        recognition.lang = currentLangObj.langCode;

        recognition.onresult = (event) => {
          let liveSpeech = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            liveSpeech += event.results[i][0].transcript;
          }
          if (liveSpeech.trim()) {
            setTranscript(liveSpeech);
          }
        };

        recognition.onerror = (e) => {
          console.warn('SpeechRecognition error:', e.error);
          if (e.error === 'not-allowed') {
            setSpeechError('Microphone permission blocked. You can tap any dialect chip below!');
          } else if (e.error === 'no-speech') {
            // Normal timeout, keep current text
          } else {
            setSpeechError(`Speech status: ${e.error}. Vernacular voice catalog ready.`);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          stopAudioVisualizer();
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
        console.warn('Recognition start exception:', err);
        setSpeechError('Voice recognizer auto-adapted. Select dialect or type directly.');
      }
    } else {
      setSpeechError('Browser speech engine unavailable. Tap quick dialect chips below to generate catalog.');
    }
  };

  const stopListening = () => {
    setIsListening(false);
    stopAudioVisualizer();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Switch dialect & load sample sentence
  const handleDialectChange = (d) => {
    setActiveDialect(d.code);
    const sample = currentVoiceSamples[d.code] || currentVoiceSamples['hi'];
    setTranscript(sample);
    speakVoice(sample, d.langCode);
    if ('vibrate' in navigator) navigator.vibrate(30);
  };

  // Play spoken transcript
  const playCurrentTranscript = () => {
    if (!transcript) return;
    const currentLangObj = DIALECTS.find(d => d.code === activeDialect) || DIALECTS[0];
    speakVoice(transcript, currentLangObj.langCode);
  };

  // Submit and run autonomous AI studio & pricing
  const handleProceed = () => {
    stopListening();
    const effectiveText = transcript || currentVoiceSamples['hi'];
    processCaptureAndVoice(null, effectiveText);
  };

  const craftImageSrc = rawImageUrl || (getActiveCraftType() === 'terracotta' ? '/terracotta_pot_raw.png' : '/chanderi_saree.png');

  return (
    <div className="relative w-full h-full flex flex-col justify-between bg-[#FDFBF7] text-slate-900 p-5 select-none overflow-y-auto font-sans">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setCurrentStep(1)}
            className="flex items-center gap-1 text-slate-700 hover:text-slate-950 text-xs font-bold py-1.5 px-3 rounded-xl bg-white border border-slate-200 shadow-xs active:scale-95 transition-transform cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'कैमरा' : 'Camera'}</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-black shadow-xs">
              2
            </span>
            <span className="text-xs font-black tracking-tight uppercase text-slate-900">
              {language === 'hi' ? 'दूसरा चरण: बोलकर विवरण दें' : 'Step 2: Vernacular Voice'}
            </span>
          </div>

          <button
            onClick={playVoicePrompt}
            aria-label="Replay Audio Instruction"
            className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-amber-700 hover:text-amber-800 shadow-xs cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Craft Thumbnail Bar */}
        <div className="p-3 rounded-2xl bg-white border border-slate-200/90 mb-3 flex items-center gap-3 shadow-xs">
          <img
            src={craftImageSrc}
            alt="Craft Preview"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/samples/gorakhpur_terracotta.jpg';
            }}
            className="w-14 h-14 rounded-xl object-cover bg-slate-50 border border-slate-200 shrink-0 shadow-xs"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wide">
                कच्ची तस्वीर (Raw Capture) • AI स्टूडियो में स्वच्छ होगी
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 truncate">
              {getActiveCraftType() === 'terracotta'
                ? 'पारंपरिक गोरखपुर टेराकोटा हांडी व कलश'
                : 'शाही नीली चंदेरी सिल्क ज़री साड़ी'}
            </h4>
            <p className="text-[11px] text-amber-800 font-bold">
              {getActiveCraftType() === 'terracotta' ? 'हाथ से नक्काशीदार मिट्टी शिल्प' : '18 घंटे हथकरघा बुनाई'}
            </p>
          </div>
        </div>

        {/* Vernacular Dialect Chips - Matching SIH Slide Step 3 */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-1.5">
            <span className="flex items-center gap-1">
              <Languages className="w-3.5 h-3.5 text-amber-700" />
              बोली / Dialect चुनें:
            </span>
            <span className="text-[10px] text-emerald-700 font-bold">
              Bhashini ASR + Llama 3.2
            </span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {DIALECTS.map(d => (
              <button
                key={d.code}
                onClick={() => handleDialectChange(d)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95 cursor-pointer ${
                  activeDialect === d.code
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-black/10 flex items-center justify-center text-[10px]">
                  {d.badge}
                </span>
                <span>{d.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Central Giant Microphone with Pulsating Ripple Rings & Waveform */}
      <div className="my-auto flex flex-col items-center justify-center py-2">
        <div className="relative flex items-center justify-center">
          {/* Animated Ripple Rings when recording */}
          {isListening && (
            <>
              <div className="absolute w-44 h-44 rounded-full bg-amber-500/20 animate-ping pointer-events-none" />
              <div className="absolute w-36 h-36 rounded-full bg-emerald-500/30 animate-pulse pointer-events-none" />
            </>
          )}

          {/* Giant Microphone Button */}
          <button
            onClick={toggleListening}
            aria-label={isListening ? 'Stop Recording' : 'Start Speaking'}
            className={`relative w-28 h-28 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 active:scale-95 cursor-pointer ${
              isListening
                ? 'bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 ring-8 ring-rose-500/30 shadow-rose-500/40 text-white'
                : 'bg-gradient-to-tr from-amber-500 via-amber-600 to-orange-600 ring-8 ring-amber-500/20 shadow-amber-500/30 text-white'
            }`}
          >
            {isListening ? (
              <MicOff className="w-12 h-12 text-white animate-pulse" />
            ) : (
              <Mic className="w-12 h-12 text-white drop-shadow-sm" />
            )}
          </button>
        </div>

        {/* Live Audio Amplitude Visualizer */}
        <div className="flex items-center justify-center gap-1.5 h-10 mt-5">
          {audioLevels.map((lvl, idx) => (
            <div
              key={idx}
              style={{ height: `${isListening ? lvl : 8}px` }}
              className={`w-2 rounded-full transition-all duration-100 ${
                isListening
                  ? 'bg-gradient-to-t from-emerald-500 via-amber-500 to-orange-600'
                  : 'bg-slate-200'
              }`}
            />
          ))}
        </div>

        <p className="text-xs font-bold uppercase tracking-wider text-slate-600 mt-2 flex items-center gap-1.5">
          {isListening ? (
            <>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span className="text-red-600 font-extrabold">{language === 'hi' ? 'सुन रहे हैं... (रोकने के लिए दबाएं)' : 'Listening live... (Tap to pause)'}</span>
            </>
          ) : (
            <span>{language === 'hi' ? 'माइक दबाएं और अपनी भाषा में बोलें' : 'Tap Mic & Speak in Your Dialect'}</span>
          )}
        </p>

        {speechError && (
          <p className="text-[11px] text-amber-900 mt-1 px-3 py-1 rounded-lg bg-amber-50 border border-amber-200 text-center font-medium">
            {speechError}
          </p>
        )}
      </div>

      {/* Spoken Transcript Area (Interactive & Editable) */}
      <div>
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 mb-3 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-black tracking-wider uppercase text-slate-800 flex items-center gap-1">
              <Edit3 className="w-3.5 h-3.5 text-amber-700" />
              {language === 'hi' ? 'बोला गया विवरण (संपादन योग्य):' : 'Spoken Voice Narrative (Editable):'}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={playCurrentTranscript}
                title="Listen to Transcript"
                className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
              >
                <Volume2 className="w-3 h-3 text-amber-700" />
                <span>सुनें</span>
              </button>
              <button
                onClick={() => {
                  const sample = currentVoiceSamples[activeDialect] || currentVoiceSamples['hi'];
                  setTranscript(sample);
                }}
                title="Reset to Authentic Sample"
                className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3 text-slate-600" />
                <span>रीसेट</span>
              </button>
            </div>
          </div>

          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={3}
            className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-2.5 leading-relaxed focus:outline-none focus:border-amber-600 focus:bg-white transition-colors resize-none shadow-inner"
            placeholder={language === 'hi' ? 'माइक से बोलें या सीधे यहां टाइप करें...' : 'Speak with mic or type narrative here...'}
          />
        </div>

        {/* Processing Indicator Overlay */}
        {isProcessing && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-3 mb-3 animate-pulse">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
            <span>{processStatusText || 'AI Studio & Llama 3.2 Vision Cataloging in progress...'}</span>
          </div>
        )}

        {/* Big Action Button: Process & Next */}
        <button
          onClick={handleProceed}
          disabled={isProcessing}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500 text-white font-black text-sm shadow-xl shadow-orange-600/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <span>{isProcessing ? 'AI कैटलॉग तैयार हो रहा है...' : (language === 'hi' ? 'कैटलॉग और उचित मूल्य तैयार करें' : 'Generate Studio Catalog & Fair Price')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
