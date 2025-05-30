import type { FhirResource, OperationOutcomeIssue, QuestionnaireResponse } from 'fhir/r4';
import { fhirPathEvaluate } from './fhirpathEvaluate';
import type {
  FhirPathEvalResult,
  TemplateExtractPath
} from '../interfaces/templateExtractPath.interface';
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
  targetQRItemFhirPathWithIndex: string | undefined,
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

  for (const [valuePath, valueEvaluation] of valuePathMap.entries()) {
    const combinedValueExpression = getCombinedExpression(
      contextPath,
      valueEvaluation.valueExpression
    );
    const valueResult = getTemplateExtractEvalResult({
      fhirDataToEvaluate: questionnaireResponse,
      valueExpression: combinedValueExpression,
      fhirPathContext: fhirPathContext,
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

/**
 * Input parameters for `getTemplateExtractValueResult`.
 */
export interface TemplateExtractValueParams {
  /** The FHIR data context used for evaluating the expression - equivalent to `fhirData` from fhirpath.evaluate(). */
  fhirDataToEvaluate: any;

  /** The value expression to evaluate (FHIRPath or `%<key>` reference) - equivalent to `path` from fhirpath.evaluate(). */
  valueExpression: string;

  /** FHIRPath context for evaluation - equivalent to `envVars` from fhirpath.evaluate(). */
  fhirPathContext: Record<string, any>;

  /** Collector for any evaluation warnings or issues. */
  warnings: OperationOutcomeIssue[];
}

/**
 * Evaluates a value expression for template extraction.
 */
function getTemplateExtractEvalResult(
  templateExtractValueParams: TemplateExtractValueParams
): FhirPathEvalResult {
  const { fhirDataToEvaluate, valueExpression, fhirPathContext, warnings } =
    templateExtractValueParams;

  // Otherwise, evaluate it as a FHIRPath expression
  return fhirPathEvaluate({
    fhirData: fhirDataToEvaluate,
    path: valueExpression,
    envVars: fhirPathContext,
    warnings: warnings
  });
}
