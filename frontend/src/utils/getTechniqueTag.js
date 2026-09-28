import { craftTechniques } from '../data/craftTechniques';

/**
 * Deterministic technique lineage matching against existing product attributes.
 * Pure static keyword lookup — ZERO live AI dependency or inference.
 *
 * @param {Object} product - Product record
 * @returns {Object|null} Matching technique object from craftTechniques glossary or null.
 */
export function getTechniqueTag(product) {
  if (!product) return null;

  // Aggregate category and descriptive craft identifiers
  const craftType = (
    (product.craftCategory || '') + ' ' +
    (product.craft_category || '') + ' ' +
    (product.technique || '') + ' ' +
    (product.title_en || '') + ' ' +
    (product.gi_tag_name || '')
  ).toLowerCase();

  for (const [key, technique] of Object.entries(craftTechniques)) {
    const normalizedKey = key.toLowerCase();
    const spacedKey = normalizedKey.replace('_', ' ');

    if (craftType.includes(normalizedKey) || craftType.includes(spacedKey)) {
      return technique;
    }
  }

  // Alias lookups for common terms
  if ((craftType.includes('mirror') || craftType.includes('rabari') || craftType.includes('shisha') || craftType.includes('abhla')) && craftTechniques.kutch_embroidery) {
    return craftTechniques.kutch_embroidery;
  }
  if ((craftType.includes('copper') || craftType.includes('tambat') || craftType.includes('thathera')) && craftTechniques.copper_craft) {
    return craftTechniques.copper_craft;
  }
  if ((craftType.includes('brass') || craftType.includes('moradabad')) && craftTechniques.moradabad_brass) {
    return craftTechniques.moradabad_brass;
  }
  if ((craftType.includes('block print') || craftType.includes('sanganer') || craftType.includes('bagru')) && craftTechniques.sanganeri) {
    return craftTechniques.sanganeri;
  }
  if ((craftType.includes('channapatna') || craftType.includes('lac-turn') || craftType.includes('lacquer')) && craftTechniques.channapatna) {
    return craftTechniques.channapatna;
  }
  if (craftType.includes('pichwai') && craftTechniques.pichwai) {
    return craftTechniques.pichwai;
  }
  if ((craftType.includes('zardozi') || craftType.includes('zari embroidery')) && craftTechniques.zardozi) {
    return craftTechniques.zardozi;
  }
  if (craftType.includes('kantha') && craftTechniques.kantha) {
    return craftTechniques.kantha;
  }
  if ((craftType.includes('tanjore') || craftType.includes('thanjavur')) && craftTechniques.tanjore) {
    return craftTechniques.tanjore;
  }
  if ((craftType.includes('cane') || craftType.includes('bamboo')) && craftTechniques.cane_bamboo) {
    return craftTechniques.cane_bamboo;
  }

  // Also check if category mentions 'wood' -> wooden_craft
  if (craftType.includes('wood') && craftTechniques.wooden_craft) {
    return craftTechniques.wooden_craft;
  }

  // No match: return null so NO badge or gap is rendered
  return null;
}
