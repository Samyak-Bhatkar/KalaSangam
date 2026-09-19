/**
 * ShilpSetu AI - On-Device Real-Time Computer Vision Heuristics
 * Architecture: Mobile browser-first, runs 15-30 FPS via lightweight HTML5 Canvas
 * Designed for low-end Android devices with zero server latency during live framing.
 */

/**
 * 1. Tilt / Level Detection using Gyroscope
 * @param {number} gamma - Device roll (-90 to +90)
 * @param {number} beta - Device pitch (-180 to +180)
 * @returns {{ isLevel: boolean, tiltDegrees: number, bubbleOffsetPct: number, direction: 'left'|'right'|'level' }}
 */
export function calculateTiltLevel(gamma = 0, beta = 0) {
  const roll = typeof gamma === 'number' ? gamma : 0;
  const clampedRoll = Math.max(-45, Math.min(45, roll));

  // Threshold: within ±3.5 degrees is considered level
  const LEVEL_THRESHOLD_DEG = 3.5;
  const isLevel = Math.abs(clampedRoll) <= LEVEL_THRESHOLD_DEG;

  let direction = 'level';
  if (clampedRoll > LEVEL_THRESHOLD_DEG) {
    direction = 'right';
  } else if (clampedRoll < -LEVEL_THRESHOLD_DEG) {
    direction = 'left';
  }

  const bubbleOffsetPct = Math.max(-100, Math.min(100, (clampedRoll / 20) * 100));

  return {
    isLevel,
    tiltDegrees: Math.round(clampedRoll),
    bubbleOffsetPct,
    direction,
  };
}

/**
 * 2. Real-time Luminance Histogram Analysis
 * Computes mean luminance, shadow underexposure, and glare overexposure.
 * @param {ImageData} imageData - Grayscale or RGBA image data from downsampled canvas
 * @returns {{ status: 'good'|'dim'|'bright', meanLum: number, shadowPct: number, highlightPct: number, visualHint: string }}
 */
export function analyzeFrameLuminance(imageData) {
  if (!imageData || !imageData.data) {
    return { status: 'good', meanLum: 128, shadowPct: 0, highlightPct: 0, visualHint: 'balanced' };
  }

  const data = imageData.data;
  let totalLum = 0;
  let shadowPixels = 0;
  let highlightPixels = 0;

  const step = 2;
  let sampled = 0;

  for (let i = 0; i < data.length; i += 4 * step) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    totalLum += lum;
    if (lum < 35) shadowPixels++;
    if (lum > 230) highlightPixels++;
    sampled++;
  }

  const meanLum = sampled > 0 ? totalLum / sampled : 128;
  const shadowPct = sampled > 0 ? (shadowPixels / sampled) * 100 : 0;
  const highlightPct = sampled > 0 ? (highlightPixels / sampled) * 100 : 0;

  let status = 'good';
  let visualHint = 'balanced';

  if (meanLum < 68 || shadowPct > 38) {
    status = 'dim';
    visualHint = 'move_near_window';
  } else if (meanLum > 195 || highlightPct > 28) {
    status = 'bright';
    visualHint = 'move_to_shade';
  }

  return {
    status,
    meanLum: Math.round(meanLum),
    shadowPct: Math.round(shadowPct),
    highlightPct: Math.round(highlightPct),
    visualHint,
  };
}

/**
 * 3. Distance-to-Subject & Centering Saliency Estimator
 * Uses fast Sobel gradient clustering to estimate subject bounding box.
 * @param {ImageData} imageData - Downsampled frame (e.g. 120x120)
 * @returns {{ coveragePct: number, distanceStatus: 'too_far'|'too_close'|'good', isCentered: boolean, nudge: 'left'|'right'|'up'|'down'|'centered', box: {x:number, y:number, w:number, h:number} }}
 */
export function estimateSubjectSaliencyAndCoverage(imageData) {
  if (!imageData || !imageData.data) {
    return {
      coveragePct: 70,
      distanceStatus: 'good',
      isCentered: true,
      nudge: 'centered',
      box: { x: 0.15, y: 0.15, w: 0.7, h: 0.7 },
    };
  }

  const { width, height, data } = imageData;
  const gray = new Uint8Array(width * height);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    gray[p] = (data[i] * 77 + data[i + 1] * 150 + data[i + 2] * 29) >> 8;
  }

  let minX = width;
  let maxX = 0;
  let minY = height;
  let maxY = 0;
  let energyCount = 0;

  const thresholdGradient = 24;

  for (let y = 1; y < height - 1; y += 2) {
    const rowOffset = y * width;
    for (let x = 1; x < width - 1; x += 2) {
      const gx = Math.abs(gray[rowOffset + x + 1] - gray[rowOffset + x - 1]);
      const gy = Math.abs(gray[rowOffset + width + x] - gray[rowOffset - width + x]);
      const grad = gx + gy;

      if (grad > thresholdGradient) {
        energyCount++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (energyCount < 25 || maxX <= minX || maxY <= minY) {
    return {
      coveragePct: 68,
      distanceStatus: 'good',
      isCentered: true,
      nudge: 'centered',
      box: { x: 0.15, y: 0.15, w: 0.7, h: 0.7 },
    };
  }

  const boxW = (maxX - minX) / width;
  const boxH = (maxY - minY) / height;
  const coveragePct = Math.round(boxW * boxH * 100);

  let distanceStatus = 'good';
  if (coveragePct < 45) {
    distanceStatus = 'too_far';
  } else if (coveragePct > 84) {
    distanceStatus = 'too_close';
  }

  const centerX = (minX + maxX) / (2 * width);
  const centerY = (minY + maxY) / (2 * height);

  const dx = centerX - 0.5;
  const dy = centerY - 0.5;

  let nudge = 'centered';
  const CENTER_TOLERANCE = 0.12;

  if (Math.abs(dx) > CENTER_TOLERANCE || Math.abs(dy) > CENTER_TOLERANCE) {
    if (Math.abs(dx) > Math.abs(dy)) {
      nudge = dx > 0 ? 'left' : 'right';
    } else {
      nudge = dy > 0 ? 'up' : 'down';
    }
  }

  return {
    coveragePct,
    distanceStatus,
    isCentered: nudge === 'centered',
    nudge,
    box: {
      x: minX / width,
      y: minY / height,
      w: boxW,
      h: boxH,
    },
  };
}

/**
 * 4. Background Clutter Heuristic
 * Measures high-frequency edge density in the peripheral margin outside the central guide
 * @param {ImageData} imageData
 * @returns {{ isCluttered: boolean, clutterDensity: number }}
 */
export function computeBackgroundClutterScore(imageData) {
  if (!imageData || !imageData.data) return { isCluttered: false, clutterDensity: 0.1 };

  const { width, height, data } = imageData;
  const marginX = Math.floor(width * 0.18);
  const marginY = Math.floor(height * 0.18);

  let perimeterEdges = 0;
  let perimeterSamples = 0;

  for (let y = 1; y < height - 1; y += 3) {
    const isPerimeterY = y < marginY || y > height - marginY;
    const rowOffset = y * width;

    for (let x = 1; x < width - 1; x += 3) {
      const isPerimeterX = x < marginX || x > width - marginX;

      if (isPerimeterX || isPerimeterY) {
        perimeterSamples++;
        const p1 = (rowOffset + x) * 4;
        const p2 = (rowOffset + x + 1) * 4;
        const diff = Math.abs(data[p1] - data[p2]);
        if (diff > 28) {
          perimeterEdges++;
        }
      }
    }
  }

  const clutterDensity = perimeterSamples > 0 ? perimeterEdges / perimeterSamples : 0;
  return {
    isCluttered: clutterDensity > 0.28,
    clutterDensity: Math.round(clutterDensity * 100),
  };
}

/**
 * 5. Steadiness / Motion Detection
 * Compares Sum of Absolute Differences (SAD) across consecutive frame buffers.
 * @param {Uint8Array|null} prevBuffer
 * @param {Uint8Array} currBuffer
 * @returns {{ isSteady: boolean, motionScore: number }}
 */
export function detectFrameMotion(prevBuffer, currBuffer) {
  if (!prevBuffer || !currBuffer || prevBuffer.length !== currBuffer.length) {
    return { isSteady: true, motionScore: 0 };
  }

  let sumDiff = 0;
  const len = currBuffer.length;
  const step = 4;
  let samples = 0;

  for (let i = 0; i < len; i += step) {
    sumDiff += Math.abs(currBuffer[i] - prevBuffer[i]);
    samples++;
  }

  const meanDiff = samples > 0 ? sumDiff / samples : 0;
  const isSteady = meanDiff < 8.5;

  return {
    isSteady,
    motionScore: Math.round(meanDiff * 10) / 10,
  };
}
