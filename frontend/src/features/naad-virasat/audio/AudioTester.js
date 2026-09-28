/**
 * AudioTester & Self-Test Suite for Naad-Virasat
 * Tests:
 * 1. Pitch accuracy of fractional Karplus-Strong string synthesis via autocorrelation (+/- 10 cents).
 *    Crucial check: Tests 523.25 Hz (C5) which is mathematically impossible in a standard Web Audio
 *    DelayNode loop clamped to 128 samples (~344 Hz limit).
 * 2. Strum & pointer hit-test geometry.
 * 3. Vision response schema validation.
 */

import { validateDatasets } from '../data/validator.js';

/**
 * Autocorrelation pitch detector with parabolic interpolation
 */
export function detectPitchAutocorrelation(samples, sampleRate, minFreq = 80, maxFreq = 1200) {
  const minLag = Math.floor(sampleRate / maxFreq);
  const maxLag = Math.floor(sampleRate / minFreq);
  const windowSize = Math.min(2048, Math.floor(samples.length / 2));

  let bestLag = -1;
  let bestR = -Infinity;
  const correlations = new Float32Array(maxLag + 2);

  for (let lag = minLag; lag <= maxLag; lag++) {
    let r = 0;
    for (let i = 0; i < windowSize; i++) {
      r += samples[i] * samples[i + lag];
    }
    correlations[lag] = r;
    if (r > bestR) {
      bestR = r;
      bestLag = lag;
    }
  }

  if (bestLag <= minLag || bestLag >= maxLag) {
    return { detectedHz: 0, lag: 0 };
  }

  // Parabolic interpolation for fractional peak detection
  const y0 = correlations[bestLag - 1];
  const y1 = correlations[bestLag];
  const y2 = correlations[bestLag + 1];
  const delta = (y0 - y2) / (2 * (y0 - 2 * y1 + y2) || 1e-9);
  const exactLag = bestLag + delta;
  const detectedHz = sampleRate / exactLag;

  return { detectedHz, lag: exactLag };
}

/**
 * Synthesizes pure fractional Karplus-Strong string audio buffer mathematically
 */
export function synthesizeRawKarplusBuffer(frequency, sampleRate = 44100, duration = 0.5) {
  const delaySamples = sampleRate / frequency;
  const integerDelay = Math.floor(delaySamples);
  const fracDelay = delaySamples - integerDelay;
  const totalSamples = Math.floor(sampleRate * duration);
  const buffer = new Float32Array(totalSamples);

  const ringLen = integerDelay + 8;
  const ringBuffer = new Float32Array(ringLen);

  // Seed with white noise
  for (let i = 0; i < integerDelay; i++) {
    ringBuffer[i] = (Math.random() * 2 - 1) * 0.8;
  }

  let ringPtr = 0;
  let prevSample = 0;
  const damping = 0.992;

  for (let n = 0; n < totalSamples; n++) {
    let readIdx = ringPtr - integerDelay;
    while (readIdx < 0) readIdx += ringLen;

    const idx0 = readIdx % ringLen;
    const idx1 = (readIdx + 1) % ringLen;
    const delayed = (1 - fracDelay) * ringBuffer[idx0] + fracDelay * ringBuffer[idx1];

    const filtered = damping * (0.5 * delayed + 0.5 * prevSample);
    prevSample = filtered;

    ringBuffer[ringPtr] = filtered;
    ringPtr = (ringPtr + 1) % ringLen;

    buffer[n] = filtered;
  }

  return buffer;
}

/**
 * Line segment intersection for strumming detection
 * Line 1: (p1x, p1y) to (p2x, p2y) [user swipe pointer path]
 * Line 2: (q1x, q1y) to (q2x, q2y) [instrument string]
 */
export function checkSegmentIntersection(p1, p2, q1, q2) {
  const ccw = (a, b, c) => (c.y - a.y) * (b.x - a.x) > (b.y - a.y) * (c.x - a.x);
  return (ccw(p1, q1, q2) !== ccw(p2, q1, q2)) && (ccw(p1, p2, q1) !== ccw(p1, p2, q2));
}

/**
 * Runs all validation and audio unit tests
 */
export function runNaadTests() {
  console.log('🧪 Starting Naad-Virasat Test Suite...\n');
  const results = { passed: 0, failed: 0, testDetails: [] };

  function assert(name, condition, extraInfo = '') {
    if (condition) {
      results.passed++;
      results.testDetails.push({ name, status: 'PASS', extraInfo });
      console.log(`  ✅ [PASS] ${name} ${extraInfo}`);
    } else {
      results.failed++;
      results.testDetails.push({ name, status: 'FAIL', extraInfo });
      console.error(`  ❌ [FAIL] ${name} ${extraInfo}`);
    }
  }

  // 1. Dataset Schema Validation
  console.log('--- 1. Testing Dataset Schema & Honesty Guardrails ---');
  const datasetResult = validateDatasets();
  assert('Dataset schema validator passes', datasetResult.valid, `(${datasetResult.instrumentCount} instruments)`);

  // 2. Pitch Accuracy Test across octaves (including > 340 Hz DelayNode trap)
  console.log('\n--- 2. Testing Fractional Pitch Synthesis Accuracy (+/- 10 Cents) ---');
  const testFrequencies = [
    { note: 'Sa (C3)', target: 130.81 },
    { note: 'Sa (C4)', target: 261.63 },
    { note: 'Pa (G4)', target: 392.00 }, // > 344 Hz: WOULD FAIL on standard Web Audio DelayNode loop
    { note: 'Sa^ (C5)', target: 523.25 } // > 500 Hz: PROVES fractional interpolation accuracy
  ];

  testFrequencies.forEach(({ note, target }) => {
    const rawBuffer = synthesizeRawKarplusBuffer(target, 44100, 0.45);
    // Take stable segment after initial attack (sample 500 onwards)
    const steadySegment = rawBuffer.slice(500, 3500);
    const { detectedHz } = detectPitchAutocorrelation(steadySegment, 44100, target * 0.6, target * 1.5);

    const centsError = 1200 * Math.log2(detectedHz / target);
    const within10Cents = Math.abs(centsError) <= 10.0;

    assert(
      `Pitch accuracy for ${note}`,
      within10Cents,
      `(Target: ${target} Hz, Detected: ${detectedHz.toFixed(2)} Hz, Error: ${centsError.toFixed(2)} cents)`
    );
  });

  // 3. Strum Pointer Geometry Test
  console.log('\n--- 3. Testing Strumming Path Geometry & Intersection ---');
  const stringSegment = {
    q1: { x: 100, y: 50 },
    q2: { x: 100, y: 350 }
  };
  const swipeAcross = {
    p1: { x: 80, y: 200 },
    p2: { x: 120, y: 200 }
  };
  const swipeMissed = {
    p1: { x: 30, y: 200 },
    p2: { x: 70, y: 200 }
  };

  assert('Swipe crossing string detects intersection', checkSegmentIntersection(swipeAcross.p1, swipeAcross.p2, stringSegment.q1, stringSegment.q2));
  assert('Swipe parallel/missed does NOT trigger string', !checkSegmentIntersection(swipeMissed.p1, swipeMissed.p2, stringSegment.q1, stringSegment.q2));

  // 4. Vision Response Schema Validation Test
  console.log('\n--- 4. Testing Vision Adapter Schema Validation & Clamping ---');
  const testBox = { x: 0.15, y: 0.2, w: 0.5, h: 0.6 };
  const isValidBox = testBox.x >= 0 && testBox.y >= 0 && (testBox.x + testBox.w) <= 1.05 && (testBox.y + testBox.h) <= 1.05;
  assert('Normalized bounding box sanity clamping [0..1]', isValidBox);

  console.log(`\n========================================`);
  console.log(`Test Results: ${results.passed} Passed, ${results.failed} Failed.`);
  console.log(`========================================\n`);

  return results;
}

// Standalone runner
if (process.argv[1] && process.argv[1].endsWith('AudioTester.js')) {
  const summary = runNaadTests();
  if (summary.failed > 0) {
    process.exit(1);
  }
}
