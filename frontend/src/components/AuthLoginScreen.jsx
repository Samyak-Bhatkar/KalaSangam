import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Volume2,
  RefreshCw,
  ShoppingBag,
  CheckCircle2,
  UserCheck,
  ChevronLeft
} from 'lucide-react';
import { useArtisan, MOCK_USERS } from '../context/ArtisanContext';

export default function AuthLoginScreen({ onBrowseStorefront }) {
  const { loginWithPhone, speakVoice, language } = useArtisan();

  // Step 1: Phone input, Step 2: OTP input
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendCountdown, setResendCountdown] = useState(30);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const otpInputRefs = useRef([]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (step === 2 && resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendCountdown]);

  // Handle phone submission (Step 1 -> Step 2)
  const handleSendOtp = (overridePhone) => {
    const targetPhone = (overridePhone || phone).replace(/\D/g, '').slice(-10);
    if (targetPhone.length !== 10) {
      setErrorMsg(language === 'hi' ? 'कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें' : 'Please enter a valid 10-digit mobile number');
      return;
    }
    setErrorMsg('');
    setPhone(targetPhone);
    setStep(2);
    setResendCountdown(30);
    // Voice prompt
    const promptText = language === 'hi'
      ? 'आपके नंबर पर छह अंकों का ओटीपी भेज दिया गया है। डेमो कोड एक दो तीन चार पांच छह है।'
      : 'A 6-digit OTP has been sent to your number. Demo code is 1 2 3 4 5 6.';
    speakVoice?.(promptText, language === 'hi' ? 'hi-IN' : 'en-IN');
  };

  // Quick Demo Autofill for judges
  const handleQuickDemoFill = (demoPhone) => {
    setPhone(demoPhone);
    handleSendOtp(demoPhone);
  };

  // Handle individual OTP digit change
  const handleOtpChange = (index, value) => {
    const cleanVal = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = cleanVal;
    setOtp(newOtp);

    // Auto-advance to next input box
    if (cleanVal && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace navigation in OTP
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Autofill demo OTP 123456
  const handleFillDemoOtp = () => {
    setOtp(['1', '2', '3', '4', '5', '6']);
  };

  // Handle OTP Verify (Step 2 -> Role Resolution)
  const handleVerifyOtp = () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 6) {
      setErrorMsg(language === 'hi' ? 'कृपया 6 अंकों का ओटीपी दर्ज करें' : 'Please enter the 6-digit OTP');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    // Accept any 6-digit OTP for 100% demo reliability
    setTimeout(() => {
      setIsSubmitting(false);
      const user = loginWithPhone(phone);
      speakVoice?.(
        language === 'hi' ? `सत्यापन सफल। स्वागत है, ${user.name}` : `Verification successful. Welcome, ${user.name}`,
        language === 'hi' ? 'hi-IN' : 'en-IN'
      );
    }, 400);
  };

  return (
    <div className="min-h-full flex flex-col justify-between p-5 bg-gradient-to-b from-amber-50/40 via-white to-orange-50/30 text-slate-900">
      {/* Top Brand Banner */}
      <div className="pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/brand_emblem.png"
              alt="ShilpSetu"
              className="w-10 h-10 rounded-full border border-amber-500/30 shadow-xs object-cover"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-black tracking-tight text-slate-900">
                  शिल्पसेतु <span className="text-[#C85A32]">ShilpSetu</span>
                </h1>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-300">
                  MoSJE
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                AI बाज़ार संपर्क व स्मार्ट कैटलॉगिंग प्रणाली
              </p>
            </div>
          </div>

          <button
            onClick={() =>
              speakVoice?.(
                step === 1
                  ? 'कृपया अपना 10 अंकों का मोबाइल नंबर दर्ज करें और ओटीपी बटन दबाएं।'
                  : 'आपके फोन पर आया छह अंकों का ओटीपी दर्ज करें।',
                'hi-IN'
              )
            }
            aria-label="Listen to voice instructions"
            className="w-9 h-9 rounded-full bg-amber-100/70 border border-amber-200 text-amber-800 flex items-center justify-center cursor-pointer shadow-xs active:scale-95"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {/* Demo Mode Notice Banner */}
        <div className="mt-4 p-2.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-300/80 flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <p className="text-[11px] font-bold text-amber-950 truncate">
              {step === 1 ? 'डेमो मोड: नीचे दिए गए टेस्ट नंबर से 1-टैप लॉगिन करें' : 'डेमो ओटीपी: 123456 (कोई भी 6 अंक मान्य)'}
            </p>
          </div>
          {step === 2 && (
            <button
              onClick={handleFillDemoOtp}
              className="px-2 py-0.5 rounded-full bg-amber-600 text-white text-[10px] font-black cursor-pointer hover:bg-amber-700 active:scale-95 shrink-0 shadow-xs"
            >
              ऑटो-भरें (Fill)
            </button>
          )}
        </div>
      </div>

      {/* Main Interactive Form Card */}
      <div className="my-auto py-6">
        {step === 1 ? (
          /* STEP 1: 10-Digit Mobile Number */
          <div className="space-y-5 animate-in fade-in duration-300">
            <div>
              <span className="text-xs font-bold text-[#C85A32] uppercase tracking-wider">
                प्रवेश द्वार • Unified Access
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                मोबाइल नंबर दर्ज करें
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                कारीगर (Artisan) एवं ग्राम समन्वयक (Coordinator) दोनों के लिए एकल प्रवेश।
              </p>
            </div>

            {/* Input Island */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>10 अंकों का मोबाइल नंबर</span>
              </label>

              <div className="flex items-center rounded-2xl border-2 border-slate-300 focus-within:border-[#C85A32] bg-white px-3.5 py-2.5 shadow-sm transition-colors">
                <span className="text-base font-bold text-slate-500 pr-2 border-r border-slate-200 select-none">
                  🇮🇳 +91
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                    setErrorMsg('');
                  }}
                  placeholder="98XXXXXXXX"
                  className="w-full pl-3 text-2xl font-black font-mono tracking-widest text-slate-900 focus:outline-none placeholder:text-slate-300 placeholder:font-normal"
                />
              </div>

              {errorMsg && (
                <p className="text-xs font-bold text-red-600 pl-1">{errorMsg}</p>
              )}
            </div>

            {/* Action Button: Send OTP (Touch Target >= 60px) */}
            <button
              onClick={() => handleSendOtp()}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#C85A32] to-[#B44B24] text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>ओटीपी भेजें (Send OTP)</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            {/* Pre-Seeded Demo Quick Fill Buttons for SIH Judges */}
            <div className="pt-2 border-t border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                जज व प्रस्तुति के लिए त्वरित चयन (Quick Demo Accounts)
              </span>

              <div className="grid grid-cols-2 gap-2">
                {/* Demo 1: Field Coordinator */}
                <button
                  onClick={() => handleQuickDemoFill('9876543210')}
                  className="p-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100/70 border border-indigo-200 text-left transition-all cursor-pointer group active:scale-95"
                >
                  <div className="flex items-center gap-1 text-[10px] font-extrabold text-indigo-900">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
                    <span>ग्राम समन्वयक</span>
                  </div>
                  <div className="text-xs font-mono font-bold text-slate-800 mt-0.5">
                    9876543210
                  </div>
                  <div className="text-[9px] text-indigo-700/80 mt-0.5">
                    समीक्षा कतार (Review Desk)
                  </div>
                </button>

                {/* Demo 2: Registered Artisan (Shanti Devi) */}
                <button
                  onClick={() => handleQuickDemoFill('9820011223')}
                  className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100/70 border border-amber-200 text-left transition-all cursor-pointer group active:scale-95"
                >
                  <div className="flex items-center gap-1 text-[10px] font-extrabold text-amber-900">
                    <UserCheck className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>शांति देवी (कारीगर)</span>
                  </div>
                  <div className="text-xs font-mono font-bold text-slate-800 mt-0.5">
                    9820011223
                  </div>
                  <div className="text-[9px] text-amber-700/80 mt-0.5">
                    कैमरा व वॉयस स्टूडियो
                  </div>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* STEP 2: 6-Digit OTP Verification */
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>नंबर बदलें</span>
              </button>

              <span className="text-[11px] font-mono font-bold text-slate-500">
                +91 {phone}
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                ओटीपी (OTP) दर्ज करें
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                +91 {phone} पर भेजा गया 6-अंकीय सत्यापन कोड दर्ज करें।
              </p>
            </div>

            {/* 6 Auto-Advancing Digit Boxes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputRefs.current[idx] = el)}
                    type="tel"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-12 h-14 rounded-2xl border-2 border-slate-300 focus:border-[#C85A32] bg-white text-center text-2xl font-black font-mono text-slate-900 focus:outline-none shadow-xs transition-colors"
                  />
                ))}
              </div>

              {errorMsg && (
                <p className="text-xs font-bold text-red-600 pl-1">{errorMsg}</p>
              )}
            </div>

            {/* Resend OTP Row */}
            <div className="flex items-center justify-between text-xs px-1">
              <span className="text-slate-500 font-medium">कोड नहीं मिला?</span>
              {resendCountdown > 0 ? (
                <span className="font-mono font-bold text-slate-500">
                  {resendCountdown}s में पुनः भेजें
                </span>
              ) : (
                <button
                  onClick={() => handleSendOtp(phone)}
                  className="font-bold text-[#C85A32] flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>पुनः ओटीपी भेजें</span>
                </button>
              )}
            </div>

            {/* Verify Action Button (Touch Target >= 60px) */}
            <button
              onClick={handleVerifyOtp}
              disabled={isSubmitting}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#C85A32] to-[#B44B24] text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{isSubmitting ? 'सत्यापन जारी है...' : 'सत्यापित करें (Verify & Login)'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Public Buyer Storefront Link (No Login Needed) */}
      <div className="pt-4 border-t border-slate-200/80 text-center">
        <button
          onClick={onBrowseStorefront}
          className="w-full py-3 px-4 rounded-2xl bg-white border border-slate-300/80 hover:border-slate-400 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 shadow-2xs active:scale-[0.98] transition-all cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4 text-[#C85A32]" />
          <span>सार्वजनिक बाज़ार देखें (Browse Live Marketplace Without Login)</span>
        </button>
        <p className="text-[10px] text-slate-400 mt-2">
          राष्ट्रीय पिछड़ा वर्ग वित्त एवं विकास निगम (NBCFDC) • भारत सरकार
        </p>
      </div>
    </div>
  );
}
