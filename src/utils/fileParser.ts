/**
 * File Parser Utilities
 *
 * Parses uploaded files (JSON, CSV) into a standardized format
 * for matching against Global Library items.
 */

export interface ParsedItem {
  name: string;
  description?: string;
  category?: string;
  price?: number;
  rawText: string;
}

export interface ParseResult {
  success: boolean;
  items: ParsedItem[];
  error?: string;
}

/**
 * Parse JSON content into ParsedItem array.
 * Handles both array format and object with items/services/products keys.
 */
export function parseJSON(content: string): ParseResult {
  try {
    const data = JSON.parse(content);

    // Handle array format
    if (Array.isArray(data)) {
      return {
        success: true,
        items: data.map(normalizeItem),
      };
    }

    // Handle object with common keys
    const possibleArrayKeys = ['items', 'services', 'products', 'offerings', 'data'];
    for (const key of possibleArrayKeys) {
      if (Array.isArray(data[key])) {
        return {
          success: true,
          items: data[key].map(normalizeItem),
        };
      }
    }

    // Handle single object
    if (typeof data === 'object' && data !== null) {
      return {
        success: true,
        items: [normalizeItem(data)],
      };
    }

    return {
      success: false,
      items: [],
      error: 'Invalid JSON structure. Expected array or object with items.',
    };
  } catch (e) {
    return {
      success: false,
      items: [],
      error: `JSON parse error: ${e instanceof Error ? e.message : 'Unknown error'}`,
    };
  }
}

/**
 * Parse CSV content into ParsedItem array.
 * Expects header row with name, description, category, price columns.
 */
export function parseCSV(content: string): ParseResult {
  try {
    const lines = content.trim().split('\n');
    if (lines.length < 2) {
      return {
        success: false,
        items: [],
        error: 'CSV must have at least a header row and one data row.',
      };
    }

    // Parse header
    const headerLine = lines[0];
    if (!headerLine) {
      return { success: false, items: [], error: 'CSV header row is empty.' };
    }
    const header = parseCSVLine(headerLine);
    const nameIndex = findColumnIndex(header, ['name', 'title', 'service', 'product']);
    const descIndex = findColumnIndex(header, ['description', 'desc', 'details']);
    const categoryIndex = findColumnIndex(header, ['category', 'type', 'subcategory']);
    const priceIndex = findColumnIndex(header, ['price', 'cost', 'amount']);

    if (nameIndex === -1) {
      return {
        success: false,
        items: [],
        error: 'CSV must have a "name" or "title" column.',
      };
    }

    // Parse data rows
    const items: ParsedItem[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = (lines[i] ?? '').trim();
      if (!line) continue;

      const values = parseCSVLine(line);
      const name = values[nameIndex]?.trim();
      if (!name) continue;

      items.push({
        name,
        description: descIndex >= 0 ? values[descIndex]?.trim() : undefined,
        category: categoryIndex >= 0 ? values[categoryIndex]?.trim() : undefined,
        price: priceIndex >= 0 ? parsePrice(values[priceIndex]) : undefined,
        rawText: line,
      });
    }

    return {
      success: true,
      items,
    };
  } catch (e) {
    return {
      success: false,
      items: [],
      error: `CSV parse error: ${e instanceof Error ? e.message : 'Unknown error'}`,
    };
  }
}

/**
 * Parse a single CSV line, handling quoted values.
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());

  return values;
}

/**
 * Find column index by checking multiple possible names.
 */
function findColumnIndex(header: string[], possibleNames: string[]): number {
  const lowerHeader = header.map((h) => h.toLowerCase().trim());
  for (const name of possibleNames) {
    const index = lowerHeader.indexOf(name.toLowerCase());
    if (index >= 0) return index;
  }
  return -1;
}

/**
 * Parse a price string into a number.
 */
function parsePrice(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const cleaned = value.replace(/[$,]/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? undefined : num;
}

/**
 * Normalize an item from JSON into ParsedItem format.
 */
function normalizeItem(item: Record<string, unknown>): ParsedItem {
  const name =
    getString(item, 'name') ||
    getString(item, 'title') ||
    getString(item, 'service') ||
    getString(item, 'product') ||
    'Unnamed Item';

  return {
    name,
    description:
      getString(item, 'description') ||
      getString(item, 'desc') ||
      getString(item, 'details'),
    category:
      getString(item, 'category') ||
      getString(item, 'type') ||
      getString(item, 'subcategory'),
    price: getNumber(item, 'price') ?? getNumber(item, 'cost'),
    rawText: JSON.stringify(item),
  };
}

function getString(obj: Record<string, unknown>, key: string): string | undefined {
  const value = obj[key];
  return typeof value === 'string' ? value : undefined;
}

function getNumber(obj: Record<string, unknown>, key: string): number | undefined {
  const value = obj[key];
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const num = parseFloat(value.replace(/[$,]/g, ''));
    return isNaN(num) ? undefined : num;
  }
  return undefined;
}

/**
 * Parse file content based on file type.
 */
export function parseFile(content: string, fileName: string): ParseResult {
  const ext = fileName.toLowerCase().split('.').pop();

  switch (ext) {
    case 'json':
      return parseJSON(content);
    case 'csv':
      return parseCSV(content);
    default:
      return {
        success: false,
        items: [],
        error: `Unsupported file type: .${ext}. Please use JSON or CSV.`,
      };
  }
}

/**
 * Read a file and return its content as string.
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
