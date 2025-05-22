import type { FhirResource, QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import type { TemplateExtractReference } from './templateExtractReference.interface';

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
  templateExtractReference: TemplateExtractReference;
  targetLinkId: string;
  targetQItem: QuestionnaireItem;
  targetQRItem?: QuestionnaireResponseItem;
  targetQRItemFhirPath?: string;
}

/**
 * Result of evaluating the `contextExpression` from the `templateExtractContext` extension.
 * e.g. `{
 *   "linkId": "name",
 *   "text": "Name",
 *   "item": [
 *     {
 *       "linkId": "family",
 *       "text": "Family/Surname",
 *       "answer": [
 *         {
 *           "valueString": "Doe"
 *         }
 *       ]
 *     }
 *   ]
 * }`
 */
export interface TemplateExtractContextEvaluation {
  contextExpression: string;
  contextResult: any;
}

/**
 * Result of evaluating a `valueExpression` from the `templateExtractValue` extension.
 * e.g. `"item.where(linkId = 'family').answer.value.first()"` → `"Doe"`
 */
export interface TemplateExtractValueEvaluation {
  valueExpression: string;
  valueResult: any;
}

/**
 * Represents the full extraction mapping for a single entry in a template, including both context and value extraction paths and expressions.
 */
export interface TemplateExtractPath {
  /**
   * A tuple of [contextPath, {contextExpression, contextResult}] from the `templateExtractContext` extension.
   * e.g. `<"Patient.name[0].extension[0]", "	item.where(linkId = 'name')">`
   * `null` when the extraction is based on a standalone value path only.
   */
  contextPathTuple: [string, TemplateExtractContextEvaluation] | null;

  /**
   * A map of <valuePath, {valueExpression, valueResult}> pairs from the `templateExtractValue` extension.
   * e.g. `<"Patient.name[0]._family.extension[0]", "item.where(linkId = 'family').answer.value.first()">`
   */
  valuePathMap: Map<string, TemplateExtractValueEvaluation>;
}

/*
 * An exact copy of `TemplateExtractPath` in `templateExtractPath.interface.ts` but in plain object form.
 */
export interface TemplateExtractPathJsObject {
  contextPathTuple: [string, TemplateExtractContextEvaluation] | null;
  valuePathMap: Record<string, TemplateExtractValueEvaluation>;
}
