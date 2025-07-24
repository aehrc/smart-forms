import type { FhirResource, OperationOutcomeIssue, QuestionnaireResponse } from 'fhir/r4';
import { fhirPathEvaluate } from './fhirpathEvaluate';
import type { TemplateExtractPath } from '../interfaces/templateExtractPath.interface';
import { getCombinedExpression } from './expressionManipulation';
import { insertValuesToPath } from './templateInsert';
import type { EntryPathPosition } from '../interfaces/entryPathPosition.interface';

/**
 * Evaluates FHIRPath expressions from a value map and inserts the resulting values into the target template.
 *
 * @param questionnaireResponse - The source QuestionnaireResponse used as input for evaluation.
 * @param entryPath - Entry path where values should be inserted (e.g., "MedicationStatement.reasonCode[0]").
 * @param templateExtractPath - The template extract path entry containing context and value expressions to evaluate.
 * @param targetQRItemFhirPathWithIndex - The FHIRPath-style path for the target QuestionnaireResponse item, potentially with an index.
 * @param entryPathPositionMap - Tracks how many values were inserted at each entry path.
 * @param fhirPathContext - Additional FHIRPath variables or context used during evaluation.
 * @param templateToMutate - The target FHIR resource to be populated with evaluated values.
 * @param cleanTemplate - A clean version of the template with static template data.
 * @param populateIntoTemplateWarnings - Collects warnings or issues encountered during evaluation and insertion.
 */
export function evaluateAndInsertIntoPath(
  questionnaireResponse: QuestionnaireResponse,
  entryPath: string,
  templateExtractPath: TemplateExtractPath,
  targetQRItemFhirPathWithIndex: string,
  entryPathPositionMap: Map<string, EntryPathPosition[]>,
  fhirPathContext: Record<string, any>,
  templateToMutate: FhirResource,
  cleanTemplate: FhirResource,
  populateIntoTemplateWarnings: OperationOutcomeIssue[]
) {
  const { contextPathTuple, valuePathMap } = templateExtractPath;
  const contextExpression = contextPathTuple?.[1] ?? null;

  // Context path exists, use contextExpression to frame evaluation scope
  // Otherwise, use targetQRItemFhirPathWithIndex as the context path
  const contextPath = contextExpression
    ? getCombinedExpression(targetQRItemFhirPathWithIndex, contextExpression)
    : targetQRItemFhirPathWithIndex;

  // Evaluate context path to get the context result
  const contextResult = fhirPathEvaluate({
    fhirData: questionnaireResponse,
    path: contextPath,
    envVars: fhirPathContext,
    warnings: populateIntoTemplateWarnings
  });

  for (const [valuePath, valueEvaluation] of valuePathMap.entries()) {
    // Use context result to evaluate the value expression
    const valueResult = fhirPathEvaluate({
      fhirData: contextResult,
      path: valueEvaluation.valueExpression,
      envVars: fhirPathContext,
      warnings: populateIntoTemplateWarnings
    });

    // Insert values to the specified entry path
    insertValuesToPath(
      entryPath,
      valuePath,
      valueResult,
      entryPathPositionMap,
      templateToMutate,
      cleanTemplate,
      populateIntoTemplateWarnings
    );

    // Collect value evaluation results for debugging
    valueEvaluation.valueResult = valueResult;
  }
}
