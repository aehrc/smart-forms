import type { TemplateExtractPathJsObjectTuple } from './templateExtractPath.interface';

export interface TemplateExtractDebugInfo {
  templateIdToExtractPathTuples: Record<string, TemplateExtractPathJsObjectTuple[]>;
}
