import type {
  TemplateDetails,
  TemplateExtractPathJsObject
} from '../interfaces/templateExtractPath.interface';
import type { FhirResource, OperationOutcomeIssue, QuestionnaireResponse } from 'fhir/r4';
import { createTemplateExtractPathMap } from './templateExtractPath';
import { evaluateAndInsertIntoPath } from './evaluateTemplateExtractPath';
import { templateExtractPathMapToRecord } from './mapToRecord';
import {
  addIndexToTargetPath,
  getNumberOfTemplateInstances,
  stripTrailingIndexFromPath
} from './expressionManipulation';
import { removeTemplateArtifacts } from './removeTemplateArtifacts';
import type { EntryPathPosition } from '../interfaces/entryPathPosition.interface';
import { createInvalidWarningIssue } from './operationOutcome';
import { parseFhirPath } from './parseFhirPath';
import { deleteObjectAtPath } from './templateInsert';

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

      // Tracks indices of templated elements for each base entry path which is an array
      // Used to delete these entries to create a clean template
      const templatedElementsIndicesMap: Map<string, number[]> = new Map<string, number[]>();

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

        const entryPathSegments = parseFhirPath(entryPath);
        const finalSegment = entryPathSegments[entryPathSegments.length - 1];
        if (typeof finalSegment === 'number') {
          // Path belongs to an array, add index to map for deletion to clean template later
          // (Paths not belonging to an array are already removed from the template in removeTemplateArtifacts)
          const baseEntryPath = stripTrailingIndexFromPath(entryPath);

          const baseEntryPathPositions = templatedElementsIndicesMap.get(baseEntryPath);
          if (baseEntryPathPositions) {
            baseEntryPathPositions.push(finalSegment);
          } else {
            templatedElementsIndicesMap.set(baseEntryPath, [finalSegment]);
          }
        }
      }

      // Step 5: Prepare a clean template for reading static template data
      const staticTemplate = structuredClone(templateToMutate);

      // Step 5a: Remove templated elements from arrays in templateToMutate based on entryPathIndexMap
      // (We keep these entries in staticTemplate to allow the static template to be read later, but delete them from templateToMutate to allow correct insertion of evaluated values)
      for (const [baseEntryPath, indices] of templatedElementsIndicesMap.entries()) {
        // Sort indices in descending order to prevent index shifting during deletion
        indices.sort((a, b) => b - a);
        for (const index of indices) {
          const entryPathWithIndex = `${baseEntryPath}[${index}]`;
          deleteObjectAtPath(
            templateToMutate,
            entryPathWithIndex,
            parseFhirPath(entryPathWithIndex)
          );
        }
      }

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
          staticTemplate,
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
