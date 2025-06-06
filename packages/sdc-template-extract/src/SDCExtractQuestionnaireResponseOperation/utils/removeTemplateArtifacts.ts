import {
  removeTemplateExtractContextExtension,
  removeTemplateExtractValueExtension
} from './templateInsert';
import type { TemplateExtractValueEvaluation } from '../interfaces';
import type { FhirResource, OperationOutcomeIssue } from 'fhir/r4';

export function removeTemplateArtifacts(
  entryPath: string,
  contextPath: string | null,
  valuePathMap: Map<string, TemplateExtractValueEvaluation>,
  templateToMutate: FhirResource,
  populateIntoTemplateWarnings: OperationOutcomeIssue[]
) {
  for (const [valuePath] of valuePathMap.entries()) {
    removeTemplateExtractValueExtension(
      entryPath,
      valuePath,
      templateToMutate,
      populateIntoTemplateWarnings
    );
  }

  if (contextPath) {
    removeTemplateExtractContextExtension(
      entryPath,
      contextPath,
      templateToMutate,
      populateIntoTemplateWarnings
    );
  }
}
