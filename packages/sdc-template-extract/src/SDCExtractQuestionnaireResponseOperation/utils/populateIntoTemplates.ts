import { TemplateDetails } from '../interfaces/templateExtractPath.interface';
import { FhirResource, OperationOutcomeIssue, QuestionnaireResponse } from 'fhir/r4';
import { createTemplateExtractPathMap } from './templateExtractPath';
import { evaluateTemplateExtractPaths } from './evaluateTemplateExtractPath';
import { insertValuesToTemplate } from './templateInsert';

export function populateIntoTemplates(
  questionnaireResponse: QuestionnaireResponse,
  templateMap: Map<string, TemplateDetails>,
  extractAllocateIds: Record<string, string>
): Map<string, FhirResource> {
  const extractedResourceMap: Map<string, FhirResource> = new Map<string, FhirResource>();
  const populateIntoTemplateWarnings: OperationOutcomeIssue[] = [];

  for (const [templateId, templateDetails] of templateMap.entries()) {
    const { templateResource, targetQRItemFhirPath } = templateDetails;

    // Builds a map of FHIRPath expressions for templateExtractContexts and templateExtractValues
    const { templateExtractPathMap, walkTemplateWarnings } = createTemplateExtractPathMap(
      templateId,
      templateResource
    );

    for (const [, templateExtractPath] of templateExtractPathMap.entries()) {
      evaluateTemplateExtractPaths(
        questionnaireResponse,
        targetQRItemFhirPath,
        templateExtractPath,
        extractAllocateIds,
        populateIntoTemplateWarnings
      );
    }

    const extractResource = insertValuesToTemplate(templateResource, templateExtractPathMap);
    extractedResourceMap.set(templateId, extractResource);
  }

  return extractedResourceMap;
}
