import type { Coding } from 'fhir/r4';

/**
 * Retrieves only the relevant properties of a Coding object.
 * Reason: https://tx.ontoserver.csiro.au/fhir returns a Coding with designation element, which is not in the FHIR spec, causing QRs with it to fail validation.
 *
 * Extensions are only safe to carry through when the Coding comes from the Questionnaire itself
 * (answerOption, item.initial) or a matched ValueSet expansion entry - they were put there
 * deliberately, e.g. an ordinalValue extension used by a calculatedExpression for scoring.
 * A Coding read live off a source resource via a FHIRPath expression during population may carry
 * extensions scoped to that resource's own context (e.g. an AU-base medication-type extension on
 * a MedicationStatement.code.coding), which are not conformant on a QuestionnaireResponse answer -
 * callers populating directly from source data must pass includeExtension: false.
 *
 * @author Sean Fong
 */
export function getRelevantCodingProperties(
  coding: Coding,
  { includeExtension = true }: { includeExtension?: boolean } = {}
): Coding {
  return {
    system: coding.system,
    code: coding.code,
    display: coding.display,
    ...(includeExtension && coding.extension && { extension: coding.extension })
  };
}
