/**
 * Local Prompt File Server
 *
 * Simple Express server to read/write prompt files from local disk.
 * Run with: npx ts-node server/prompt-server.ts
 */

import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';

const app = express();
const PORT = 3001;

// CORS for local development
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Base paths for prompt files
const PROMPT_PATHS = {
  primary: 'C:/Users/Chris/Dropbox/NewCO/Intelligence Extraction/HITL-TCP-Project/prompts',
  conversational: 'C:/Users/Chris/Dropbox/NewCO/A360 - CORE DOCUMENTS/Conversational Intelligence',
  reach: 'C:/Users/Chris/Dropbox/NewCO/A360 - CORE DOCUMENTS/06_A360_Reach',
};

// Prompt metadata (maps slug to file info)
const PROMPT_REGISTRY: Record<string, { name: string; category: string; path: string; description: string }> = {
  'v3-pass-1': {
    name: 'V3 Pass 1: Context & Offerings',
    category: 'extraction',
    path: 'primary/v3_pass_1_context_offerings.md',
    description: 'Extracts visit context, patient goals, areas, interests, and offerings from consultation transcripts.',
  },
  'v3-pass-2': {
    name: 'V3 Pass 2: Outcome Intelligence',
    category: 'extraction',
    path: 'primary/v3_pass_2_outcome_intelligence.md',
    description: 'Extracts outcome, next steps, patient signals, objections, hesitations, concerns, and visit checklist.',
  },
  'v3-schema': {
    name: 'V3 Extraction Schema',
    category: 'system',
    path: 'primary/V3_EXTRACTION_SCHEMA.md',
    description: 'Complete schema definition for V3 extraction output.',
  },
  'hitl-verification': {
    name: 'HITL Verification Prompt',
    category: 'hitl',
    path: 'primary/v3_hitl_verification.md',
    description: 'Provider verification of extraction output before TCP generation.',
  },
  'tcp-current': {
    name: 'TCP Generation (Current)',
    category: 'tcp',
    path: 'primary/tcp_CURRENT_improved.md',
    description: 'Current production TCP generation prompt.',
  },
  'tcp-future-hitl': {
    name: 'TCP Generation (Future w/ HITL)',
    category: 'tcp',
    path: 'primary/tcp_FUTURE_with_hitl.md',
    description: 'Future TCP generation that uses HITL-verified data.',
  },
  'agent-objection': {
    name: 'Objection Response Agent',
    category: 'agents',
    path: 'primary/v3_agent_objection_response.md',
    description: 'Generates responses to patient objections.',
  },
  'agent-cross-sell': {
    name: 'Cross-Sell Guidance Agent',
    category: 'agents',
    path: 'primary/v3_agent_cross_sell_guidance.md',
    description: 'Provides cross-sell recommendations based on patient context.',
  },
};

/**
 * Resolve a path reference to an absolute path
 */
function resolvePromptPath(pathRef: string): string {
  const [baseName, ...rest] = pathRef.split('/');
  const baseDir = PROMPT_PATHS[baseName as keyof typeof PROMPT_PATHS];
  if (!baseDir) {
    throw new Error(`Unknown base path: ${baseName}`);
  }
  return path.join(baseDir, ...rest);
}

/**
 * GET /prompts - List all available prompts
 */
app.get('/prompts', async (_req, res) => {
  try {
    const prompts = await Promise.all(
      Object.entries(PROMPT_REGISTRY).map(async ([slug, meta]) => {
        const filePath = resolvePromptPath(meta.path);
        let exists = false;
        let lastModified: string | null = null;

        try {
          const stats = await fs.stat(filePath);
          exists = true;
          lastModified = stats.mtime.toISOString();
        } catch {
          exists = false;
        }

        return {
          slug,
          name: meta.name,
          category: meta.category,
          description: meta.description,
          path: meta.path,
          exists,
          lastModified,
        };
      })
    );

    res.json({ prompts, basePaths: PROMPT_PATHS });
  } catch (error) {
    console.error('Error listing prompts:', error);
    res.status(500).json({ error: 'Failed to list prompts' });
  }
});

/**
 * GET /prompts/:slug - Get a single prompt by slug
 */
app.get('/prompts/:slug', async (req, res) => {
  const { slug } = req.params;
  const meta = PROMPT_REGISTRY[slug];

  if (!meta) {
    return res.status(404).json({ error: `Prompt not found: ${slug}` });
  }

  try {
    const filePath = resolvePromptPath(meta.path);
    const content = await fs.readFile(filePath, 'utf-8');
    const stats = await fs.stat(filePath);

    res.json({
      slug,
      name: meta.name,
      category: meta.category,
      description: meta.description,
      path: meta.path,
      content,
      lastModified: stats.mtime.toISOString(),
      size: stats.size,
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return res.status(404).json({ error: `File not found: ${meta.path}` });
    }
    console.error('Error reading prompt:', error);
    res.status(500).json({ error: 'Failed to read prompt' });
  }
});

/**
 * PUT /prompts/:slug - Update a prompt
 */
app.put('/prompts/:slug', async (req, res) => {
  const { slug } = req.params;
  const { content } = req.body;

  if (!content || typeof content !== 'string') {
    return res.status(400).json({ error: 'Content is required' });
  }

  const meta = PROMPT_REGISTRY[slug];
  if (!meta) {
    return res.status(404).json({ error: `Prompt not found: ${slug}` });
  }

  try {
    const filePath = resolvePromptPath(meta.path);

    // Create backup before writing
    const backupPath = filePath + '.backup';
    try {
      const existingContent = await fs.readFile(filePath, 'utf-8');
      await fs.writeFile(backupPath, existingContent, 'utf-8');
    } catch {
      // File might not exist yet, that's OK
    }

    // Write new content
    await fs.writeFile(filePath, content, 'utf-8');
    const stats = await fs.stat(filePath);

    res.json({
      slug,
      name: meta.name,
      category: meta.category,
      description: meta.description,
      path: meta.path,
      content,
      lastModified: stats.mtime.toISOString(),
      size: stats.size,
      message: 'Prompt saved successfully',
    });
  } catch (error) {
    console.error('Error writing prompt:', error);
    res.status(500).json({ error: 'Failed to save prompt' });
  }
});

/**
 * POST /prompts/:slug/revert - Revert to backup
 */
app.post('/prompts/:slug/revert', async (req, res) => {
  const { slug } = req.params;
  const meta = PROMPT_REGISTRY[slug];

  if (!meta) {
    return res.status(404).json({ error: `Prompt not found: ${slug}` });
  }

  try {
    const filePath = resolvePromptPath(meta.path);
    const backupPath = filePath + '.backup';

    const backupContent = await fs.readFile(backupPath, 'utf-8');
    await fs.writeFile(filePath, backupContent, 'utf-8');

    res.json({ message: 'Reverted to backup', slug });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return res.status(404).json({ error: 'No backup found' });
    }
    console.error('Error reverting prompt:', error);
    res.status(500).json({ error: 'Failed to revert prompt' });
  }
});

/**
 * POST /prompts/scan - Scan directories for additional prompts
 */
app.post('/prompts/scan', async (req, res) => {
  const { directory } = req.body;
  const basePath = PROMPT_PATHS[directory as keyof typeof PROMPT_PATHS] || directory;

  try {
    const files = await fs.readdir(basePath);
    const mdFiles = files.filter((f) => f.endsWith('.md'));

    const scanned = await Promise.all(
      mdFiles.map(async (file) => {
        const filePath = path.join(basePath, file);
        const stats = await fs.stat(filePath);
        const content = await fs.readFile(filePath, 'utf-8');

        // Extract title from first heading
        const titleMatch = content.match(/^#\s+(.+)$/m);
        const title = titleMatch ? titleMatch[1] : file.replace('.md', '');

        return {
          file,
          title,
          path: filePath,
          size: stats.size,
          lastModified: stats.mtime.toISOString(),
        };
      })
    );

    res.json({ directory: basePath, files: scanned });
  } catch (error) {
    console.error('Error scanning directory:', error);
    res.status(500).json({ error: 'Failed to scan directory' });
  }
});

/**
 * GET /prompts/file - Read any file by path (for custom prompts)
 */
app.get('/prompts/file', async (req, res) => {
  const { path: filePath } = req.query;

  if (!filePath || typeof filePath !== 'string') {
    return res.status(400).json({ error: 'Path is required' });
  }

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const stats = await fs.stat(filePath);

    res.json({
      path: filePath,
      content,
      lastModified: stats.mtime.toISOString(),
      size: stats.size,
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return res.status(404).json({ error: `File not found: ${filePath}` });
    }
    console.error('Error reading file:', error);
    res.status(500).json({ error: 'Failed to read file' });
  }
});

/**
 * PUT /prompts/file - Write any file by path
 */
app.put('/prompts/file', async (req, res) => {
  const { path: filePath, content } = req.body;

  if (!filePath || typeof filePath !== 'string') {
    return res.status(400).json({ error: 'Path is required' });
  }

  if (!content || typeof content !== 'string') {
    return res.status(400).json({ error: 'Content is required' });
  }

  try {
    // Ensure directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });

    // Write file
    await fs.writeFile(filePath, content, 'utf-8');
    const stats = await fs.stat(filePath);

    res.json({
      path: filePath,
      lastModified: stats.mtime.toISOString(),
      size: stats.size,
      message: 'File saved successfully',
    });
  } catch (error) {
    console.error('Error writing file:', error);
    res.status(500).json({ error: 'Failed to write file' });
  }
});

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Prompt Server running at http://localhost:${PORT}`);
  console.log(`\nEndpoints:`);
  console.log(`  GET  /prompts          - List all prompts`);
  console.log(`  GET  /prompts/:slug    - Get prompt by slug`);
  console.log(`  PUT  /prompts/:slug    - Update prompt`);
  console.log(`  POST /prompts/scan     - Scan directory`);
  console.log(`  GET  /prompts/file     - Read file by path`);
  console.log(`  PUT  /prompts/file     - Write file by path`);
  console.log(`\nBase paths:`);
  Object.entries(PROMPT_PATHS).forEach(([key, path]) => {
    console.log(`  ${key}: ${path}`);
  });
  console.log('');
});
