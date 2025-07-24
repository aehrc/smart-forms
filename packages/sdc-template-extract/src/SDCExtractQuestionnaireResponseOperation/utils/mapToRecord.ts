import type {
  TemplateExtractPath,
  TemplateExtractPathJsObject
} from '../interfaces/templateExtractPath.interface';

/**
 * Converts a Map<string, TemplateExtractPath> to a Record<string, templateExtractPathMapToRecord>,
 * Converting any nested valuePathMap from Map to plain object.
 */
export function templateExtractPathMapToRecord(
  templateExtractPathMap: Map<string, TemplateExtractPath>
): Record<string, TemplateExtractPathJsObject> {
  const templateExtractPaths: Record<string, TemplateExtractPathJsObject> = {};

  for (const [entryPath, templateExtractPath] of templateExtractPathMap.entries()) {
    templateExtractPaths[entryPath] = {
      contextPathTuple: templateExtractPath.contextPathTuple,
      valuePathMap: Object.fromEntries(templateExtractPath.valuePathMap) // convert inner Map to plain object
    };
  }

  return templateExtractPaths;
}
