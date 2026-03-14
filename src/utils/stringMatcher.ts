/**
 * String Matching Utilities
 *
 * Matches parsed items against Global Library services and products
 * using string similarity algorithms.
 */

import type { ParsedItem } from './fileParser';
import type { PLService, PLProduct } from 'apiServices/practiceLibrary/types';

export interface MatchCandidate {
  type: 'service' | 'product';
  item: PLService | PLProduct;
  score: number; // 0-100
  matchedOn: string[]; // Fields that contributed to match
}

export interface MatchResult {
  sourceItem: ParsedItem;
  matches: MatchCandidate[];
  bestMatch: MatchCandidate | null;
  confidence: 'high' | 'medium' | 'low' | 'none';
}

export interface SelectedMatch {
  sourceIndex: number;
  match: MatchCandidate | null;
  createNew: boolean;
}

/**
 * Find matches for all parsed items against global library.
 */
export function findMatches(
  parsedItems: ParsedItem[],
  globalServices: PLService[],
  globalProducts: PLProduct[]
): MatchResult[] {
  return parsedItems.map((item) => findMatchesForItem(item, globalServices, globalProducts));
}

/**
 * Find matches for a single parsed item.
 */
function findMatchesForItem(
  item: ParsedItem,
  globalServices: PLService[],
  globalProducts: PLProduct[]
): MatchResult {
  const candidates: MatchCandidate[] = [];

  // Match against services
  for (const service of globalServices) {
    const score = calculateMatchScore(item, {
      title: service.title,
      description: service.description,
      category: service.category,
    });
    if (score > 0) {
      candidates.push({
        type: 'service',
        item: service,
        score,
        matchedOn: getMatchedFields(item, service.title, service.description, service.category),
      });
    }
  }

  // Match against products
  for (const product of globalProducts) {
    const score = calculateMatchScore(item, {
      title: product.title,
      description: product.description,
      category: product.category,
    });
    if (score > 0) {
      candidates.push({
        type: 'product',
        item: product,
        score,
        matchedOn: getMatchedFields(item, product.title, product.description, product.category),
      });
    }
  }

  // Sort by score descending
  candidates.sort((a, b) => b.score - a.score);

  // Take top 5 matches
  const topMatches = candidates.slice(0, 5);
  const bestMatch = topMatches[0] ?? null;

  return {
    sourceItem: item,
    matches: topMatches,
    bestMatch,
    confidence: getConfidenceLevel(bestMatch?.score ?? 0),
  };
}

/**
 * Calculate match score between parsed item and target.
 */
function calculateMatchScore(
  item: ParsedItem,
  target: { title: string; description: string | null; category: string | null }
): number {
  let score = 0;

  // Title matching (highest weight)
  const titleScore = calculateStringSimilarity(item.name, target.title);
  score += titleScore * 60; // 60% weight for title

  // Description matching
  if (item.description && target.description) {
    const descScore = calculateStringSimilarity(item.description, target.description);
    score += descScore * 20; // 20% weight for description
  }

  // Category matching
  if (item.category && target.category) {
    const catScore = calculateStringSimilarity(item.category, target.category);
    score += catScore * 20; // 20% weight for category
  }

  return Math.round(score);
}

/**
 * Calculate string similarity score (0-1).
 * Uses a combination of exact match, contains check, and word overlap.
 */
function calculateStringSimilarity(str1: string, str2: string): number {
  const s1 = normalizeString(str1);
  const s2 = normalizeString(str2);

  // Exact match
  if (s1 === s2) return 1;

  // One contains the other
  if (s1.includes(s2) || s2.includes(s1)) {
    const minLen = Math.min(s1.length, s2.length);
    const maxLen = Math.max(s1.length, s2.length);
    return minLen / maxLen;
  }

  // Word overlap (Jaccard similarity)
  const words1 = new Set(s1.split(/\s+/).filter(Boolean));
  const words2 = new Set(s2.split(/\s+/).filter(Boolean));

  const intersection = new Set([...words1].filter((w) => words2.has(w)));
  const union = new Set([...words1, ...words2]);

  if (union.size === 0) return 0;

  const jaccard = intersection.size / union.size;

  // Also check for partial word matches (e.g., "botox" matches "botulinum")
  let partialMatches = 0;
  for (const w1 of words1) {
    for (const w2 of words2) {
      if ((w1.length >= 3 && w2.startsWith(w1)) || (w2.length >= 3 && w1.startsWith(w2))) {
        partialMatches++;
      }
    }
  }

  const partialScore = partialMatches / Math.max(words1.size, words2.size);

  return Math.max(jaccard, partialScore * 0.8);
}

/**
 * Normalize string for comparison.
 */
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Get which fields contributed to the match.
 */
function getMatchedFields(
  item: ParsedItem,
  title: string,
  description: string | null,
  category: string | null
): string[] {
  const fields: string[] = [];

  if (calculateStringSimilarity(item.name, title) > 0.3) {
    fields.push('title');
  }
  if (item.description && description && calculateStringSimilarity(item.description, description) > 0.3) {
    fields.push('description');
  }
  if (item.category && category && calculateStringSimilarity(item.category, category) > 0.3) {
    fields.push('category');
  }

  return fields;
}

/**
 * Get confidence level based on score.
 */
function getConfidenceLevel(score: number): 'high' | 'medium' | 'low' | 'none' {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  if (score > 0) return 'low';
  return 'none';
}

/**
 * Get confidence color for UI.
 */
export function getConfidenceColor(confidence: 'high' | 'medium' | 'low' | 'none'): string {
  switch (confidence) {
    case 'high':
      return 'success';
    case 'medium':
      return 'warning';
    case 'low':
      return 'error';
    case 'none':
      return 'default';
  }
}

/**
 * Get confidence label for UI.
 */
export function getConfidenceLabel(confidence: 'high' | 'medium' | 'low' | 'none'): string {
  switch (confidence) {
    case 'high':
      return 'High Match';
    case 'medium':
      return 'Possible Match';
    case 'low':
      return 'Weak Match';
    case 'none':
      return 'No Match';
  }
}
