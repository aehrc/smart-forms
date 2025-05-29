import type { FhirResource, OperationOutcomeIssue, QuestionnaireResponse } from 'fhir/r4';
import { fhirPathEvaluate } from './fhirpathEvaluate';
import type {
  FhirPathEvalResult,
  TemplateExtractValueEvaluation
} from '../interfaces/templateExtractPath.interface';
import { addIndexToTargetPath, getCombinedExpression } from './expressionManipulation';
import { insertValuesToTemplate } from './templateInsert';

export function evaluateAndInsertWithContext(
  questionnaireResponse: QuestionnaireResponse,
  entryPath: string,
  combinedContextPath: string,
  valuePathMap: Map<string, TemplateExtractValueEvaluation>,
  fhirPathContext: Record<string, any>,
  templateToMutate: FhirResource,
  populateIntoTemplateWarnings: OperationOutcomeIssue[]
) {
  // Evaluate context expression to get context result
  const contextResult = getTemplateExtractEvalResult({
    fhirDataToEvaluate: questionnaireResponse,
    valueExpression: combinedContextPath,
    fhirPathContext: fhirPathContext,
    warnings: populateIntoTemplateWarnings
  });

  const numberOfContextInstances = contextResult.length;

  // Evaluate each valueExpression within the current template context instance
  for (let contextIndex = 0; contextIndex < numberOfContextInstances; contextIndex++) {
    const combinedContextPathWithIndex = addIndexToTargetPath(combinedContextPath, contextIndex);

    // const entryPathCountMap = new Map<string, number>();
    for (const [valuePath, valueEvaluation] of valuePathMap.entries()) {
      const combinedValueExpression = getCombinedExpression(
        combinedContextPathWithIndex,
        valueEvaluation.valueExpression
      );
      const valueResult = getTemplateExtractEvalResult({
        fhirDataToEvaluate: questionnaireResponse,
        valueExpression: combinedValueExpression,
        fhirPathContext: fhirPathContext,
        warnings: populateIntoTemplateWarnings
      });

      insertValuesToTemplate(entryPath, valuePath, valueResult, templateToMutate, contextIndex);
    }
  }
}

export function evaluateAndInsertWithoutContext(
  questionnaireResponse: QuestionnaireResponse,
  entryPath: string,
  targetQRItemFhirPath: string | undefined,
  valuePathMap: Map<string, TemplateExtractValueEvaluation>,
  fhirPathContext: Record<string, any>,
  templateToMutate: FhirResource,
  populateIntoTemplateWarnings: OperationOutcomeIssue[]
) {
  // At this point, context path doesn't exist, evaluate each valueExpression directly
  // const entryPathCountMap = new Map<string, number>();
  for (const [valuePath, valueEvaluation] of valuePathMap.entries()) {
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

    insertValuesToTemplate(entryPath, valuePath, valueResult, templateToMutate);
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
