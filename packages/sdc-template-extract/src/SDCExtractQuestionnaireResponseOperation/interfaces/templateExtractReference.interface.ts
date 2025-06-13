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
export interface ResourceIdExtensionSlice extends Extension {
  name: 'resourceId';
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

// ValueCode indicating the resource type of an extracted resource to populate request.url property in `Bundle.entry`.
// Must be binded to http://hl7.org/fhir/R4/valueset-resource-types.html.
export interface TypeExtensionSlice extends Extension {
  name: 'type';
  valueCode: string;
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
   * FHIRPath expression string used to populate the `resource.id` of a resource.
   * Extracted from the `valueString` of the `resourceId` slice.
   */
  resourceId?: string;

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

  /**
   * A custom slice. ValueCode indicating the resource type of an extracted resource, if the template's resourceType is different e.g. Parameters.
   * Must be binded to http://hl7.org/fhir/R4/valueset-resource-types.html.
   * Currently used to populate the `url` field in the `request` of a `Bundle.entry`.
   * Extracted from the `valueCode` of the custom `type` slice.
   */
  type?: string;
}
