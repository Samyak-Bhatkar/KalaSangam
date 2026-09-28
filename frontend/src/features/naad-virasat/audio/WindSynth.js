/**
 * WindSynth - Aerophone Synthesis (Venu Bamboo Flute & Sacred Shankha Conch)
 * Simulates turbulent breath flow, edge tone excitation, acoustic pipe resonance,
 * and natural finger-hole sliding portamento.
 */

export class WindSynth {
  constructor(audioContext) {
    this.ctx = audioContext;
    this.activeVoice = null;
    this.noiseBuffer = this.createNoiseBuffer();
  }

  createNoiseBuffer() {
    const sampleRate = this.ctx.sampleRate;
    const length = sampleRate * 2; // 2 seconds looped pink-ish noise
    const buffer = this.ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;

    for (let i = 0; i < length; i++) {
      const white = (Math.random() * 2 - 1);
      // Pink noise 3-pole filter
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      data[i] = (b0 + b1 + b2 + white * 0.5362) * 0.12;
    }

    return buffer;
  }

  /**
   * Start playing a continuous flute note or shankha swell
   */
  startNote(destination, frequency, options = {}) {
    this.stopNote(0.04);

    const now = this.ctx.currentTime;
    const {
      isShankha = false,
      noiseRatio = 0.16,
      vibratoRate = 5.2,
      vibratoDepth = 0.012,
      attackSeconds = 0.09
    } = options;

    // Master voice gain
    const voiceGain = this.ctx.createGain();
    voiceGain.gain.setValueAtTime(0.0001, now);

    // Primary acoustic tone oscillator (sine/triangle combo)
    const osc1 = this.ctx.createOscillator();
    osc1.type = isShankha ? 'sawtooth' : 'sine';
    osc1.frequency.setValueAtTime(frequency, now);

    const osc2 = this.ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(frequency * (isShankha ? 2 : 2.001), now);

    const osc2Gain = this.ctx.createGain();
    osc2Gain.gain.setValueAtTime(isShankha ? 0.45 : 0.22, now);

    // Vibrato LFO
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(isShankha ? 3.0 : vibratoRate, now);

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(frequency * (isShankha ? 0.008 : vibratoDepth), now);

    lfo.connect(lfoGain);
    lfoGain.connect(osc1.frequency);
    lfoGain.connect(osc2.frequency);

    // Breath noise source
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = this.noiseBuffer;
    noiseSource.loop = true;

    // Tracking bandpass filter for breath hiss
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(frequency * 1.8, now);
    noiseFilter.Q.setValueAtTime(isShankha ? 1.5 : 3.5, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(isShankha ? 0.08 : noiseRatio, now);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);

    // Formant filter (bamboo or conch body resonance)
    const bodyFilter = this.ctx.createBiquadFilter();
    bodyFilter.type = isShankha ? 'lowpass' : 'peaking';
    bodyFilter.frequency.setValueAtTime(isShankha ? 950 : 2100, now);
    bodyFilter.Q.setValueAtTime(isShankha ? 2.5 : 1.2, now);
    if (!isShankha) bodyFilter.gain.setValueAtTime(4.0, now);

    // Routing
    osc1.connect(bodyFilter);
    osc2.connect(osc2Gain);
    osc2Gain.connect(bodyFilter);
    noiseGain.connect(bodyFilter);

    bodyFilter.connect(voiceGain);
    voiceGain.connect(destination);

    // Attack envelope
    const attack = isShankha ? 0.65 : attackSeconds;
    voiceGain.gain.exponentialRampToValueAtTime(0.85, now + attack);

    osc1.start(now);
    osc2.start(now);
    lfo.start(now);
    noiseSource.start(now);

    this.activeVoice = {
      osc1,
      osc2,
      lfo,
      noiseSource,
      noiseFilter,
      voiceGain,
      currentFreq: frequency,
      isShankha
    };

    return this.activeVoice;
  }

  /**
   * Smoothly slide pitch (Gamaka / portamento)
   */
  slideFrequency(targetFreq, glideSeconds = 0.08) {
    if (!this.activeVoice) return;
    const now = this.ctx.currentTime;
    const { osc1, osc2, noiseFilter } = this.activeVoice;

    osc1.frequency.cancelScheduledValues(now);
    osc1.frequency.setValueAtTime(osc1.frequency.value, now);
    osc1.frequency.exponentialRampToValueAtTime(targetFreq, now + glideSeconds);

    osc2.frequency.cancelScheduledValues(now);
    osc2.frequency.setValueAtTime(osc2.frequency.value, now);
    osc2.frequency.exponentialRampToValueAtTime(targetFreq * (this.activeVoice.isShankha ? 2 : 2.001), now + glideSeconds);

    noiseFilter.frequency.cancelScheduledValues(now);
    noiseFilter.frequency.setValueAtTime(noiseFilter.frequency.value, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(targetFreq * 1.8, now + glideSeconds);

    this.activeVoice.currentFreq = targetFreq;
  }

  /**
   * Stop active wind note with natural decay
   */
  stopNote(releaseSeconds = 0.25) {
    if (!this.activeVoice) return;
    const voice = this.activeVoice;
    this.activeVoice = null;

    const now = this.ctx.currentTime;
    const rel = voice.isShankha ? 1.5 : releaseSeconds;

    voice.voiceGain.gain.cancelScheduledValues(now);
    voice.voiceGain.gain.setValueAtTime(voice.voiceGain.gain.value, now);
    voice.voiceGain.gain.linearRampToValueAtTime(0.0001, now + rel);

    setTimeout(() => {
      try {
        voice.osc1.stop();
        voice.osc2.stop();
        voice.lfo.stop();
        voice.noiseSource.stop();
        voice.voiceGain.disconnect();
      } catch {
        // ignore already stopped
      }
    }, rel * 1000 + 50);
  }
}
