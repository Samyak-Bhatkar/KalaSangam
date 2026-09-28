/**
 * KarplusStrongSynth - High-Precision Fractional Delay Physical String Synthesis
 * 
 * NOTE: Avoids Web Audio DelayNode cycle clamp (which clamps feedback loops
 * to 128 samples / ~340Hz limit). Pre-synthesizes AudioBuffers with fractional-delay
 * interpolation, pluck-position comb filtering, loop damping, and jivari bridge buzz.
 */

export class KarplusStrongSynth {
  constructor(audioContext) {
    this.ctx = audioContext;
    this.bufferCache = new Map(); // key -> AudioBuffer
  }

  /**
   * Generates or fetches an AudioBuffer for a specific string pitch & excitation
   */
  getPluckedStringAudioBuffer(frequency, options = {}) {
    const {
      duration = 3.2,
      damping = 0.988,
      stiffness = 0.0015,
      pluckPoint = 0.22, // fraction along string (0.22 = near bridge)
      jivariBuzz = 0.18,  // sloping bridge buzz intensity
      bodyResonanceHz = 195
    } = options;

    const sampleRate = this.ctx.sampleRate;
    const cacheKey = `${Math.round(frequency * 100)}_${Math.round(damping * 1000)}_${Math.round(jivariBuzz * 100)}`;

    if (this.bufferCache.has(cacheKey)) {
      return this.bufferCache.get(cacheKey);
    }

    // Exact delay length in samples (with fractional component)
    const delaySamples = sampleRate / frequency;
    const integerDelay = Math.floor(delaySamples);
    const fracDelay = delaySamples - integerDelay;

    // Buffer length for output
    const totalSamples = Math.floor(sampleRate * duration);
    const audioBuffer = this.ctx.createBuffer(1, totalSamples, sampleRate);
    const channelData = audioBuffer.getChannelData(0);

    // Delay ring buffer (integerDelay + 4 samples for interpolation)
    const ringLen = integerDelay + 8;
    const ringBuffer = new Float32Array(ringLen);

    // Pluck comb filter delay: pluck point along string creates comb notches
    const combDelay = Math.max(1, Math.floor(integerDelay * pluckPoint));

    // Initialize delay line with band-limited initial pluck impulse (shaped noise)
    const noise = new Float32Array(integerDelay);
    for (let i = 0; i < integerDelay; i++) {
      noise[i] = (Math.random() * 2 - 1);
    }

    for (let i = 0; i < integerDelay; i++) {
      // Pluck comb subtraction: f(n) = noise(n) - noise(n - combDelay)
      const delayedNoise = (i >= combDelay) ? noise[i - combDelay] : 0;
      ringBuffer[i] = (noise[i] - 0.7 * delayedNoise) * 0.8;
    }

    let ringPtr = 0;
    let prevFilterSample = 0;

    // Body resonance 2nd-order IIR filter state (gourd / danda resonator)
    const omega = 2 * Math.PI * bodyResonanceHz / sampleRate;
    const alpha = Math.sin(omega) * 0.35;
    const b0 = alpha;
    const b1 = 0;
    const b2 = -alpha;
    const a0 = 1 + alpha;
    const a1 = -2 * Math.cos(omega);
    const a2 = 1 - alpha;
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0;

    // Synthesis loop with fractional delay interpolation
    for (let n = 0; n < totalSamples; n++) {
      // Read position with fractional delay
      let readIdx = ringPtr - integerDelay;
      while (readIdx < 0) readIdx += ringLen;

      const idx0 = readIdx % ringLen;
      const idx1 = (readIdx + 1) % ringLen;

      // Linear fractional delay interpolation
      const delayedSample = (1 - fracDelay) * ringBuffer[idx0] + fracDelay * ringBuffer[idx1];

      // String damping low-pass loop filter
      let filtered = damping * (0.5 * delayedSample + 0.5 * prevFilterSample);
      prevFilterSample = filtered;

      // Jivari (jawari) bridge buzz: asymmetric non-linear saturation on positive excursions
      // (simulating string buzzing against the curved bone/wood bridge face)
      if (jivariBuzz > 0.01 && filtered > 0.08) {
        const excess = filtered - 0.08;
        filtered += jivariBuzz * Math.tanh(excess * 3.5) * 0.25;
      }

      // Dispersion / stiffness nudge
      if (stiffness > 0.0001) {
        filtered = filtered * (1 - stiffness) + stiffness * delayedSample;
      }

      // Write feedback back to ring buffer
      ringBuffer[ringPtr] = filtered;
      ringPtr = (ringPtr + 1) % ringLen;

      // Apply body resonator filter
      const out = (b0 / a0) * filtered + (b1 / a0) * x1 + (b2 / a0) * x2 - (a1 / a0) * y1 - (a2 / a0) * y2;
      x2 = x1;
      x1 = filtered;
      y2 = y1;
      y1 = out;

      // Soft master gain curve to prevent clipping
      channelData[n] = filtered * 0.65 + out * 0.35;
    }

    // Cache the pre-synthesized buffer
    if (this.bufferCache.size < 40) {
      this.bufferCache.set(cacheKey, audioBuffer);
    }

    return audioBuffer;
  }

  /**
   * Plays a string note on target destination with velocity and slight pitch vibrato
   */
  trigger(destination, frequency, velocity = 0.8, options = {}) {
    const audioBuffer = this.getPluckedStringAudioBuffer(frequency, options);

    const source = this.ctx.createBufferSource();
    source.buffer = audioBuffer;

    const gainNode = this.ctx.createGain();
    const now = this.ctx.currentTime;

    // Velocity scale with natural dynamic curve
    const dynamicGain = Math.min(1.0, Math.max(0.1, velocity * 0.9));
    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.exponentialRampToValueAtTime(dynamicGain, now + 0.003); // anti-click attack

    source.connect(gainNode);
    gainNode.connect(destination);

    source.start(now);

    return {
      source,
      gainNode,
      stop: (fadeTime = 0.08) => {
        const t = this.ctx.currentTime;
        gainNode.gain.cancelScheduledValues(t);
        gainNode.gain.setValueAtTime(gainNode.gain.value, t);
        gainNode.gain.linearRampToValueAtTime(0.0001, t + fadeTime);
        source.stop(t + fadeTime + 0.01);
      }
    };
  }
}
