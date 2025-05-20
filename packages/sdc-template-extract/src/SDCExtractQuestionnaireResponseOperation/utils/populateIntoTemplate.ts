import { TemplateDetails } from '../interfaces/templateExtractPath.interface';
import { QuestionnaireResponse } from 'fhir/r4';
import { fhirPathEvaluate } from './fhirpathEvaluate';
import { createTemplateExtractPathMap, logTemplateExtractPaths } from './templateExtractPath';

export function populateIntoTemplate(
  questionnaireResponse: QuestionnaireResponse,
  templateMap: Map<string, TemplateDetails>
) {
  for (const [templateId, templateDetails] of templateMap.entries()) {
    const { templateResource, targetQRItemFhirPath } = templateDetails;

    // if (templateId === 'patTemplate') {
    if (true) {
      // Builds a map of FHIRPath expressions for templateExtractContexts and templateExtractValues
      const { templateExtractPathMap, walkTemplateWarnings } = createTemplateExtractPathMap(
        templateId,
        templateResource
      );

      logTemplateExtractPaths(templateId, templateExtractPathMap);

      // Note to add data type
      const debugTable: { entryPath: string; contextResult: any; valueResult: any }[] = [];
      for (const [entryPath, templateExtractPath] of templateExtractPathMap.entries()) {
        const { contextPathTuple, valuePathMap } = templateExtractPath;
        const contextExpression = contextPathTuple?.[1];

        // Context path exists, use contextExpression to frame evaluation scope
        if (contextExpression) {
          const combinedContextPath = targetQRItemFhirPath + '.' + contextExpression;
          const contextResult = fhirPathEvaluate({
            fhirData: questionnaireResponse,
            path: combinedContextPath
          });

          // Evaluate each valueExpression within the current template context
          for (const [, valueExpression] of valuePathMap.entries()) {
            const valueResult = fhirPathEvaluate({
              fhirData: contextResult,
              path: valueExpression
            });

            // Debugging
            debugTable.push({
              entryPath: entryPath,
              contextResult: contextResult,
              valueResult: valueResult
            });
          }
          continue;
        }

        // At this point, context path doesn't exists, evaluate each valueExpression directly
        for (const [valuePath, valueExpression] of valuePathMap.entries()) {
          const combinedValueExpression = targetQRItemFhirPath + '.' + valueExpression;
          const valueResult = fhirPathEvaluate({
            fhirData: questionnaireResponse,
            path: combinedValueExpression
          });

          // Debugging
          debugTable.push({
            entryPath: entryPath,
            contextResult: 'N/A',
            valueResult: valueResult
          });
        }
      }
      console.log(`\n🔢Template Extract Evaluation result for: ${templateId}`);
      console.table(debugTable);
    }
  }
}
