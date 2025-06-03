import type { FhirResource, QuestionnaireResponse } from 'fhir/r4';
import type { TemplateExtractPathJsObject } from '../interfaces';
import type { TemplateDetails } from '../interfaces/templateExtractPath.interface';
import { parametersIsFhirPatch } from './typePredicates';
import { populateIntoTemplates } from './populateIntoTemplates';
import type { InputParameters } from '../interfaces/inputParameters.interface';
import { getComparisonSourceResponse } from './getComparisonSourceResponse';

/**
 * Filters the extracted FHIR resources by removing unchanged or empty resources.
 *
 * It supports two filtering criteria:
 * 1. **FHIRPatch validity filtering**: For PATCH-type Parameters resources, only include them if they contain a  `value[x]` field in the "value" part.
 * 2. **Comparison-based filtering**: If a `comparison-source-response` is provided via `inputParameters`, ensure only modified resources are included in the resulting bundle for submission (e.g., PUT or PATCH)
 *
 */
export function filterResources(
  extractedResourceMap: Map<string, FhirResource[]>,
  containedTemplateMap: Map<string, TemplateDetails>,
  templateIdToExtractPaths: Record<string, Record<string, TemplateExtractPathJsObject>[]>,
  fhirPathContext: Record<string, any>,
  inputParameters: InputParameters | QuestionnaireResponse
): Map<string, FhirResource[]> {
  // If a comparison-source-response is provided, use it for comparisons during the filtering process
  // We run another evaluation + populate step, but for comparisonSourceResponse to generate a comparisonResourceMap
  const comparisonSourceResponse = getComparisonSourceResponse(inputParameters);
  let comparisonResourceMap: Map<string, FhirResource[]> | null = null;
  if (comparisonSourceResponse) {
    comparisonResourceMap = populateIntoTemplates(
      comparisonSourceResponse,
      containedTemplateMap,
      fhirPathContext
    ).extractedResourceMap;
  }

  // Run filtering procedure on extracted resources
  for (const [templateId] of containedTemplateMap.entries()) {
    const extractPathsByTemplateId = templateIdToExtractPaths[templateId];

    const extractedResources = extractedResourceMap.get(templateId);
    const comparisonResources = comparisonResourceMap?.get(templateId);
    if (!extractedResources || extractedResources.length === 0 || !extractPathsByTemplateId) {
      continue;
    }

    const filteredResources: FhirResource[] = [];
    for (let i = 0; i < extractedResources.length; i++) {
      const extractedResource = extractedResources[i];
      const comparisonResource = comparisonResources?.[i];
      if (!extractedResource) {
        continue;
      }

      // If the resource is a FHIRPatch Parameters resource, we need to filter it based on the value[x] part
      if (
        extractedResource.resourceType === 'Parameters' &&
        parametersIsFhirPatch(extractedResource)
      ) {
        // First filter criteria: FHIRPatch "value" part contains a valid value[x], include it in bundle
        const operationParam = extractedResource.parameter.find(
          (param) => param.name === 'operation'
        );
        const patchValueParam = operationParam?.part.find((part) => part.name === 'value');
        if (fhirPatchValueIsEmpty(patchValueParam)) {
          continue;
        }
      }

      // Second filter criteria: IF comparisonResource is provided, check if answers have changed between the pre-populated QR and the final QR
      if (comparisonResource) {
        // Compare the extracted resource with the comparison resource
        // If they are equal, nothing has changed, so we skip it
        const resourcesAreEqual =
          JSON.stringify(extractedResource) === JSON.stringify(comparisonResource);
        if (resourcesAreEqual) {
          continue;
        }
      }

      // Resource pass all filter criteria, include it in bundle
      filteredResources.push(extractedResource);
    }

    // Update extractedResourceMap with filtered resources
    extractedResourceMap.set(templateId, filteredResources);
  }

  return extractedResourceMap;
}

function fhirPatchValueIsEmpty(
  patchValueParam: { name: 'value'; [key: string]: unknown } | undefined
): boolean {
  // FHIRPatch "value" part not present
  if (!patchValueParam) {
    return true;
  }

  // FHIRPatch "value" part only has one key - meaning value[x] not present, which means the QR item doesn't have an answer
  return Object.keys(patchValueParam).length === 1;
}
