import type { FhirResource, OperationOutcomeIssue, QuestionnaireResponse } from 'fhir/r4';
import { fhirPathEvaluate } from './fhirpathEvaluate';
import type { TemplateExtractPath } from '../interfaces/templateExtractPath.interface';
import { getCombinedExpression, stripTrailingIndexFromPath } from './expressionManipulation';
import { insertValuesToPath } from './templateInsert';
import type { EntryPathPosition } from '../interfaces/entryPathPosition.interface';
import { addCurrentEntryPathPosition, getStartingIndex } from './entryPathPosition';
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
  const contextResults = fhirPathEvaluate({
    fhirData: questionnaireResponse,
    path: contextPath,
    envVars: fhirPathContext,
    warnings: populateIntoTemplateWarnings
  });

  // Get the index that we should start inserting values at for this entry path
  const baseEntryPath = stripTrailingIndexFromPath(entryPath);
  const startingIndex = getStartingIndex(baseEntryPath, entryPath, entryPathPositionMap);

  // Iterate over context results to evaluate values and insert into template
  for (let i = 0; i < contextResults.length; i++) {
    const contextResult = contextResults[i];
    const insertIndex = startingIndex + i;

    // Flag to track if this is a new insert - used to determine the correct behaviour when inserting into an array element
    // The first time we see a context result, we add a new entry at the specified index
    // Subsequent inserts for the same context result will merge into the same index
    let isNewInsert = true;

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
        insertIndex,
        isNewInsert,
        valuePath,
        valueResult,
        templateToMutate,
        cleanTemplate,
        populateIntoTemplateWarnings
      );

      if (Array.isArray(valueResult) && valueResult.length) {
        // Values found, set flag to false so that subsequent inserts for the same context are now merged at the same index
        isNewInsert = false;
      }

      // Collect value evaluation results for debugging
      valueEvaluation.valueResult.push(valueResult);
    }
  }

  // Track the number of inserted entries for the base entry path using entryPathPositionMap
  addCurrentEntryPathPosition(
    baseEntryPath,
    entryPath,
    startingIndex,
    contextResults.length,
    entryPathPositionMap
  );
}
