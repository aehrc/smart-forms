import { TemplateDetails } from '../interfaces/templateExtractPath.interface';
import { OperationOutcomeIssue, QuestionnaireResponse } from 'fhir/r4';
import { fhirPathEvaluate } from './fhirpathEvaluate';
import { createTemplateExtractPathMap, logTemplateExtractPaths } from './templateExtractPath';

export function populateIntoTemplate(
  questionnaireResponse: QuestionnaireResponse,
  templateMap: Map<string, TemplateDetails>,
  extractAllocateIdMap: Map<string, string>
) {
  const populateIntoTemplateWarnings: OperationOutcomeIssue[] = [];

  // Convert extractAllocateIdMap into a Record<string, string>
  const extractAllocateIds = Object.fromEntries(extractAllocateIdMap);

  for (const [templateId, templateDetails] of templateMap.entries()) {
    const { templateResource, targetQRItemFhirPath } = templateDetails;

    // if (templateId === 'patTemplate') {
    if (true) {
      // Builds a map of FHIRPath expressions for templateExtractContexts and templateExtractValues
      const { templateExtractPathMap, walkTemplateWarnings } = createTemplateExtractPathMap(
        templateId,
        templateResource
      );

      // Local debugging
      logTemplateExtractPaths(templateId, templateExtractPathMap);

      const debugTable: { entryPath: string; contextResult: any; valueResult: any }[] = [];
      for (const [entryPath, templateExtractPath] of templateExtractPathMap.entries()) {
        const { contextPathTuple, valuePathMap } = templateExtractPath;
        const contextExpression = contextPathTuple?.[1];

        // Context path exists, use contextExpression to frame evaluation scope
        if (contextExpression) {
          const combinedContextPath = getCombinedExpression(
            targetQRItemFhirPath,
            contextExpression
          );
          const contextResult = getTemplateExtractValueResult({
            fhirDataToEvaluate: questionnaireResponse,
            valueExpression: combinedContextPath,
            extractAllocateIds: extractAllocateIds,
            warnings: populateIntoTemplateWarnings
          });

          // Evaluate each valueExpression within the current template context
          for (const [, valueExpression] of valuePathMap.entries()) {
            const valueResult = getTemplateExtractValueResult({
              fhirDataToEvaluate: contextResult,
              valueExpression: valueExpression,
              extractAllocateIds: extractAllocateIds,
              warnings: populateIntoTemplateWarnings
            });

            if (Array.isArray(templateExtractPath.contextResult)) {
              templateExtractPath.contextResult.push(contextResult);
            }
            templateExtractPath.valueResult.push(valueResult);

            // Local debugging
            debugTable.push({
              entryPath: entryPath,
              contextResult: contextResult,
              valueResult: valueResult
            });
          }
          continue;
        }

        // At this point, context path doesn't exists, evaluate each valueExpression directly
        for (const [, valueExpression] of valuePathMap.entries()) {
          const combinedValueExpression = getCombinedExpression(
            targetQRItemFhirPath,
            valueExpression
          );
          const valueResult = getTemplateExtractValueResult({
            fhirDataToEvaluate: questionnaireResponse,
            valueExpression: combinedValueExpression,
            extractAllocateIds: extractAllocateIds,
            warnings: populateIntoTemplateWarnings
          });
          templateExtractPath.valueResult.push(valueResult);

          // Local debugging
          debugTable.push({
            entryPath: entryPath,
            contextResult: null,
            valueResult: valueResult
          });
        }
      }
      console.log(`\n🔢Template Extract Evaluation result for: ${templateId}`);
      console.table(debugTable);
    }
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

  /** Map of allocated IDs for substitution in expressions. */
  extractAllocateIds: Record<string, string>;

  /** Collector for any evaluation warnings or issues. */
  warnings: OperationOutcomeIssue[];
}

/**
 * Evaluates a value expression for template extraction.
 *
 * Supports `%<key>` substitution using `extractAllocateIds`, or full FHIRPath evaluation.
 */
function getTemplateExtractValueResult(
  templateExtractValueParams: TemplateExtractValueParams
): any {
  const { fhirDataToEvaluate, valueExpression, extractAllocateIds, warnings } =
    templateExtractValueParams;
  // Expression starts with %, treat it as a reference to an allocated ID
  if (valueExpression.startsWith('%')) {
    const extractAllocateIdKey = valueExpression.substring(1);
    return extractAllocateIds[extractAllocateIdKey];
  }

  // Otherwise, evaluate it as a FHIRPath expression
  return fhirPathEvaluate({
    fhirData: fhirDataToEvaluate,
    path: valueExpression,
    envVars: extractAllocateIds,
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
