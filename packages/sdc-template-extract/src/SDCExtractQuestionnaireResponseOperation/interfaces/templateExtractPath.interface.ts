import type { FhirResource, QuestionnaireItem } from 'fhir/r4';
import type { TemplateExtractReference } from './templateExtractReference.interface';

/**
 * Represents the key details of a template used in a Questionnaire `contained` resource.
 *
 * This structure ties a contained FHIR resource (typically a template) to the specific
 * `Questionnaire.item` and `QuestionnaireResponse.item` it is associated with.
 */
export interface TemplateDetails {
  /**
   * The contained FHIR resource representing the template (e.g., a Condition, Observation, etc.).
   */
  templateResource: FhirResource;

  /**
   * Contains details from `templateExtract` extension https://build.fhir.org/ig/HL7/sdc/StructureDefinition-sdc-questionnaire-templateExtract.
   */
  templateExtractReference: TemplateExtractReference;

  /**
   * The `linkId` of the `Questionnaire.item` to which the template is attached via extension.
   */
  targetLinkId: string;

  /**
   * The corresponding `QuestionnaireItem` for the `targetLinkId`.
   */
  targetQItem: QuestionnaireItem;

  /**
   * The FHIRPath to the `QuestionnaireResponseItem` in the response tree (if available).
   */
  targetQRItemFhirPath?: string;
}

/**
 * Result of evaluating a FHIRPath expression. Usually an array of FHIR values, elements, or primitives.
 */
export type FhirPathEvalResult = any[];

/**
 * Result of evaluating a `valueExpression` from the `templateExtractValue` extension.
 * e.g. `"item.where(linkId = 'family').answer.value.first()"` → `"Doe"`
 */
export interface TemplateExtractValueEvaluation {
  valueExpression: string;
  valueResult: any[];
}

/**
 * Represents the full extraction mapping for a single entry in a template, including both context and value extraction paths and expressions.
 */
export interface TemplateExtractPath {
  /**
   * A tuple of [contextPath, contextExpression] from the `templateExtractContext` extension.
   * e.g. `<"Patient.name[0].extension[0]", "	item.where(linkId = 'name')">`
   * `null` when the extraction is based on a standalone value path only.
   */
  contextPathTuple: [string, string] | null;

  /**
   * A map of <valuePath, {valueExpression, valueResult}> pairs from the `templateExtractValue` extension.
   * e.g. `<"Patient.name[0]._family.extension[0]", {valueExpression: "item.where(linkId = 'family').answer.value.first()", valueResult: [["Doe"]]}>`
   */
  valuePathMap: Map<string, TemplateExtractValueEvaluation>;
}

/*
 * An exact copy of `TemplateExtractPath` in `templateExtractPath.interface.ts` but in plain object form.
 */
export interface TemplateExtractPathJsObject {
  contextPathTuple: [string, string] | null;
  valuePathMap: Record<string, TemplateExtractValueEvaluation>;
  generatedFullId?: string;
}

export type TemplateExtractPathJsObjectTuple = [
  string,
  Record<string, TemplateExtractPathJsObject>
];
