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

export interface ExtractTemplate {
  template: TemplateExtensionSlice;
  fullUrl?: FullUrlExtensionSlice;
  resourceId?: ResourceIdExtensionSlice;
  ifNoneMatch?: IfNoneMatchExtensionSlice;
  ifModifiedSince?: IfModifiedSinceExtensionSlice;
  ifMatch?: IfMatchExtensionSlice;
  ifNoneExist?: IfNoneExistExtensionSlice;
}
