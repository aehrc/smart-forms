import type { Bundle, FhirResource, OperationOutcomeIssue, QuestionnaireResponse } from 'fhir/r4';
import type {
  FhirPathEvalResult,
  TemplateDetails,
  TemplateExtractPathJsObject,
  TemplateExtractPathJsObjectTuple
} from '../interfaces/templateExtractPath.interface';
import { fhirPathEvaluate } from './fhirpathEvaluate';
import { v4 as uuidv4 } from 'uuid';
import cleanDeep from 'clean-deep';
import { parametersIsFhirPatch } from './typePredicates';
import type { BundleRequestType } from '../interfaces/bundle.interface';
import { addIndexToTargetPath } from './expressionManipulation';
import { applyFilters } from './filterResources';

/**
 * Builds a FHIR transaction Bundle from extracted resources using the templateExtract extension.
 * If a resource has an ID, it's treated as an update (PUT); otherwise, it's treated as a create (POST).
 * The resulting Bundle includes properly populated fullUrl, request.method, request.url, and optional request metadata.
 *
 * @param extractedResourceMap - Map of template IDs to extracted FHIR resources.
 * @param comparisonResourceMap - Map of template IDs to comparison FHIR resources, if available. Used for filtering out unchanged resources.
 * @param containedTemplateMap - Map of template IDs to TemplateDetails including templateExtract metadata.
 * @param templateIdToExtractPaths - Map of template IDs to their respective TemplateExtractPathJsObject. We inject fullUrl in this function to help debugging.
 * @param fhirPathContext - FHIRPath context object that acts as envVars for fhirpath.evaluate
 * @param questionnaireResponse - The QuestionnaireResponse resource that contains the answers to be extracted.
 * @returns {Bundle} - A FHIR transaction Bundle containing all extracted resources with appropriate request entries.
 */
export function buildTransactionBundle(
  extractedResourceMap: Map<string, FhirResource[]>,
  comparisonResourceMap: Map<string, FhirResource[]> | null,
  containedTemplateMap: Map<string, TemplateDetails>,
  templateIdToExtractPaths: Record<string, Record<string, TemplateExtractPathJsObject>[]>,
  fhirPathContext: Record<string, string>,
  questionnaireResponse: QuestionnaireResponse
): {
  outputBundle: Bundle;
  templateIdToExtractPathTuples: Record<string, TemplateExtractPathJsObjectTuple[]>;
} {
  const templateIdToExtractPathTuples: Record<string, TemplateExtractPathJsObjectTuple[]> = {};
  const buildBundleWarnings: OperationOutcomeIssue[] = [];

  const bundle: Bundle = {
    resourceType: 'Bundle',
    id: `sdc-template-extract-${generateShortId()}`,
    meta: {
      tag: [
        {
          code: '@aehrc/sdc-template-extract:generated',
          system: 'urn:aehrc:sdc-template-extract'
        }
      ]
    },
    type: 'transaction',
    timestamp: new Date().toISOString(),
    entry: []
  };

  // Type guard for Bundle.entry
  if (bundle.entry === undefined) {
    return { outputBundle: bundle, templateIdToExtractPathTuples: templateIdToExtractPathTuples };
  }

  // Add entries to the bundle from the extracted resources
  for (const [templateId, templateDetails] of containedTemplateMap.entries()) {
    const { templateExtractReference, targetQRItemFhirPath } = templateDetails;

    const extractPathsByTemplateId = templateIdToExtractPaths[templateId];

    const extractedResources = extractedResourceMap.get(templateId);
    const comparisonResources = comparisonResourceMap?.get(templateId);
    if (!extractedResources || extractedResources.length === 0 || !extractPathsByTemplateId) {
      continue;
    }

    // Iterate over each extracted resource for the current template
    const templateExtractPathTuples: TemplateExtractPathJsObjectTuple[] = [];
    for (let i = 0; i < extractedResources.length; i++) {
      const extractedResource = extractedResources[i];
      const comparisonResource = comparisonResources?.[i];
      if (!extractedResource) {
        continue;
      }

      // Filter resources (or parameter entries if the resource is a Parameters) based on two criteria:
      // 1. Ensure FHIRPatch "value" part has value[x] field.
      // 2. If a comparison-source-response (i.e. a pre-populated questionnaireResponse) is provided, only include changes compared to that response.
      const retainedResource = applyFilters(extractedResource, comparisonResource ?? null);
      if (!retainedResource) {
        continue;
      }

      // Clean extracted resource
      const cleanedRetainedResource = cleanDeep(retainedResource, {
        emptyObjects: true,
        emptyArrays: true,
        nullValues: true,
        undefinedValues: true
      }) as FhirResource;

      // Create context scope from QR where the "templateExtract" extension is defined for downstream FHIRPath evaluation
      const contextScopeResult = createTemplateExtractContextScope(
        questionnaireResponse,
        targetQRItemFhirPath,
        i,
        fhirPathContext,
        buildBundleWarnings
      );

      // resourceId
      const resourceId = getResourceId(
        contextScopeResult,
        fhirPathContext,
        buildBundleWarnings,
        templateExtractReference.resourceId
      );
      const resourceType = cleanedRetainedResource.resourceType;
      const hasResourceId = typeof resourceId === 'string' && resourceId !== '';

      // PatchRequestUrl
      const patchRequestUrl = getPatchRequestUrl(
        contextScopeResult,
        fhirPathContext,
        buildBundleWarnings,
        templateExtractReference.patchRequestUrl
      );
      const hasPatchRequestUrl = typeof patchRequestUrl === 'string' && patchRequestUrl !== '';

      // fullUrl
      // Otherwise, evaluate it as a FHIRPath expression
      const fullUrl = getFullUrl(
        contextScopeResult,
        fhirPathContext,
        buildBundleWarnings,
        templateExtractReference.fullUrl
      );

      // ifNoneMatch, ifModifiedSince, ifMatch, ifNoneExist
      const ifNoneMatch = getOptionalBundleEntryRequestProperty(
        contextScopeResult,
        fhirPathContext,
        buildBundleWarnings,
        templateExtractReference.ifNoneMatch
      );
      const ifModifiedSince = getOptionalBundleEntryRequestProperty(
        contextScopeResult,
        fhirPathContext,
        buildBundleWarnings,
        templateExtractReference.ifModifiedSince
      );
      const ifMatch = getOptionalBundleEntryRequestProperty(
        contextScopeResult,
        fhirPathContext,
        buildBundleWarnings,
        templateExtractReference.ifMatch
      );
      const ifNoneExist = getOptionalBundleEntryRequestProperty(
        contextScopeResult,
        fhirPathContext,
        buildBundleWarnings,
        templateExtractReference.ifNoneExist
      );

      // Request method
      const requestMethod = getRequestMethod(cleanedRetainedResource, hasResourceId);

      // Request url
      const requestUrl =
        requestMethod === 'PATCH' && hasPatchRequestUrl
          ? patchRequestUrl
          : hasResourceId
            ? `${resourceType}/${resourceId}`
            : resourceType;

      // Add resourceId to resource
      const resourceToAdd = addResourceIdToResource(
        cleanedRetainedResource,
        resourceId,
        requestMethod
      );

      // Add entry to the bundle
      bundle.entry.push({
        fullUrl: fullUrl,
        resource: resourceToAdd,
        request: {
          method: requestMethod,
          url: requestUrl,

          // ifNoneMatch, ifModifiedSince, ifMatch, ifNoneExist optional properties
          ...(ifNoneMatch && { ifNoneMatch: ifNoneMatch }),
          ...(ifModifiedSince && {
            ifModifiedSince: ifModifiedSince
          }),
          ...(ifMatch && { ifMatch: ifMatch }),
          ...(ifNoneExist && { ifNoneExist: ifNoneExist })
        }
      });

      // Inject fullUrl into templateIdToExtractPaths for debugging
      const extractPathsByTemplateIdInstance = extractPathsByTemplateId[i];
      if (extractPathsByTemplateIdInstance) {
        templateExtractPathTuples.push([fullUrl, extractPathsByTemplateIdInstance]);
      }
    }

    // Add templateExtractPathTuples to the templateIdToExtractPathTuples record
    templateIdToExtractPathTuples[templateId] = templateExtractPathTuples;
  }

  return { outputBundle: bundle, templateIdToExtractPathTuples: templateIdToExtractPathTuples };
}

function createTemplateExtractContextScope(
  questionnaireResponse: QuestionnaireResponse,
  targetQRItemFhirPath: string | undefined,
  indexInstance: number,
  fhirPathContext: Record<string, any>,
  buildBundleWarnings: OperationOutcomeIssue[]
): FhirPathEvalResult {
  if (targetQRItemFhirPath) {
    const targetQRItemFhirPathWithIndex = addIndexToTargetPath(targetQRItemFhirPath, indexInstance);
    return fhirPathEvaluate({
      fhirData: questionnaireResponse,
      path: targetQRItemFhirPathWithIndex,
      envVars: fhirPathContext,
      warnings: buildBundleWarnings
    });
  }

  // TargetQRItemFhirPath not defined, return an empty array
  return [];
}

function getResourceId(
  contextScopeResult: FhirPathEvalResult,
  fhirPathContext: Record<string, any>,
  buildBundleWarnings: OperationOutcomeIssue[],
  resourceIdFromTemplateDetails?: string
): string | undefined {
  // templateExtract extension:resourceId FHIRPath expression available
  if (resourceIdFromTemplateDetails) {
    const result = fhirPathEvaluate({
      fhirData: contextScopeResult,
      path: resourceIdFromTemplateDetails,
      envVars: fhirPathContext,
      warnings: buildBundleWarnings
    });

    if (result.length > 0 && result[0] && typeof result[0] === 'string' && result[0] !== '') {
      return result[0];
    }
  }

  // templateExtract extension:resourceId unavailable or cannot be evaluated
  return undefined;
}

function getPatchRequestUrl(
  contextScopeResult: FhirPathEvalResult,
  fhirPathContext: Record<string, any>,
  buildBundleWarnings: OperationOutcomeIssue[],
  patchRequestUrlFromTemplateDetails?: string
): string | undefined {
  // templateExtract extension:patchRequestUrl FHIRPath expression available
  if (patchRequestUrlFromTemplateDetails) {
    const result = fhirPathEvaluate({
      fhirData: contextScopeResult,
      path: patchRequestUrlFromTemplateDetails,
      envVars: fhirPathContext,
      warnings: buildBundleWarnings
    });

    if (result.length > 0 && result[0] && typeof result[0] === 'string' && result[0] !== '') {
      return result[0];
    }
  }

  // templateExtract extension:patchRequestUrl unavailable or cannot be evaluated
  return undefined;
}

/**
 * Resolves a fullUrl using a FHIRPath expression from template details, falling back to a generated UUID if not available.
 */
function getFullUrl(
  contextScopeResult: FhirPathEvalResult,
  fhirPathContext: Record<string, any>,
  buildBundleWarnings: OperationOutcomeIssue[],
  fullUrlFromTemplateDetails?: string
): string {
  // templateExtract extension:fullUrl FHIRPath expressions available
  if (fullUrlFromTemplateDetails) {
    const result = fhirPathEvaluate({
      fhirData: contextScopeResult,
      path: fullUrlFromTemplateDetails,
      envVars: fhirPathContext,
      warnings: buildBundleWarnings
    });

    if (result.length > 0 && result[0] && typeof result[0] === 'string') {
      return `${result[0]}`;
    }
  }

  // templateExtract extension:fullUrl unavailable or cannot be evaluated
  return generateUUIDForFullUrl();
}

/**
 * Generates a full UUID-based `urn:uuid:` string for use in Bundle.fullUrl.
 */
function generateUUIDForFullUrl(): string {
  return `urn:uuid:${uuidv4()}`;
}

function getOptionalBundleEntryRequestProperty(
  contextScopeResult: FhirPathEvalResult,
  fhirPathContext: Record<string, any>,
  buildBundleWarnings: OperationOutcomeIssue[],
  optionalProperty?: string
) {
  if (optionalProperty) {
    const result = fhirPathEvaluate({
      fhirData: contextScopeResult,
      path: optionalProperty,
      envVars: fhirPathContext,
      warnings: buildBundleWarnings
    });

    if (result.length > 0 && result[0] && typeof result[0].id === 'string') {
      return result[0];
    }
  }

  return null;
}

/**
 * Generates a short UUID segment to avoid HAPI FHIR fullUrl length restrictions.
 */
function generateShortId(): string {
  return uuidv4().split('-').pop() ?? '';
}

/**
 * Returns a new FHIR resource with the given resourceId, preserving order of resourceType, id, and other properties.
 * If no resourceId is provided, returns the original resource.
 */
function addResourceIdToResource(
  existingResource: FhirResource,
  resourceId: string | undefined,
  requestMethod: BundleRequestType
): FhirResource {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { resourceType, id, ...rest } = existingResource;

  if (!resourceId || requestMethod === 'PATCH') {
    return existingResource;
  }

  return {
    resourceType,
    id: resourceId,
    ...rest
  } as FhirResource;
}

function getRequestMethod(resource: FhirResource, hasResourceId: boolean): BundleRequestType {
  // If order for request.method to be PATCH:
  // 1. ResourceType must be 'Parameters'
  // 2. Resource must conform to the FHIRPathPatchProfile https://build.fhir.org/fhirpath-patch.html
  if (resource.resourceType === 'Parameters') {
    if (parametersIsFhirPatch(resource)) {
      return 'PATCH';
    }
  }

  // if the resource created has no ID property, then the method will be POST, otherwise it will be PUT
  return hasResourceId ? 'PUT' : 'POST';
}
