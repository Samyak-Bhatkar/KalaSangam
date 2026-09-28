// Build-time and test-time validator for Naad-Virasat instruments and scales dataset
import instruments from './instruments.json' with { type: 'json' };
import scalesData from './scales.json' with { type: 'json' };

const VALID_FAMILIES = ['tata', 'sushira', 'avanaddha', 'ghana'];
const VALID_STATUSES = ['living', 'rare', 'revived', 'extinct', 'uncertain'];
const VALID_EVIDENCE = ['well_documented', 'partial', 'speculative'];

export function validateDatasets() {
  const errors = [];
  const knownScaleIds = Object.keys(scalesData.ragas);

  if (!Array.isArray(instruments) || instruments.length < 6) {
    errors.push(`Instruments list must contain at least 6 curated instruments. Found: ${instruments?.length || 0}`);
  }

  instruments.forEach((inst, idx) => {
    const prefix = `[Instrument ${idx + 1} (${inst.id || 'NO_ID'})]:`;

    if (!inst.id || typeof inst.id !== 'string') {
      errors.push(`${prefix} missing valid 'id'`);
    }

    if (!inst.names?.en || !inst.names?.hi) {
      errors.push(`${prefix} missing English or Hindi localized names`);
    }

    if (!VALID_FAMILIES.includes(inst.family)) {
      errors.push(`${prefix} invalid Natyashastra family '${inst.family}'. Expected one of: ${VALID_FAMILIES.join(', ')}`);
    }

    if (!VALID_STATUSES.includes(inst.status)) {
      errors.push(`${prefix} invalid status '${inst.status}'. Expected one of: ${VALID_STATUSES.join(', ')}`);
    }

    if (!VALID_EVIDENCE.includes(inst.evidenceLevel)) {
      errors.push(`${prefix} invalid evidenceLevel '${inst.evidenceLevel}'. Expected one of: ${VALID_EVIDENCE.join(', ')}`);
    }

    if (!Array.isArray(inst.sources) || inst.sources.length === 0) {
      errors.push(`${prefix} MUST have at least 1 verified or unverified scholarly source reference.`);
    } else {
      inst.sources.forEach((src, sIdx) => {
        if (!src.title) {
          errors.push(`${prefix} source ${sIdx + 1} is missing a 'title'`);
        }
      });
    }

    if (!inst.synth || !inst.synth.type) {
      errors.push(`${prefix} missing synth configuration object.`);
    }

    if (Array.isArray(inst.scales)) {
      inst.scales.forEach(sId => {
        if (!knownScaleIds.includes(sId)) {
          errors.push(`${prefix} references unknown scale '${sId}'. Valid: ${knownScaleIds.join(', ')}`);
        }
      });
    }
  });

  // Verify scale definitions
  Object.entries(scalesData.ragas).forEach(([ragaId, raga]) => {
    if (ragaId === 'mohanam' && raga.type !== 'pentatonic') {
      errors.push(`Mohanam MUST be classified as pentatonic (audava). Found: ${raga.type}`);
    }
    if (ragaId === 'bhairav' && raga.type === 'pentatonic') {
      errors.push(`Bhairav CANNOT be classified as pentatonic! Found: ${raga.type}`);
    }
    if (!Array.isArray(raga.swaras) || raga.swaras.length < 5) {
      errors.push(`Raga ${ragaId} has invalid or insufficient swaras.`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    instrumentCount: instruments.length,
    scaleCount: Object.keys(scalesData.ragas).length
  };
}

// Standalone runner when invoked via node
if (typeof process !== 'undefined' && process?.argv?.[1]?.endsWith('validator.js')) {
  const result = validateDatasets();
  if (!result.valid) {
    console.error('❌ Naad-Virasat Dataset Validation FAILED:');
    result.errors.forEach(e => console.error('  - ' + e));
    process.exit(1);
  } else {
    console.log(`✅ Naad-Virasat Datasets VALIDATED: ${result.instrumentCount} instruments, ${result.scaleCount} scales.`);
  }
}
