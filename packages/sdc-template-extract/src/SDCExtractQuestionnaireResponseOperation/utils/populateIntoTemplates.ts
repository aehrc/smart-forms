import {
  TemplateDetails,
  TemplateExtractPathJsObject
} from '../interfaces/templateExtractPath.interface';
import { FhirResource, OperationOutcomeIssue, QuestionnaireResponse } from 'fhir/r4';
import { createTemplateExtractPathMap } from './templateExtractPath';
import { evaluateTemplateExtractPaths } from './evaluateTemplateExtractPath';
import { insertValuesToTemplate } from './templateInsert';
import { templateExtractPathMapToRecord } from './mapToRecord';

export function populateIntoTemplates(
  questionnaireResponse: QuestionnaireResponse,
  templateMap: Map<string, TemplateDetails>,
  extractAllocateIds: Record<string, string>
): {
  extractedResourceMap: Map<string, FhirResource>;
  populateIntoTemplateWarnings: OperationOutcomeIssue[];
  templateIdToExtractPaths: Record<string, Record<string, TemplateExtractPathJsObject>>;
} {
  const extractedResourceMap: Map<string, FhirResource> = new Map<string, FhirResource>();
  const combinedWalkTemplateWarnings: OperationOutcomeIssue[] = [];
  const dataEvaluationWarnings: OperationOutcomeIssue[] = [];
  const templateIdToExtractPaths: Record<string, Record<string, TemplateExtractPathJsObject>> = {};

  for (const [templateId, templateDetails] of templateMap.entries()) {
    const { templateResource, targetQRItemFhirPath } = templateDetails;

    // Builds a map of FHIRPath expressions for templateExtractContexts and templateExtractValues
    const { templateExtractPathMap, walkTemplateWarnings } = createTemplateExtractPathMap(
      templateId,
      templateResource
    );
    combinedWalkTemplateWarnings.push(...walkTemplateWarnings);
    templateIdToExtractPaths[templateId] = templateExtractPathMapToRecord(templateExtractPathMap);

    // Extract data from questionnaireResponse by evaluating templateExtractPaths
    for (const [, templateExtractPath] of templateExtractPathMap.entries()) {
      evaluateTemplateExtractPaths(
        questionnaireResponse,
        targetQRItemFhirPath,
        templateExtractPath,
        extractAllocateIds,
        dataEvaluationWarnings
      );
    }

    // Insert evaluated values into templates to get complete resources
    const extractResource = insertValuesToTemplate(templateResource, templateExtractPathMap);
    extractedResourceMap.set(templateId, extractResource);
  }

  return {
    extractedResourceMap,
    populateIntoTemplateWarnings: [...combinedWalkTemplateWarnings, ...dataEvaluationWarnings],
    templateIdToExtractPaths
  };
}
