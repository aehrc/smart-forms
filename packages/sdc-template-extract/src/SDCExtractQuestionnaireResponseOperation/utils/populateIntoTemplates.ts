import type {
  TemplateDetails,
  TemplateExtractPathJsObject
} from '../interfaces/templateExtractPath.interface';
import type { FhirResource, OperationOutcomeIssue, QuestionnaireResponse } from 'fhir/r4';
import { createTemplateExtractPathMap } from './templateExtractPath';
import { evaluateAndInsertIntoPath } from './evaluateTemplateExtractPath';
import { templateExtractPathMapToRecord } from './mapToRecord';
import { addIndexToTargetPath, getNumberOfTemplateInstances } from './expressionManipulation';
import { removeTemplateArtifacts } from './removeTemplateArtifacts';
import type { EntryPathPosition } from '../interfaces/entryPathPosition.interface';
import { createInvalidWarningIssue } from './operationOutcome';

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
  const populateIntoTemplateWarnings: OperationOutcomeIssue[] = [];
  const templateIdToExtractPaths: Record<string, Record<string, TemplateExtractPathJsObject>[]> =
    {};

  // Iterate over each template e.g. patTemplate, AllergyIntoleranceTemplate
  for (const [templateId, templateDetails] of templateMap.entries()) {
    const { templateResource, targetQRItemFhirPath } = templateDetails;
    if (!targetQRItemFhirPath) {
      populateIntoTemplateWarnings.push(
        createInvalidWarningIssue(`Template ${templateId} does not have a target QR item FHIRPath.`)
      );
      continue;
    }

    // Step 1: Build a map of FHIRPath expressions for templateExtractContexts and templateExtractValues
    const { templateExtractPathMap, walkTemplateWarnings } = createTemplateExtractPathMap(
      templateId,
      templateResource
    );
    combinedWalkTemplateWarnings.push(...walkTemplateWarnings);
    templateIdToExtractPaths[templateId] = [];

    // Step 2: Get number of template instances for the target path
    const numberOfTemplateInstances = getNumberOfTemplateInstances(
      questionnaireResponse,
      targetQRItemFhirPath,
      populateIntoTemplateWarnings
    );

    // Iterate each matching QRItem instance (e.g., multiple allergy items)
    const extractedResourcesByTemplateId: FhirResource[] = [];
    const extractPathsByTemplateId: Record<string, TemplateExtractPathJsObject>[] = [];
    for (let i = 0; i < numberOfTemplateInstances; i++) {
      const templateExtractPathMapInstance = structuredClone(templateExtractPathMap);
      const targetQRItemFhirPathWithIndex = addIndexToTargetPath(targetQRItemFhirPath, i);

      // Step 3: Each new template instance should be deep copied to prevent mutating original template
      const templateToMutate = structuredClone(templateResource);

      // Step 4: Remove templateExtract artifacts from template instance e.g. templateExtractContext and templateExtractValue extensions
      const entryPathPositionMap: Map<string, EntryPathPosition[]> = new Map<
        string,
        EntryPathPosition[]
      >();
      for (const [entryPath, templateExtractPath] of templateExtractPathMapInstance.entries()) {
        const { contextPathTuple, valuePathMap } = templateExtractPath;
        const contextPath = contextPathTuple?.[0] ?? null;
        removeTemplateArtifacts(
          entryPath,
          contextPath,
          valuePathMap,
          templateToMutate,
          populateIntoTemplateWarnings
        );
      }

      // Step 5: Prepare a clean template for reading static template data
      const cleanTemplate = structuredClone(templateToMutate);

      // Step 6: Evaluate and populate each templateExtractPath e.g. AllergyIntolerance.code, AllergyIntolerance.note
      for (const [entryPath, templateExtractPath] of templateExtractPathMapInstance.entries()) {
        evaluateAndInsertIntoPath(
          questionnaireResponse,
          entryPath,
          templateExtractPath,
          targetQRItemFhirPathWithIndex,
          entryPathPositionMap,
          fhirPathContext,
          templateToMutate,
          cleanTemplate,
          populateIntoTemplateWarnings
        );
      }

      // Remove resource.id from templateToMutate
      // Refer https://build.fhir.org/ig/HL7/sdc/extraction.html#template-based-extraction step 4
      if (templateToMutate.id) {
        delete templateToMutate.id;
      }

      // Add extracted resource and templateExtractPathMap instances to their respective arrays
      extractedResourcesByTemplateId.push(templateToMutate);
      extractPathsByTemplateId.push(templateExtractPathMapToRecord(templateExtractPathMapInstance));
    }

    // Step 7: Collate extracted resources and templateExtractPathMap instances
    extractedResourceMap.set(templateId, extractedResourcesByTemplateId);
    templateIdToExtractPaths[templateId] = extractPathsByTemplateId;
  }

  return {
    extractedResourceMap,
    populateIntoTemplateWarnings: [
      ...combinedWalkTemplateWarnings,
      ...populateIntoTemplateWarnings
    ],
    templateIdToExtractPaths
  };
}
