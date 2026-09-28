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

  // Also check if category mentions 'wood' -> wooden_craft
  if (craftType.includes('wood') && craftTechniques.wooden_craft) {
    return craftTechniques.wooden_craft;
  }

  // No match: return null so NO badge or gap is rendered
  return null;
}
