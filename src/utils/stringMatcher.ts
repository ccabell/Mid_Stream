/**
 * String Matching Utilities
 *
 * Matches parsed items against Global Library services and products
 * using string similarity algorithms.
 *
 * Supports both:
 * - Legacy: globalLibrary.ts (manual entries)
 * - Unified: globalLibraryUnified.ts (Supabase + manual)
 */

import type { ParsedItem } from './fileParser';
import type { GlobalService, GlobalProduct } from 'data/globalLibrary';
import type { UnifiedGlobalItem } from 'data/globalLibraryUnified';

export interface MatchCandidate {
  type: 'service' | 'product';
  item: GlobalService | GlobalProduct | UnifiedGlobalItem;
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
  globalServices: GlobalService[],
  globalProducts: GlobalProduct[]
): MatchResult[] {
  return parsedItems.map((item) => findMatchesForItem(item, globalServices, globalProducts));
}

/**
 * Find matches for a single parsed item.
 */
function findMatchesForItem(
  item: ParsedItem,
  globalServices: GlobalService[],
  globalProducts: GlobalProduct[]
): MatchResult {
  const candidates: MatchCandidate[] = [];

  // Match against services
  for (const service of globalServices) {
    const score = calculateMatchScoreWithAliases(item, {
      name: service.name,
      description: service.description,
      category: service.category_code,
      aliases: service.aliases,
    });
    if (score > 0) {
      candidates.push({
        type: 'service',
        item: service,
        score,
        matchedOn: getMatchedFieldsWithAliases(
          item,
          service.name,
          service.description,
          service.category_code,
          service.aliases
        ),
      });
    }
  }

  // Match against products
  for (const product of globalProducts) {
    const score = calculateMatchScoreWithAliases(item, {
      name: product.name,
      description: product.description,
      category: product.category_code,
      aliases: product.aliases,
    });
    if (score > 0) {
      candidates.push({
        type: 'product',
        item: product,
        score,
        matchedOn: getMatchedFieldsWithAliases(
          item,
          product.name,
          product.description,
          product.category_code,
          product.aliases
        ),
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
 * Calculate match score between parsed item and target (with aliases support).
 */
function calculateMatchScoreWithAliases(
  item: ParsedItem,
  target: { name: string; description: string; category: string; aliases: string[] }
): number {
  let score = 0;

  // Name matching (highest weight)
  let nameScore = calculateStringSimilarity(item.name, target.name);

  // Also check aliases for better matching
  for (const alias of target.aliases) {
    const aliasScore = calculateStringSimilarity(item.name, alias);
    if (aliasScore > nameScore) {
      nameScore = aliasScore;
    }
  }
  score += nameScore * 50; // 50% weight for name/alias

  // Description matching
  if (item.description && target.description) {
    const descScore = calculateStringSimilarity(item.description, target.description);
    score += descScore * 20; // 20% weight for description
  }

  // Category matching
  if (item.category && target.category) {
    const catScore = calculateStringSimilarity(item.category, target.category);
    score += catScore * 15; // 15% weight for category
  }

  // Alias boost: if item name matches any alias exactly, boost score
  const normalizedName = normalizeString(item.name);
  for (const alias of target.aliases) {
    if (normalizeString(alias) === normalizedName) {
      score += 15; // 15% bonus for exact alias match
      break;
    }
  }

  return Math.round(Math.min(100, score));
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
 * Get which fields contributed to the match (with aliases support).
 */
function getMatchedFieldsWithAliases(
  item: ParsedItem,
  name: string,
  description: string,
  category: string,
  aliases: string[]
): string[] {
  const fields: string[] = [];

  // Check name match
  if (calculateStringSimilarity(item.name, name) > 0.3) {
    fields.push('name');
  }

  // Check alias matches
  for (const alias of aliases) {
    if (calculateStringSimilarity(item.name, alias) > 0.3) {
      fields.push('alias');
      break;
    }
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

// =============================================================================
// UNIFIED MATCHING (for globalLibraryUnified.ts)
// =============================================================================

/**
 * Find matches for all parsed items against unified global library.
 * This version works with UnifiedGlobalItem which may not have aliases.
 */
export function findMatchesUnified(
  parsedItems: ParsedItem[],
  unifiedServices: UnifiedGlobalItem[],
  unifiedProducts: UnifiedGlobalItem[]
): MatchResult[] {
  return parsedItems.map((item) => findMatchesForUnifiedItem(item, unifiedServices, unifiedProducts));
}

/**
 * Find matches for a single parsed item against unified items.
 */
function findMatchesForUnifiedItem(
  item: ParsedItem,
  unifiedServices: UnifiedGlobalItem[],
  unifiedProducts: UnifiedGlobalItem[]
): MatchResult {
  const candidates: MatchCandidate[] = [];

  // Match against services
  for (const service of unifiedServices) {
    const score = calculateUnifiedMatchScore(item, service);
    if (score > 0) {
      candidates.push({
        type: 'service',
        item: service,
        score,
        matchedOn: getUnifiedMatchedFields(item, service),
      });
    }
  }

  // Match against products
  for (const product of unifiedProducts) {
    const score = calculateUnifiedMatchScore(item, product);
    if (score > 0) {
      candidates.push({
        type: 'product',
        item: product,
        score,
        matchedOn: getUnifiedMatchedFields(item, product),
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
 * Calculate match score for unified items.
 * Handles items that may not have aliases (Supabase data).
 * Also matches on manufacturer and brand name.
 */
function calculateUnifiedMatchScore(item: ParsedItem, target: UnifiedGlobalItem): number {
  let score = 0;

  // Name matching (highest weight - 50%)
  let nameScore = calculateStringSimilarity(item.name, target.name);

  // Also check aliases for better matching (if available)
  if (target.aliases && target.aliases.length > 0) {
    for (const alias of target.aliases) {
      const aliasScore = calculateStringSimilarity(item.name, alias);
      if (aliasScore > nameScore) {
        nameScore = aliasScore;
      }
    }
  }
  score += nameScore * 50;

  // Manufacturer matching (15% weight) - important for Supabase data
  if (target.manufacturer) {
    const mfgScore = calculateStringSimilarity(item.name, target.manufacturer);
    score += mfgScore * 15;
  }

  // Brand name matching (10% weight)
  if (target.brandName) {
    const brandScore = calculateStringSimilarity(item.name, target.brandName);
    score += brandScore * 10;
  }

  // Description matching (15% weight)
  if (item.description && target.description) {
    const descScore = calculateStringSimilarity(item.description, target.description);
    score += descScore * 15;
  }

  // Category matching (10% weight)
  if (item.category && target.category) {
    const catScore = calculateStringSimilarity(item.category, target.category);
    score += catScore * 10;
  }

  // Exact alias match bonus
  if (target.aliases && target.aliases.length > 0) {
    const normalizedName = normalizeString(item.name);
    for (const alias of target.aliases) {
      if (normalizeString(alias) === normalizedName) {
        score += 10; // 10% bonus for exact alias match
        break;
      }
    }
  }

  return Math.round(Math.min(100, score));
}

/**
 * Get which fields contributed to the match for unified items.
 */
function getUnifiedMatchedFields(item: ParsedItem, target: UnifiedGlobalItem): string[] {
  const fields: string[] = [];

  // Check name match
  if (calculateStringSimilarity(item.name, target.name) > 0.3) {
    fields.push('name');
  }

  // Check manufacturer match
  if (target.manufacturer && calculateStringSimilarity(item.name, target.manufacturer) > 0.3) {
    fields.push('manufacturer');
  }

  // Check brand match
  if (target.brandName && calculateStringSimilarity(item.name, target.brandName) > 0.3) {
    fields.push('brand');
  }

  // Check alias matches
  if (target.aliases && target.aliases.length > 0) {
    for (const alias of target.aliases) {
      if (calculateStringSimilarity(item.name, alias) > 0.3) {
        fields.push('alias');
        break;
      }
    }
  }

  // Check description match
  if (item.description && target.description && calculateStringSimilarity(item.description, target.description) > 0.3) {
    fields.push('description');
  }

  // Check category match
  if (item.category && target.category && calculateStringSimilarity(item.category, target.category) > 0.3) {
    fields.push('category');
  }

  return fields;
}
