/**
 * Practice Configuration Export Utility
 *
 * Generates Markdown content from practice configuration for AI prompt injection.
 */

import {
  globalAnatomyAreas,
  globalConcerns,
  getAnatomyAreaById,
  getConcernById,
  anatomyRegionLabels,
  concernCategoryLabels,
  type AnatomyRegion,
  type ConcernCategory,
} from 'data/anatomyAndConcerns';
import type { PracticeConfiguration } from 'stores/practiceLibraryStore/types';
import type { Practice } from 'apiServices/practiceLibrary/types';

export function generatePracticeConfigMD(
  practice: Practice,
  config: PracticeConfiguration
): string {
  const selectedAreas = config.selectedAnatomyAreas
    .map((id) => getAnatomyAreaById(id))
    .filter((area): area is NonNullable<typeof area> => area !== undefined);

  const selectedConcerns = config.selectedConcerns
    .map((id) => getConcernById(id))
    .filter((concern): concern is NonNullable<typeof concern> => concern !== undefined);

  const faceAreas = selectedAreas.filter((a) => a.region === 'face');
  const bodyAreas = selectedAreas.filter((a) => a.region === 'body');
  const skinAreas = selectedAreas.filter((a) => a.region === 'skin');

  const agingConcerns = selectedConcerns.filter((c) => c.category === 'aging');
  const skinQualityConcerns = selectedConcerns.filter((c) => c.category === 'skin_quality');
  const pigmentationConcerns = selectedConcerns.filter((c) => c.category === 'pigmentation');
  const vascularConcerns = selectedConcerns.filter((c) => c.category === 'vascular');
  const bodyContouringConcerns = selectedConcerns.filter((c) => c.category === 'body_contouring');
  const hairConcerns = selectedConcerns.filter((c) => c.category === 'hair');

  const sections: string[] = [];

  // Header
  sections.push(`# ${practice.name} - Treatment Configuration`);
  sections.push('');
  sections.push('This document defines the standardized anatomy areas and patient concerns for this practice.');
  sections.push('Use this vocabulary for consistent AI outputs.');
  sections.push('');

  // Anatomy Areas Section
  sections.push('## Anatomy Areas We Treat');
  sections.push('');

  if (faceAreas.length > 0) {
    sections.push('### Face');
    faceAreas.forEach((area) => {
      sections.push(`- **${area.name}**`);
      if (area.subAreas && area.subAreas.length > 0) {
        sections.push(`  - Sub-areas: ${area.subAreas.join(', ')}`);
      }
    });
    sections.push('');
  }

  if (bodyAreas.length > 0) {
    sections.push('### Body');
    bodyAreas.forEach((area) => {
      sections.push(`- **${area.name}**`);
      if (area.subAreas && area.subAreas.length > 0) {
        sections.push(`  - Sub-areas: ${area.subAreas.join(', ')}`);
      }
    });
    sections.push('');
  }

  if (skinAreas.length > 0) {
    sections.push('### Skin');
    skinAreas.forEach((area) => {
      sections.push(`- **${area.name}**`);
      if (area.subAreas && area.subAreas.length > 0) {
        sections.push(`  - Sub-areas: ${area.subAreas.join(', ')}`);
      }
    });
    sections.push('');
  }

  // Custom anatomy areas
  if (config.customAnatomyAreas.length > 0) {
    sections.push('### Custom Areas');
    config.customAnatomyAreas.forEach((area) => {
      sections.push(`- ${area}`);
    });
    sections.push('');
  }

  // Concerns Section
  sections.push('## Patient Concerns We Address');
  sections.push('');

  if (agingConcerns.length > 0) {
    sections.push('### Aging Concerns');
    agingConcerns.forEach((concern) => {
      sections.push(`- **${concern.name}**: ${concern.description}`);
    });
    sections.push('');
  }

  if (skinQualityConcerns.length > 0) {
    sections.push('### Skin Quality');
    skinQualityConcerns.forEach((concern) => {
      sections.push(`- **${concern.name}**: ${concern.description}`);
    });
    sections.push('');
  }

  if (pigmentationConcerns.length > 0) {
    sections.push('### Pigmentation');
    pigmentationConcerns.forEach((concern) => {
      sections.push(`- **${concern.name}**: ${concern.description}`);
    });
    sections.push('');
  }

  if (vascularConcerns.length > 0) {
    sections.push('### Vascular');
    vascularConcerns.forEach((concern) => {
      sections.push(`- **${concern.name}**: ${concern.description}`);
    });
    sections.push('');
  }

  if (bodyContouringConcerns.length > 0) {
    sections.push('### Body Contouring');
    bodyContouringConcerns.forEach((concern) => {
      sections.push(`- **${concern.name}**: ${concern.description}`);
    });
    sections.push('');
  }

  if (hairConcerns.length > 0) {
    sections.push('### Hair');
    hairConcerns.forEach((concern) => {
      sections.push(`- **${concern.name}**: ${concern.description}`);
    });
    sections.push('');
  }

  // Custom concerns
  if (config.customConcerns.length > 0) {
    sections.push('### Custom Concerns');
    config.customConcerns.forEach((concern) => {
      sections.push(`- ${concern}`);
    });
    sections.push('');
  }

  // Vocabulary Mapping Section
  sections.push('## Vocabulary Mapping');
  sections.push('');
  sections.push('When extracting from transcripts or generating outputs, use these standard terms.');
  sections.push('Map common patient language to the official terminology:');
  sections.push('');

  // Anatomy area aliases
  const areaAliases = selectedAreas
    .filter((a) => a.aliases.length > 0)
    .flatMap((a) => a.aliases.map((alias) => ({ alias, name: a.name })));

  if (areaAliases.length > 0) {
    sections.push('### Anatomy Aliases');
    sections.push('| Patient Says | Map To |');
    sections.push('|--------------|--------|');
    areaAliases.forEach(({ alias, name }) => {
      sections.push(`| "${alias}" | ${name} |`);
    });
    sections.push('');
  }

  // Concern aliases
  const concernAliases = selectedConcerns
    .filter((c) => c.aliases.length > 0)
    .flatMap((c) => c.aliases.map((alias) => ({ alias, name: c.name })));

  if (concernAliases.length > 0) {
    sections.push('### Concern Aliases');
    sections.push('| Patient Says | Map To |');
    sections.push('|--------------|--------|');
    concernAliases.forEach(({ alias, name }) => {
      sections.push(`| "${alias}" | ${name} |`);
    });
    sections.push('');
  }

  // Related Areas Section
  sections.push('## Concern-Area Relationships');
  sections.push('');
  sections.push('These concerns typically affect these anatomy areas:');
  sections.push('');

  selectedConcerns
    .filter((c) => c.relatedAreas.length > 0)
    .forEach((concern) => {
      const relatedAreaNames = concern.relatedAreas
        .map((areaId) => getAnatomyAreaById(areaId)?.name || areaId)
        .join(', ');
      sections.push(`- **${concern.name}**: ${relatedAreaNames}`);
    });

  sections.push('');
  sections.push('---');
  sections.push(`*Generated for ${practice.name}*`);

  return sections.join('\n');
}

export function generatePracticeConfigJSON(
  practice: Practice,
  config: PracticeConfiguration
): object {
  const selectedAreas = config.selectedAnatomyAreas
    .map((id) => getAnatomyAreaById(id))
    .filter((area): area is NonNullable<typeof area> => area !== undefined);

  const selectedConcerns = config.selectedConcerns
    .map((id) => getConcernById(id))
    .filter((concern): concern is NonNullable<typeof concern> => concern !== undefined);

  return {
    practice_name: practice.name,
    practice_id: practice.id,
    anatomy_areas: {
      face: selectedAreas
        .filter((a) => a.region === 'face')
        .map((a) => ({ name: a.name, sub_areas: a.subAreas || [], aliases: a.aliases })),
      body: selectedAreas
        .filter((a) => a.region === 'body')
        .map((a) => ({ name: a.name, sub_areas: a.subAreas || [], aliases: a.aliases })),
      skin: selectedAreas
        .filter((a) => a.region === 'skin')
        .map((a) => ({ name: a.name, sub_areas: a.subAreas || [], aliases: a.aliases })),
      custom: config.customAnatomyAreas,
    },
    concerns: {
      aging: selectedConcerns
        .filter((c) => c.category === 'aging')
        .map((c) => ({ name: c.name, description: c.description, aliases: c.aliases })),
      skin_quality: selectedConcerns
        .filter((c) => c.category === 'skin_quality')
        .map((c) => ({ name: c.name, description: c.description, aliases: c.aliases })),
      pigmentation: selectedConcerns
        .filter((c) => c.category === 'pigmentation')
        .map((c) => ({ name: c.name, description: c.description, aliases: c.aliases })),
      vascular: selectedConcerns
        .filter((c) => c.category === 'vascular')
        .map((c) => ({ name: c.name, description: c.description, aliases: c.aliases })),
      body_contouring: selectedConcerns
        .filter((c) => c.category === 'body_contouring')
        .map((c) => ({ name: c.name, description: c.description, aliases: c.aliases })),
      hair: selectedConcerns
        .filter((c) => c.category === 'hair')
        .map((c) => ({ name: c.name, description: c.description, aliases: c.aliases })),
      custom: config.customConcerns,
    },
  };
}
