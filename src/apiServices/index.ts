export { client } from './client';
export { runsApi } from './runs.api';
export { opportunitiesApi } from './opportunities.api';
export { agentsApi } from './agents.api';
export { transcriptsApi } from './transcripts.api';
export { practicesApi } from './practices.api';
export { promptsApi } from './prompts.api';
export type * from './types';

// Practice Library - use explicit exports to avoid conflicts with ./types
export * as practiceLibraryApi from './practiceLibrary';
export type {
  PLService,
  PLProduct,
  PLPackage,
  PLPackageItem,
  PLConcern,
  PLAnatomyArea,
  PLVisitChecklist,
  PLSuggestionRule,
  ListOfItems,
  PracticeConfigLevel,
  CreatePLServicePayload,
  UpdatePLServicePayload,
  CreatePLProductPayload,
  UpdatePLProductPayload,
  CreatePLPackagePayload,
  UpdatePLPackagePayload,
  CreatePLConcernPayload,
  UpdatePLConcernPayload,
} from './practiceLibrary/types';
// Re-export Practice and VisitType from practiceLibrary with aliases to avoid conflicts
export type { Practice as PLPractice, VisitType as PLVisitType } from './practiceLibrary/types';
export { GLOBAL_LIBRARY_PRACTICE, GLOBAL_LIBRARY_ID, getApiPracticeId, isGlobalLibrary } from './practiceLibrary/types';
