import type { QuestionnaireResponse } from 'fhir/r4';

/**
 * Builds a FHIRPath context with the response and allocated IDs.
 *
 * @param questionnaireResponse - The QuestionnaireResponse resource.
 * @param extractAllocateIds - Map of variable names to allocated IDs.
 * @returns FHIRPath context object.
 */
export function createFhirPathContext(
  questionnaireResponse: QuestionnaireResponse,
  extractAllocateIds: Record<string, string>
): Record<string, any> {
  return {
    resource: questionnaireResponse,
    rootResource: questionnaireResponse,
    ...extractAllocateIds
  };
}
