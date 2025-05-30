import type { FhirResource, OperationOutcomeIssue, QuestionnaireResponse } from 'fhir/r4';
import { fhirPathEvaluate } from './fhirpathEvaluate';
import type {
  FhirPathEvalResult,
  TemplateExtractValueEvaluation
} from '../interfaces/templateExtractPath.interface';
import { getCombinedExpression } from './expressionManipulation';
import { insertValuesToPath } from './templateInsert';
import type { EntryPathPosition } from '../interfaces/entryPathPosition.interface';

/**
 * Evaluates FHIRPath expressions from a value map and inserts the resulting values into the target template.
 *
 * @param questionnaireResponse - The source QuestionnaireResponse used as input for evaluation.
 * @param entryPath - Entry path where values should be inserted (e.g., "MedicationStatement.reasonCode[0]").
 * @param contextPath - Optional FHIRPath expression defining context scope to be combined with value expressions.
 * @param valuePathMap - Map of value paths to their corresponding expressions and evaluated results.
 * @param entryPathPositionMap - Tracks how many values were inserted at each entry path.
 * @param fhirPathContext - Additional FHIRPath variables or context used during evaluation.
 * @param templateToMutate - The target FHIR resource to be populated with evaluated values.
 * @param cleanTemplate - A clean version of the template with static template data.
 * @param populateIntoTemplateWarnings - Collects warnings or issues encountered during evaluation and insertion.
 */
export function evaluateAndInsertIntoPath(
  questionnaireResponse: QuestionnaireResponse,
  entryPath: string,
  contextPath: string | undefined,
  valuePathMap: Map<string, TemplateExtractValueEvaluation>,
  entryPathPositionMap: Map<string, EntryPathPosition[]>,
  fhirPathContext: Record<string, any>,
  templateToMutate: FhirResource,
  cleanTemplate: FhirResource,
  populateIntoTemplateWarnings: OperationOutcomeIssue[]
) {
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

    insertValuesToPath(
      entryPath,
      valuePath,
      valueResult,
      entryPathPositionMap,
      templateToMutate,
      cleanTemplate
    );
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
