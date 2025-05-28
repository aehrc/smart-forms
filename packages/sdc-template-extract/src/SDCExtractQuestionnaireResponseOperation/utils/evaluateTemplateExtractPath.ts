import type { OperationOutcomeIssue, QuestionnaireResponse } from 'fhir/r4';
import { fhirPathEvaluate } from './fhirpathEvaluate';
import type { TemplateExtractPath } from '../interfaces/templateExtractPath.interface';
import { getCombinedExpression } from './expressionManipulation';

export function evaluateTemplateExtractPaths(
  questionnaireResponse: QuestionnaireResponse,
  targetQRItemFhirPath: string | undefined,
  templateExtractPath: TemplateExtractPath,
  fhirPathContext: Record<string, any>,
  populateIntoTemplateWarnings: OperationOutcomeIssue[]
) {
  const { contextPathTuple, valuePathMap } = templateExtractPath;
  const contextExpression = contextPathTuple?.[1].contextExpression ?? null;

  // Context path exists, use contextExpression to frame evaluation scope
  if (contextExpression) {
    const combinedContextPath = getCombinedExpression(targetQRItemFhirPath, contextExpression);
    const contextResult = getTemplateExtractEvalResult({
      fhirDataToEvaluate: questionnaireResponse,
      valueExpression: combinedContextPath,
      fhirPathContext: fhirPathContext,
      warnings: populateIntoTemplateWarnings
    });

    // Evaluate each valueExpression within the current template context
    for (const [, valueEvaluation] of valuePathMap.entries()) {
      const combinedValueExpression = getCombinedExpression(
        combinedContextPath,
        valueEvaluation.valueExpression
      );
      const valueResult = getTemplateExtractEvalResult({
        fhirDataToEvaluate: questionnaireResponse,
        valueExpression: combinedValueExpression,
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
    const valueResult = getTemplateExtractEvalResult({
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
function getTemplateExtractEvalResult(templateExtractValueParams: TemplateExtractValueParams): any {
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
