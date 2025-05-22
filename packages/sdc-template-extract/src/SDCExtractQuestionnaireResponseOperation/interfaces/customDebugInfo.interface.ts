import { TemplateExtractPathJsObject } from './templateExtractPath.interface';

export interface TemplateExtractDebugInfo {
  templateIdToExtractPaths: Record<string, Record<string, TemplateExtractPathJsObject>>;
}
