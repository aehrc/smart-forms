import type { Extension, Reference } from 'fhir/r4';

// Reference to contained resource template
export interface TemplateExtensionSlice extends Extension {
  name: 'template';
  // Must be a local reference to a contained reference (starts with '#')
  valueReference: Reference;
}

// A fhirpath expression to evaluate to populate the fullUrl property in the `Bundle.entry` (uri/string result)
export interface FullUrlExtensionSlice extends Extension {
  name: 'fullUrl';
  valueString: string;
}

// A fhirpath expression to evaluate to populate the resourceId property (string result)
// This will populate Bundle.entry.request.url if it's a POST/PUT request
// There will be an invariant that resourceId and patchRequestUrl cannot both be present at the same time
export interface ResourceIdExtensionSlice extends Extension {
  name: 'resourceId';
  valueString: string;
}

// A fhirpath expression to evaluate to populate the patchRequestUrl property (string result)
// This will populate Bundle.entry.request.url if it's a PATCH request
// There will be an invariant that resourceId and patchRequestUrl cannot both be present at the same time
export interface PatchRequestUrlExtensionSlice extends Extension {
  name: 'https://smartforms.csiro.au/ig/StructureDefinition/TemplateExtractExtensionPatchRequestUrl';
  valueString: string;
}

// A fhirpath expression to evaluate to populate the ifNoneMatch property (string result)
export interface IfNoneMatchExtensionSlice extends Extension {
  name: 'ifNoneMatch';
  valueString: string;
}

// A fhirpath expression to evaluate to populate the ifModifiedSince property (instant result)
export interface IfModifiedSinceExtensionSlice extends Extension {
  name: 'ifModifiedSince';
  valueString: string;
}

// A fhirpath expression to evaluate to populate the ifMatch property (string result)
export interface IfMatchExtensionSlice extends Extension {
  name: 'ifMatch';
  valueString: string;
}

// A fhirpath expression to evaluate to populate the ifNoneExist property (string result)
export interface IfNoneExistExtensionSlice extends Extension {
  name: 'ifNoneExist';
  valueString: string;
}

/**
 * Represents extracted values from a `templateExtract` extension on a Questionnaire or QuestionnaireItem.
 */
export interface TemplateExtractReference {
  /**
   * The ID of the referenced contained resource template.
   * Extracted from the `valueReference.reference` field of the `template` slice.
   * Must start with `#` (i.e., a local reference).
   */
  templateId: string;

  /**
   * FHIRPath expression string used to populate the `fullUrl` field of a `Bundle.entry`.
   * Extracted from the `valueString` of the `fullUrl` slice.
   */
  fullUrl?: string;

  /**
   * FHIRPath expression string used to populate `resource.id` of a resource and bundle.entry.request.url for POST/PUT requests.
   * Extracted from the `valueString` of the `resourceId` slice.
   */
  resourceId?: string;

  /**
   * A custom slice (at the moment - see https://chat.fhir.org/#narrow/channel/179255-questionnaire/topic/.24extract.20using.20templates/with/542442943).
   * FHIRPath expression string used to populate bundle.entry.request.url for PATCH requests.
   * Extracted from the `valueString` of the `https://smartforms.csiro.au/ig/StructureDefinition/TemplateExtractExtensionPatchRequestUrl` slice (to be changed to patchRequestUrl in the future).
   */
  patchRequestUrl?: string;

  /**
   * FHIRPath expression string used to populate the `ifNoneMatch` field in the `request` of a `Bundle.entry`.
   * Extracted from the `valueString` of the `ifNoneMatch` slice.
   */
  ifNoneMatch?: string;

  /**
   * FHIRPath expression string used to populate the `ifModifiedSince` field in the `request` of a `Bundle.entry`.
   * Extracted from the `valueString` of the `ifModifiedSince` slice.
   */
  ifModifiedSince?: string;

  /**
   * FHIRPath expression string used to populate the `ifMatch` field in the `request` of a `Bundle.entry`.
   * Extracted from the `valueString` of the `ifMatch` slice.
   */
  ifMatch?: string;

  /**
   * FHIRPath expression string used to populate the `ifNoneExist` field in the `request` of a `Bundle.entry`.
   * Extracted from the `valueString` of the `ifNoneExist` slice.
   */
  ifNoneExist?: string;
}
