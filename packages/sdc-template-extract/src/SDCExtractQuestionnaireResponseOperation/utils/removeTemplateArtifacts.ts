import {
  removeTemplateExtractContextExtension,
  removeTemplateExtractValueExtension
} from './templateInsert';
import type { TemplateExtractValueEvaluation } from '../interfaces';
import type { FhirResource } from 'fhir/r4';

export function removeTemplateArtifacts(
  entryPath: string,
  contextPath: string | null,
  valuePathMap: Map<string, TemplateExtractValueEvaluation>,
  templateToMutate: FhirResource
) {
  for (const [valuePath] of valuePathMap.entries()) {
    removeTemplateExtractValueExtension(entryPath, valuePath, templateToMutate);
  }

  if (contextPath) {
    removeTemplateExtractContextExtension(entryPath, contextPath, templateToMutate);
  }
}
