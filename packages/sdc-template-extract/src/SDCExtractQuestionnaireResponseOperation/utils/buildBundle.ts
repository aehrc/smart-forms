import type { Bundle, FhirResource, OperationOutcomeIssue } from 'fhir/r4';
import type {
  TemplateDetails,
  TemplateExtractPathJsObject,
  TemplateExtractPathJsObjectTuple
} from '../interfaces/templateExtractPath.interface';
import { fhirPathEvaluate } from './fhirpathEvaluate';
import { v4 as uuidv4 } from 'uuid';
import cleanDeep from 'clean-deep';
import { parametersIsFhirPatch } from './typePredicates';
import type { BundleRequestType } from '../interfaces/bundle.interface';

/**
 * Builds a FHIR transaction Bundle from extracted resources using the templateExtract extension.
 * If a resource has an ID, it's treated as an update (PUT); otherwise, it's treated as a create (POST).
 * The resulting Bundle includes properly populated fullUrl, request.method, request.url, and optional request metadata.
 *
 * @param extractedResourceMap - Map of template IDs to extracted FHIR resources.
 * @param containedTemplateMap - Map of template IDs to TemplateDetails including templateExtract metadata.
 * @param fhirPathContext - FHIRPath context object that acts as envVars for fhirpath.evaluate
 * @param templateIdToExtractPaths - Map of template IDs to their respective TemplateExtractPathJsObject. We inject fullUrl in this function to help debugging.
 * @returns {Bundle} - A FHIR transaction Bundle containing all extracted resources with appropriate request entries.
 */
export function buildTransactionBundle(
  extractedResourceMap: Map<string, FhirResource[]>,
  containedTemplateMap: Map<string, TemplateDetails>,
  fhirPathContext: Record<string, string>,
  templateIdToExtractPaths: Record<string, Record<string, TemplateExtractPathJsObject>[]>
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
          code: '@aehrc/sdc-template-extract-v0.1.0:generated'
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
    const { templateExtractReference } = templateDetails;

    const extractPathsByTemplateId = templateIdToExtractPaths[templateId];

    const extractedResources = extractedResourceMap.get(templateId);
    if (!extractedResources || extractedResources.length === 0 || !extractPathsByTemplateId) {
      continue;
    }

    const templateExtractPathTuples: TemplateExtractPathJsObjectTuple[] = [];
    for (const [indexInstance, extractedResource] of extractedResources.entries()) {
      const extractPathsByTemplateIdInstance = extractPathsByTemplateId[indexInstance];

      // Clean extracted resource
      const cleanedExtractedResource = cleanDeep(extractedResource, {
        emptyObjects: true,
        emptyArrays: true,
        nullValues: true,
        undefinedValues: true
      }) as FhirResource;

      // resourceId
      const resourceId = getResourceId(
        fhirPathContext,
        buildBundleWarnings,
        templateExtractReference.resourceId
      );
      const hasResourceId = typeof resourceId === 'string' && resourceId !== '';

      // resourceType (custom)
      let resourceType = cleanedExtractedResource.resourceType;
      if (templateExtractReference.resourceType) {
        resourceType = templateExtractReference.resourceType as FhirResource['resourceType'];
      }

      // fullUrl
      // Otherwise, evaluate it as a FHIRPath expression
      const fullUrl = getFullUrl(
        fhirPathContext,
        buildBundleWarnings,
        templateExtractReference.fullUrl
      );

      // ifNoneMatch, ifModifiedSince, ifMatch, ifNoneExist
      const ifNoneMatch = getOptionalBundleEntryRequestProperty(
        fhirPathContext,
        buildBundleWarnings,
        templateExtractReference.ifNoneMatch
      );
      const ifModifiedSince = getOptionalBundleEntryRequestProperty(
        fhirPathContext,
        buildBundleWarnings,
        templateExtractReference.ifModifiedSince
      );
      const ifMatch = getOptionalBundleEntryRequestProperty(
        fhirPathContext,
        buildBundleWarnings,
        templateExtractReference.ifMatch
      );
      const ifNoneExist = getOptionalBundleEntryRequestProperty(
        fhirPathContext,
        buildBundleWarnings,
        templateExtractReference.ifNoneExist
      );

      // Request method
      const requestMethod = getRequestMethod(cleanedExtractedResource, hasResourceId);

      // Add resourceId to resource
      const resourceToAdd = addResourceIdToResource(
        cleanedExtractedResource,
        resourceId,
        requestMethod
      );

      // Add entry to the bundle
      bundle.entry.push({
        fullUrl: fullUrl,
        resource: resourceToAdd,
        request: {
          method: requestMethod,
          url: hasResourceId ? `${resourceType}/${resourceId}` : resourceType,

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
      if (extractPathsByTemplateIdInstance) {
        templateExtractPathTuples.push([fullUrl, extractPathsByTemplateIdInstance]);
      }
    }

    // Add templateExtractPathTuples to the templateIdToExtractPathTuples record
    templateIdToExtractPathTuples[templateId] = templateExtractPathTuples;
  }

  return { outputBundle: bundle, templateIdToExtractPathTuples: templateIdToExtractPathTuples };
}

function getResourceId(
  fhirPathContext: Record<string, any>,
  buildBundleWarnings: OperationOutcomeIssue[],
  resourceIdFromTemplateDetails?: string
): string | undefined {
  // templateExtract extension:fullUrl FHIRPath expressions available
  if (resourceIdFromTemplateDetails) {
    const result = fhirPathEvaluate({
      fhirData: {},
      path: resourceIdFromTemplateDetails,
      envVars: fhirPathContext,
      warnings: buildBundleWarnings
    });

    if (result.length > 0 && result[0] && typeof result[0] === 'string' && result[0] !== '') {
      return result[0];
    }
  }

  // templateExtract extension:fullUrl unavailable or cannot be evaluated
  return undefined;
}

/**
 * Resolves a fullUrl using a FHIRPath expression from template details, falling back to a generated UUID if not available.
 */
function getFullUrl(
  fhirPathContext: Record<string, any>,
  buildBundleWarnings: OperationOutcomeIssue[],
  fullUrlFromTemplateDetails?: string
): string {
  // templateExtract extension:fullUrl FHIRPath expressions available
  if (fullUrlFromTemplateDetails) {
    const result = fhirPathEvaluate({
      fhirData: {},
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
  fhirPathContext: Record<string, any>,
  buildBundleWarnings: OperationOutcomeIssue[],
  optionalProperty?: string
) {
  if (optionalProperty) {
    const result = fhirPathEvaluate({
      fhirData: {},
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
