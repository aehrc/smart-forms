import type { OperationOutcomeIssue, QuestionnaireResponse } from 'fhir/r4';
import { fhirPathEvaluate } from './fhirpathEvaluate';
import type { TemplateExtractPath } from '../interfaces/templateExtractPath.interface';
import { createFhirPathContext } from './createFhirPathContext';

export function evaluateTemplateExtractPaths(
  questionnaireResponse: QuestionnaireResponse,
  targetQRItemFhirPath: string | undefined,
  templateExtractPath: TemplateExtractPath,
  extractAllocateIds: Record<string, string>,
  populateIntoTemplateWarnings: OperationOutcomeIssue[]
) {
  const { contextPathTuple, valuePathMap } = templateExtractPath;
  const contextExpression = contextPathTuple?.[1].contextExpression ?? null;

  const fhirPathContext = createFhirPathContext(questionnaireResponse, extractAllocateIds);

  // Context path exists, use contextExpression to frame evaluation scope
  if (contextExpression) {
    const combinedContextPath = getCombinedExpression(targetQRItemFhirPath, contextExpression);
    const contextResult = getTemplateExtractValueResult({
      fhirDataToEvaluate: questionnaireResponse,
      valueExpression: combinedContextPath,
      fhirPathContext: fhirPathContext,
      warnings: populateIntoTemplateWarnings
    });

    // Evaluate each valueExpression within the current template context
    for (const [, valueEvaluation] of valuePathMap.entries()) {
      const valueResult = getTemplateExtractValueResult({
        fhirDataToEvaluate: contextResult,
        valueExpression: valueEvaluation.valueExpression,
        fhirPathContext: fhirPathContext,
        warnings: populateIntoTemplateWarnings
      });

      // Assign evaluated results to templateExtractPath
      if (templateExtractPath.contextPathTuple) {
        templateExtractPath.contextPathTuple[1].contextResult = contextResult;
      }
      valueEvaluation.valueResult = valueResult;
    }
    return;
  }

  // At this point, context path doesn't exist, evaluate each valueExpression directly
  for (const [, valueEvaluation] of valuePathMap.entries()) {
    const combinedValueExpression = getCombinedExpression(
      targetQRItemFhirPath,
      valueEvaluation.valueExpression
    );
    const valueResult = getTemplateExtractValueResult({
      fhirDataToEvaluate: questionnaireResponse,
      valueExpression: combinedValueExpression,
      fhirPathContext: fhirPathContext,
      warnings: populateIntoTemplateWarnings
    });

    // Assign evaluated result to templateExtractPath
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
function getTemplateExtractValueResult(
  templateExtractValueParams: TemplateExtractValueParams
): any {
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

/**
 * Combines a base FHIRPath with an appended expression.
 * Returns the appended expression directly if it's a variable reference.
 */
function getCombinedExpression(
  targetQRItemFhirPath: string | undefined,
  expressionToAppend: string
): string {
  // Use variable reference as-is
  if (expressionToAppend.startsWith('%')) {
    return expressionToAppend;
  }

  // targetQRItemFhirPath empty, return expression directly
  if (targetQRItemFhirPath === '' || targetQRItemFhirPath === undefined) {
    return expressionToAppend;
  }

  return targetQRItemFhirPath + '.' + expressionToAppend; // Append to base path
}
