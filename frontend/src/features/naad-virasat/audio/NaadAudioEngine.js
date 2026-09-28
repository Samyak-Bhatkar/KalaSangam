/**
 * NaadAudioEngine - Core Isolated Web Audio Manager for Naad-Virasat
 * Strict isolation: Dedicated AudioContext, master limiting compressor,
 * Stone Mandapa impulse convolver, zero-leak voice lifecycle, and Safari unlock.
 */

import { KarplusStrongSynth } from './KarplusStrongSynth.js';
import { ModalDrumSynth } from './ModalDrumSynth.js';
import { WindSynth } from './WindSynth.js';
import { BellSynth } from './BellSynth.js';
import { createMandapaImpulseResponse } from './MandapaConvolver.js';

export class NaadAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.limiter = null;
    this.analyser = null;
    this.convolver = null;
    this.convolverGain = null;
    this.dryGain = null;

    // Sub-synthesizers
    this.karplus = null;
    this.drum = null;
    this.wind = null;
    this.bell = null;

    // Polyphony & voice tracking
    this.maxPolyphony = 24;
    this.activeVoices = [];

    // Tanpura Drone state
    this.droneVoices = [];
    this.isDroneActive = false;

    // Diagnostics & Latency
    this.lastTriggerLatencyMs = 0;
    this.isMandapaActive = false;
    this.isInitialized = false;

    // Phrase playback timer
    this.phraseTimeouts = [];
  }

  /**
   * Initializes or resumes the AudioContext on user interaction
   */
  async init() {
    if (this.isInitialized && this.ctx) {
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }
      return;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      console.warn('Web Audio API not supported in this browser.');
      return;
    }

    this.ctx = new AudioContextClass({ latencyHint: 'interactive' });

    // Master Limiting Chain
    this.limiter = this.ctx.createDynamicsCompressor();
    this.limiter.threshold.setValueAtTime(-6.0, this.ctx.currentTime);
    this.limiter.knee.setValueAtTime(12.0, this.ctx.currentTime);
    this.limiter.ratio.setValueAtTime(12.0, this.ctx.currentTime);
    this.limiter.attack.setValueAtTime(0.003, this.ctx.currentTime);
    this.limiter.release.setValueAtTime(0.18, this.ctx.currentTime);

    // Analyser Node for sound-reactive stone pulse
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.8;

    // Master Volume Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.9, this.ctx.currentTime);

    // Dry bus
    this.dryGain = this.ctx.createGain();
    this.dryGain.gain.setValueAtTime(1.0, this.ctx.currentTime);

    // Mandapa Reverb Bus
    this.convolver = this.ctx.createConvolver();
    this.convolverGain = this.ctx.createGain();
    this.convolverGain.gain.setValueAtTime(0.0, this.ctx.currentTime); // Off by default

    try {
      const ir = createMandapaImpulseResponse(this.ctx);
      this.convolver.buffer = ir;
    } catch (e) {
      console.warn('Failed to generate Mandapa impulse response:', e);
    }

    // Connect Reverb Chain
    this.convolver.connect(this.convolverGain);
    this.convolverGain.connect(this.masterGain);
    this.dryGain.connect(this.masterGain);

    // Master bus to output
    this.masterGain.connect(this.limiter);
    this.limiter.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    // Instantiate DSP synths
    this.karplus = new KarplusStrongSynth(this.ctx);
    this.drum = new ModalDrumSynth(this.ctx);
    this.wind = new WindSynth(this.ctx);
    this.bell = new BellSynth(this.ctx);

    // Bind tab visibility handler
    this.handleVisibilityChange = () => {
      if (document.hidden && this.ctx && this.ctx.state === 'running') {
        this.ctx.suspend();
      } else if (!document.hidden && this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    };
    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    this.isInitialized = true;

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  /**
   * Routes dry audio & reverb send
   */
  getInputNode() {
    const inputGain = this.ctx.createGain();
    inputGain.connect(this.dryGain);
    inputGain.connect(this.convolver);
    return inputGain;
  }

  /**
   * Tracks and steals oldest voices when polyphony limit is exceeded
   */
  registerVoice(voiceHandle) {
    if (this.activeVoices.length >= this.maxPolyphony) {
      const oldest = this.activeVoices.shift();
      if (oldest && typeof oldest.stop === 'function') {
        try { oldest.stop(0.02); } catch {}
      }
    }
    this.activeVoices.push(voiceHandle);
  }

  /**
   * Trigger note for any of the 4 Natyashastra families
   */
  triggerInstrument(instrument, params = {}) {
    const startMeasure = performance.now();

    if (!this.ctx || this.ctx.state === 'suspended') {
      this.init();
    }

    const inputNode = this.getInputNode();
    const family = instrument.family;
    const velocity = params.velocity || 0.8;
    const freq = params.frequency || 261.63;
    let voice = null;

    if (family === 'tata') {
      // Plucked string (Ekatantri Vina, Yazh)
      voice = this.karplus.trigger(inputNode, freq, velocity, {
        damping: instrument.synth?.damping || 0.988,
        stiffness: instrument.synth?.stiffness || 0.0015,
        pluckPoint: params.pluckPoint || instrument.synth?.pluckComb || 0.22,
        jivariBuzz: instrument.synth?.jivariBuzz || 0.15,
        bodyResonanceHz: instrument.synth?.bodyResonanceHz || 195
      });
    } else if (family === 'avanaddha') {
      // Membranophone (Mridangam, Damaru)
      const strokeType = params.strokeType || 'dheem';
      voice = this.drum.trigger(inputNode, strokeType, velocity, {
        centerFreq: instrument.synth?.centerFreq || 146.83,
        rimFreq: instrument.synth?.rimFreq || 293.66,
        dampingSeconds: instrument.synth?.dampingSeconds || 1.2,
        pitchDropHz: instrument.synth?.pitchDropAmount || 35,
        harmonicPurity: instrument.synth?.harmonicPurity || 0.9
      });
    } else if (family === 'sushira') {
      // Aerophone (Venu, Shankha)
      const isShankha = instrument.id === 'shankha';
      voice = this.wind.startNote(inputNode, freq, {
        isShankha,
        noiseRatio: instrument.synth?.noiseRatio || 0.16,
        vibratoRate: instrument.synth?.vibratoRate || 5.2,
        vibratoDepth: instrument.synth?.vibratoDepth || 0.012,
        attackSeconds: instrument.synth?.attackSeconds || 0.08
      });
    } else if (family === 'ghana') {
      // Idiophone (Ghanta, Manjira)
      const isManjira = instrument.id === 'manjira';
      voice = this.bell.strike(inputNode, freq, {
        isManjira,
        isMuffled: params.isMuffled || false,
        decaySeconds: instrument.synth?.decaySeconds || 5.2,
        velocity
      });
    }

    if (voice) {
      this.registerVoice(voice);
    }

    this.lastTriggerLatencyMs = Math.round((performance.now() - startMeasure) * 10) / 10;
    return voice;
  }

  /**
   * Aerophone slide / gamaka support
   */
  slideWind(targetFreq) {
    if (this.wind) {
      this.wind.slideFrequency(targetFreq);
    }
  }

  stopWind() {
    if (this.wind) {
      this.wind.stopNote();
    }
  }

  /**
   * Stone Mandapa Acoustics (Reverb) Toggle
   */
  setMandapaAcoustics(enabled) {
    this.isMandapaActive = !!enabled;
    if (!this.convolverGain || !this.ctx) return;
    const now = this.ctx.currentTime;
    this.convolverGain.gain.cancelScheduledValues(now);
    this.convolverGain.gain.setValueAtTime(this.convolverGain.gain.value, now);
    const targetGain = this.isMandapaActive ? 0.45 : 0.0;
    this.convolverGain.gain.linearRampToValueAtTime(targetGain, now + 0.12);
  }

  /**
   * Play an illustrative melodic phrase in Mohanam
   */
  playIllustrativePhrase(instrument, scaleData, baseSa = 261.63, onProgress = null) {
    this.stopIllustrativePhrase();
    if (!scaleData || !Array.isArray(scaleData.illustrativePhrase)) return;

    let delay = 0;
    scaleData.illustrativePhrase.forEach((note, index) => {
      const timeoutId = setTimeout(() => {
        const swaraObj = scaleData.swaras.find(s => s.name === note.swara);
        const freq = baseSa * (swaraObj ? swaraObj.ratio : 1.0);
        this.triggerInstrument(instrument, {
          frequency: freq,
          velocity: 0.82,
          strokeType: index % 2 === 0 ? 'dheem' : 'nam'
        });
        if (onProgress) {
          onProgress(index, note.swara);
        }
      }, delay * 1000);

      this.phraseTimeouts.push(timeoutId);
      delay += note.duration;
    });

    const finishTimeout = setTimeout(() => {
      if (onProgress) onProgress(-1, null);
    }, delay * 1000 + 300);
    this.phraseTimeouts.push(finishTimeout);
  }

  stopIllustrativePhrase() {
    this.phraseTimeouts.forEach(t => clearTimeout(t));
    this.phraseTimeouts = [];
  }

  /**
   * Tanpura Shruti Drone toggle
   */
  setDrone(enabled, baseSa = 261.63) {
    this.isDroneActive = !!enabled;
    if (!this.ctx) return;

    // Clean up existing drone
    this.droneVoices.forEach(v => {
      try {
        v.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5);
        setTimeout(() => { v.osc.stop(); v.gain.disconnect(); }, 600);
      } catch {}
    });
    this.droneVoices = [];

    if (!this.isDroneActive) return;

    const inputNode = this.getInputNode();
    const pitches = [
      baseSa * 1.5, // Pa (Fifth)
      baseSa,       // Sa (High tonic)
      baseSa,       // Sa (High tonic)
      baseSa * 0.5  // Kharja Sa (Low fundamental)
    ];

    pitches.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, this.ctx.currentTime);

      // Low pass to soften drone buzz
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(f * 2.8, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.05 / (idx + 1), this.ctx.currentTime + 1.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(inputNode);

      osc.start(this.ctx.currentTime);
      this.droneVoices.push({ osc, gain });
    });
  }

  /**
   * Sound-reactive RMS measurement (for stone pulsation)
   */
  getRMS() {
    if (!this.analyser) return 0;
    const buffer = new Float32Array(this.analyser.fftSize);
    this.analyser.getFloatTimeDomainData(buffer);
    let sumSquares = 0;
    for (let i = 0; i < buffer.length; i++) {
      sumSquares += buffer[i] * buffer[i];
    }
    const rms = Math.sqrt(sumSquares / buffer.length);
    return Math.min(1.0, rms * 3.5); // Normalized responsive scale
  }

  /**
   * Stop all voices
   */
  stopAll() {
    this.stopIllustrativePhrase();
    this.activeVoices.forEach(v => {
      try {
        if (typeof v.stop === 'function') v.stop(0.04);
      } catch {}
    });
    this.activeVoices = [];
  }

  /**
   * Lifecycle cleanup on unmount
   */
  dispose() {
    this.stopAll();
    this.setDrone(false);
    if (this.handleVisibilityChange) {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }
    if (this.ctx) {
      try {
        this.ctx.close();
      } catch {}
      this.ctx = null;
    }
    this.isInitialized = false;
  }
}

// Singleton audio engine instance for the Naad-Virasat feature
let naadEngineInstance = null;

export function getNaadAudioEngine() {
  if (!naadEngineInstance) {
    naadEngineInstance = new NaadAudioEngine();
  }
  return naadEngineInstance;
}
