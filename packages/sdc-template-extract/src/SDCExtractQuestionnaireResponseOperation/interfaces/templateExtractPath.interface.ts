import type { FhirResource, QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';

/**
 * Represents the key details of a template used in a Questionnaire `contained` resource.
 *
 * This structure ties a contained FHIR resource (typically a template) to the specific
 * `Questionnaire.item` and `QuestionnaireResponse.item` it is associated with.
 */
export interface TemplateDetails {
  /**
   * The contained FHIR resource representing the template (e.g., a Questionnaire, StructureMap, etc.).
   */
  templateResource: FhirResource;

  /**
   * The `linkId` of the `Questionnaire.item` to which the template is attached via extension.
   */
  targetLinkId: string;

  /**
   * The corresponding `QuestionnaireItem` for the `targetLinkId`.
   */
  targetQItem: QuestionnaireItem;

  /**
   * The matching `QuestionnaireResponseItem` from the response (if available).
   */
  targetQRItem?: QuestionnaireResponseItem;

  /**
   * The FHIRPath to the `QuestionnaireResponseItem` in the response tree (if available).
   */
  targetQRItemFhirPath?: string;
}

export interface TemplateDetails {
  templateResource: FhirResource;
  targetLinkId: string;
  targetQItem: QuestionnaireItem;
  targetQRItem?: QuestionnaireResponseItem;
  targetQRItemFhirPath?: string;
}

/**
 * Represents the full extraction mapping for a single entry in a template, including both context and value extraction paths and expressions.
 */
export interface TemplateExtractPath {
  /**
   * A tuple of [contextPath, valuePath] for extractions that use context;
   * `null` when the extraction is based on a standalone value path only.
   */
  contextPathTuple: [string, string] | null;

  /**
   * Maps the absolute FHIR path (e.g., `Patient.identifier[0].extension[1]`) to
   * the logical path defined by the `templateExtractValue` (e.g., `Patient.nationalId`).
   */
  valuePathMap: Map<string, string>;

  /**
   * Result of evaluating the context path; null if no context path exists.
   */
  contextResult: any[] | null;

  /**
   * Result of evaluating the value path(s); initially empty.
   */
  valueResult: any[];
}
