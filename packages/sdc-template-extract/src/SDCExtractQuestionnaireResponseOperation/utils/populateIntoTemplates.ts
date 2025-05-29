import type {
  TemplateDetails,
  TemplateExtractPathJsObject
} from '../interfaces/templateExtractPath.interface';
import type { FhirResource, OperationOutcomeIssue, QuestionnaireResponse } from 'fhir/r4';
import { createTemplateExtractPathMap } from './templateExtractPath';
import {
  evaluateAndInsertWithContext,
  evaluateAndInsertWithoutContext
} from './evaluateTemplateExtractPath';
import { templateExtractPathMapToRecord } from './mapToRecord';
import {
  addIndexToTargetPath,
  getCombinedExpression,
  getNumberOfTemplateInstances
} from './expressionManipulation';
import { removeTemplateArtifacts } from './removeTemplateArtifacts';

export function populateIntoTemplates(
  questionnaireResponse: QuestionnaireResponse,
  templateMap: Map<string, TemplateDetails>,
  fhirPathContext: Record<string, any>
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

  // Iterate over each template
  for (const [templateId, templateDetails] of templateMap.entries()) {
    const { templateResource, targetQRItemFhirPath } = templateDetails;

    // Builds a map of FHIRPath expressions for templateExtractContexts and templateExtractValues
    const { templateExtractPathMap, walkTemplateWarnings } = createTemplateExtractPathMap(
      templateId,
      templateResource
    );
    combinedWalkTemplateWarnings.push(...walkTemplateWarnings);
    templateIdToExtractPaths[templateId] = [];

    // Get number of template instances for the target path
    const numberOfTemplateInstances = getNumberOfTemplateInstances(
      questionnaireResponse,
      targetQRItemFhirPath,
      dataEvaluationWarnings
    );

    // Evaluate template extract paths for each matching QRItem instance (e.g., multiple allergy items)
    const extractedResourcesByTemplateId: FhirResource[] = [];
    const extractPathsByTemplateId: Record<string, TemplateExtractPathJsObject>[] = [];
    for (let i = 0; i < numberOfTemplateInstances; i++) {
      const templateExtractPathMapInstance = structuredClone(templateExtractPathMap);
      const targetQRItemFhirPathWithIndex = addIndexToTargetPath(targetQRItemFhirPath, i);

      // Evaluate and populate each template extract path e.g. AllergyIntolerance.code, AllergyIntolerance.note
      const templateToMutate = structuredClone(templateResource); // Deep copy the template
      for (const [entryPath, templateExtractPath] of templateExtractPathMapInstance.entries()) {
        const { contextPathTuple, valuePathMap } = templateExtractPath;
        const contextPath = contextPathTuple?.[0] ?? null;
        const contextExpression = contextPathTuple?.[1].contextExpression ?? null;

        // Remove templateExtract artifacts from template e.g. templateExtractContext and templateExtractValue extensions
        removeTemplateArtifacts(entryPath, contextPath, valuePathMap, templateToMutate);

        // Context path exists, use contextExpression to frame evaluation scope
        if (contextExpression) {
          const combinedContextPath = getCombinedExpression(
            targetQRItemFhirPathWithIndex,
            contextExpression
          );
          evaluateAndInsertWithContext(
            questionnaireResponse,
            entryPath,
            combinedContextPath,
            valuePathMap,
            fhirPathContext,
            templateToMutate,
            dataEvaluationWarnings
          );
          continue;
        }

        // At this point context path doesn't exist, evaluate each valueExpression directly without context
        evaluateAndInsertWithoutContext(
          questionnaireResponse,
          entryPath,
          targetQRItemFhirPathWithIndex,
          valuePathMap,
          fhirPathContext,
          templateToMutate,
          dataEvaluationWarnings
        );
      }

      // Remove resource.id from mutatedTemplate
      // Refer https://build.fhir.org/ig/HL7/sdc/extraction.html#template-based-extraction step 4
      if (templateToMutate.id) {
        delete templateToMutate.id;
      }

      // Add extracted resource and templateExtractPathMap instances to their respective arrays
      extractedResourcesByTemplateId.push(templateToMutate);
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
