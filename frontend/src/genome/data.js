/**
 * Cultural Genome Data Access Module (frontend/src/genome/data.js)
 * Mirroring future PostgreSQL schema and tables:
 * - cultural_elements
 * - relations
 * - stories
 * - timeline_events
 */

let cachedData = null;

export async function loadGenomeData() {
  if (cachedData) {
    return cachedData;
  }

  try {
    const [elementsRes, relationsRes, storiesRes, timelineRes] = await Promise.all([
      fetch('/data/genome/cultural_elements.json'),
      fetch('/data/genome/relations.json'),
      fetch('/data/genome/stories.json'),
      fetch('/data/genome/timeline_events.json')
    ]);

    if (!elementsRes.ok || !relationsRes.ok || !storiesRes.ok || !timelineRes.ok) {
      throw new Error(`Failed to load genome data: status [${elementsRes.status}, ${relationsRes.status}, ${storiesRes.status}, ${timelineRes.status}]`);
    }

    const [elements, relations, stories, timelineEvents] = await Promise.all([
      elementsRes.json(),
      relationsRes.json(),
      storiesRes.json(),
      timelineRes.json()
    ]);

    const elementsById = new Map();
    elements.forEach((el) => elementsById.set(el.id, el));

    // Index relations bidirectional
    const relationsByElement = new Map();
    relations.forEach((rel) => {
      if (!relationsByElement.has(rel.from_id)) {
        relationsByElement.set(rel.from_id, []);
      }
      relationsByElement.get(rel.from_id).push(rel);

      if (!relationsByElement.has(rel.to_id)) {
        relationsByElement.set(rel.to_id, []);
      }
      relationsByElement.get(rel.to_id).push(rel);
    });

    // Index stories by element
    const storiesByElement = new Map();
    stories.forEach((st) => {
      if (!storiesByElement.has(st.element_id)) {
        storiesByElement.set(st.element_id, []);
      }
      storiesByElement.get(st.element_id).push(st);
    });

    // Index timeline events by tradition
    const timelineByTradition = new Map();
    timelineEvents.forEach((te) => {
      if (!timelineByTradition.has(te.tradition_id)) {
        timelineByTradition.set(te.tradition_id, []);
      }
      timelineByTradition.get(te.tradition_id).push(te);
    });
    // Sort timeline by year
    timelineByTradition.forEach((events) => {
      events.sort((a, b) => a.year - b.year);
    });

    cachedData = {
      elements,
      relations,
      stories,
      timelineEvents,
      elementsById,
      relationsByElement,
      storiesByElement,
      timelineByTradition
    };

    return cachedData;
  } catch (error) {
    console.error("Error loading Cultural Genome data:", error);
    throw error;
  }
}

export function getElementById(data, id) {
  if (!data || !data.elementsById) return null;
  return data.elementsById.get(id) || null;
}

export function getRelatedElements(data, elementId) {
  if (!data || !data.relationsByElement) return [];
  const rels = data.relationsByElement.get(elementId) || [];
  return rels.map((r) => {
    const isSource = r.from_id === elementId;
    const targetId = isSource ? r.to_id : r.from_id;
    const targetElement = data.elementsById.get(targetId);
    return {
      relation: r,
      isSource,
      targetElement,
      weight: r.weight,
      kind: r.kind,
      rationale: r.rationale,
      source: r.source
    };
  }).filter((item) => item.targetElement != null);
}

export function getStoriesForElement(data, elementId) {
  if (!data || !data.storiesByElement) return [];
  return data.storiesByElement.get(elementId) || [];
}

export function getTimelineForTradition(data, traditionId) {
  if (!data || !data.timelineByTradition) return [];
  return data.timelineByTradition.get(traditionId) || [];
}

export function getDiscoveryElements(data, minRarity = 4) {
  if (!data || !data.elements) return [];
  return data.elements.filter((el) => (el.rarity || 1) >= minRarity);
}
