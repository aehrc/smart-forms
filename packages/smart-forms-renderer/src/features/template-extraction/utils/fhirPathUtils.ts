import { QuestionnaireResponse } from 'fhir/r4';

type QuestionnaireResponseItem = {
  linkId: string;
  text?: string;
  answer?: Array<{
    valueDecimal?: number;
    valueString?: string;
    valueBoolean?: boolean;
    valueInteger?: number;
  }>;
  item?: QuestionnaireResponseItem[];
};

/**
 * Find an item in a QuestionnaireResponse by its linkId, including nested items
 * @param items Array of QuestionnaireResponse items
 * @param linkId The linkId to find
 * @returns The found item or undefined
 */
function findItemByLinkId(items: QuestionnaireResponseItem[] | undefined, linkId: string): QuestionnaireResponseItem | undefined {
  if (!items) return undefined;

  for (const item of items) {
    if (item.linkId === linkId) {
      return item;
    }
    if (item.item) {
      const found = findItemByLinkId(item.item, linkId);
      if (found) return found;
    }
  }
  return undefined;
}

/**
 * Evaluate a FHIRPath expression on a QuestionnaireResponse
 * @param response The QuestionnaireResponse to evaluate against
 * @param expression The FHIRPath expression
 * @returns The evaluated value or undefined
 */
export function evaluateFhirPath(
  response: QuestionnaireResponse,
  expression: string
): number | undefined {
  try {
    // Simple implementation for now - we can enhance this later
    const match = expression.match(/item\.where\(linkId='([^']+)'\)\.answer\.value(Integer|Decimal)?/);
    if (!match) {
      return undefined;
    }

    const linkId = match[1];
    const item = findItemByLinkId(response.item as QuestionnaireResponseItem[], linkId);
    const answer = item?.answer?.[0];
    if (!answer) {
      return undefined;
    }

    // Try both integer and decimal values
    return answer.valueInteger ?? answer.valueDecimal;
  } catch (error) {
    console.error('Error evaluating FHIRPath expression:', error);
    return undefined;
  }
} 