import {
  TemplateDetails,
  TemplateExtractPathJsObject
} from '../interfaces/templateExtractPath.interface';
import type { FhirResource, OperationOutcomeIssue, QuestionnaireResponse } from 'fhir/r4';
import { createTemplateExtractPathMap } from './templateExtractPath';
import { evaluateTemplateExtractPaths } from './evaluateTemplateExtractPath';
import { insertValuesToTemplate } from './templateInsert';
import { templateExtractPathMapToRecord } from './mapToRecord';
import { addIndexToTargetPath, getNumberOfTargetInstances } from './expressionManipulation';

export function populateIntoTemplates(
  questionnaireResponse: QuestionnaireResponse,
  templateMap: Map<string, TemplateDetails>,
  extractAllocateIds: Record<string, string>
): {
  extractedResourceMap: Map<string, FhirResource[]>;
  populateIntoTemplateWarnings: OperationOutcomeIssue[];
  templateIdToExtractPaths: Record<string, Record<string, TemplateExtractPathJsObject>[]>;
} {
  const extractedResourceMap: Map<string, FhirResource[]> = new Map<string, FhirResource[]>();
  const combinedWalkTemplateWarnings: OperationOutcomeIssue[] = [];
  const dataEvaluationWarnings: OperationOutcomeIssue[] = [];
  const templateIdToExtractPaths: Record<string, Record<string, TemplateExtractPathJsObject>[]> =
    {};

  for (const [templateId, templateDetails] of templateMap.entries()) {
    const { templateResource, targetQRItemFhirPath } = templateDetails;

    // Builds a map of FHIRPath expressions for templateExtractContexts and templateExtractValues
    const { templateExtractPathMap, walkTemplateWarnings } = createTemplateExtractPathMap(
      templateId,
      templateResource
    );
    combinedWalkTemplateWarnings.push(...walkTemplateWarnings);
    templateIdToExtractPaths[templateId] = [];

    // Get number of instances for the target path
    const numberOfTargetInstances = getNumberOfTargetInstances(
      questionnaireResponse,
      targetQRItemFhirPath,
      dataEvaluationWarnings
    );

    // Evaluate template extract paths for each matching QRItem instance (e.g., multiple allergy items)
    const extractedResourcesByTemplateId: FhirResource[] = [];
    const extractPathsByTemplateId: Record<string, TemplateExtractPathJsObject>[] = [];
    for (let i = 0; i < numberOfTargetInstances; i++) {
      const templateExtractPathMapInstance = structuredClone(templateExtractPathMap);
      const targetQRItemFhirPathWithIndex = addIndexToTargetPath(targetQRItemFhirPath, i);

      // Evaluate each template extract path e.g. AllergyIntolerance.code, AllergyIntolerance.note
      for (const [, templateExtractPath] of templateExtractPathMapInstance.entries()) {
        evaluateTemplateExtractPaths(
          questionnaireResponse,
          targetQRItemFhirPathWithIndex,
          templateExtractPath,
          extractAllocateIds,
          dataEvaluationWarnings
        );
      }

      // Insert evaluated values into templates to get a complete resource instance
      const extractedResource = insertValuesToTemplate(
        templateResource,
        templateExtractPathMapInstance
      );

      // Add extracted resource and templateExtractPathMap instances to their respective arrays
      extractedResourcesByTemplateId.push(extractedResource);
      extractPathsByTemplateId.push(templateExtractPathMapToRecord(templateExtractPathMapInstance));
    }

    // Collate extracted resources and templateExtractPathMap instances
    extractedResourceMap.set(templateId, extractedResourcesByTemplateId);
    templateIdToExtractPaths[templateId] = extractPathsByTemplateId;
  }

  return {
    extractedResourceMap,
    populateIntoTemplateWarnings: [...combinedWalkTemplateWarnings, ...dataEvaluationWarnings],
    templateIdToExtractPaths
  };
}
