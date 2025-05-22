import type { Bundle, FhirResource } from 'fhir/r4';
import type { TemplateDetails } from '../interfaces/templateExtractPath.interface';
import { fhirPathEvaluate } from './fhirpathEvaluate';
import { v4 as uuidv4 } from 'uuid';

/**
 * Builds a FHIR transaction Bundle from extracted resources using the templateExtract extension.
 * If a resource has an ID, it's treated as an update (PUT); otherwise, it's treated as a create (POST).
 * The resulting Bundle includes properly populated fullUrl, request.method, request.url, and optional request metadata.
 *
 * @param extractedResourceMap - Map of template IDs to extracted FHIR resources.
 * @param containedTemplateMap - Map of template IDs to TemplateDetails including templateExtract metadata.
 * @param extractAllocateIds - Record of resource references to allocated UUIDs used for fullUrl generation.
 * @returns {Bundle} - A FHIR transaction Bundle containing all extracted resources with appropriate request entries.
 */
export function buildTransactionBundle(
  extractedResourceMap: Map<string, FhirResource>,
  containedTemplateMap: Map<string, TemplateDetails>,
  extractAllocateIds: Record<string, string>
): Bundle {
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

  // Add entries to the bundle from the extracted resources
  if (bundle.entry !== undefined) {
    for (const [templateId, templateDetails] of containedTemplateMap.entries()) {
      const { templateExtractReference } = templateDetails;

      const extractedResource = extractedResourceMap.get(templateId);
      if (!extractedResource) {
        continue;
      }

      // resourceId
      const resourceId = templateExtractReference.resourceId;
      const hasResourceId = typeof resourceId === 'string' && resourceId !== '';

      // fullUrl
      // Otherwise, evaluate it as a FHIRPath expression
      const fullUrl = getFullUrl(extractAllocateIds, templateExtractReference.fullUrl);

      // ifNoneMatch, ifModifiedSince, ifMatch, ifNoneExist
      const ifNoneMatch = getOptionalBundleEntryRequestProperty(
        extractAllocateIds,
        templateExtractReference.ifNoneMatch
      );
      const ifModifiedSince = getOptionalBundleEntryRequestProperty(
        extractAllocateIds,
        templateExtractReference.ifModifiedSince
      );
      const ifMatch = getOptionalBundleEntryRequestProperty(
        extractAllocateIds,
        templateExtractReference.ifMatch
      );
      const ifNoneExist = getOptionalBundleEntryRequestProperty(
        extractAllocateIds,
        templateExtractReference.ifNoneExist
      );

      bundle.entry.push({
        fullUrl: fullUrl,
        resource: extractedResource,
        request: {
          method: hasResourceId ? 'PUT' : 'POST',
          url: hasResourceId
            ? `${extractedResource.resourceType}/${resourceId}`
            : extractedResource.resourceType,

          // ifNoneMatch, ifModifiedSince, ifMatch, ifNoneExist optional properties
          ...(ifNoneMatch && { ifNoneMatch: ifNoneMatch }),
          ...(ifModifiedSince && {
            ifModifiedSince: ifModifiedSince
          }),
          ...(ifMatch && { ifMatch: ifMatch }),
          ...(ifNoneExist && { ifNoneExist: ifNoneExist })
        }
      });
    }
  }

  return bundle;
}

function getFullUrl(
  extractAllocateIds: Record<string, string>,
  fullUrlFromTemplateDetails?: string
): string {
  // templateExtract extension:fullUrl FHIRPath expressions available
  if (fullUrlFromTemplateDetails) {
    const result = fhirPathEvaluate({
      fhirData: {},
      path: fullUrlFromTemplateDetails,
      envVars: extractAllocateIds,
      warnings: []
    });

    if (result.length > 0 && result[0] && typeof result[0].id === 'string') {
      return `urn:uuid:${result[0].id}`;
    }
  }

  // templateExtract extension:fullUrl unavailable or cannot be evaluated
  return generateUUIDForFullUrl();
}

function generateUUIDForFullUrl(): string {
  return `urn:uuid:${uuidv4()}`;
}

function getOptionalBundleEntryRequestProperty(
  extractAllocateIds: Record<string, string>,
  optionalProperty?: string
) {
  if (optionalProperty) {
    const result = fhirPathEvaluate({
      fhirData: {},
      path: optionalProperty,
      envVars: extractAllocateIds,
      warnings: []
    });

    if (result.length > 0 && result[0] && typeof result[0].id === 'string') {
      return result[0];
    }
  }

  return null;
}

function generateShortId(): string {
  return uuidv4().split('-').pop() ?? '';
}
