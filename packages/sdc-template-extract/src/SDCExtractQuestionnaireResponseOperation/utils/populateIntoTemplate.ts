import { TemplateDetails } from '../interfaces/templateExtractPath.interface';
import { OperationOutcomeIssue, QuestionnaireResponse } from 'fhir/r4';
import { createTemplateExtractPathMap } from './templateExtractPath';
import { evaluateTemplateExtractPaths } from './evaluateTemplateExtractPath';
import { insertValuesToTemplate } from './templateInsert';

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

    // Builds a map of FHIRPath expressions for templateExtractContexts and templateExtractValues
    const { templateExtractPathMap, walkTemplateWarnings } = createTemplateExtractPathMap(
      templateId,
      templateResource
    );

    for (const [, templateExtractPath] of templateExtractPathMap.entries()) {
      evaluateTemplateExtractPaths(
        questionnaireResponse,
        targetQRItemFhirPath,
        templateExtractPath,
        extractAllocateIds,
        populateIntoTemplateWarnings
      );
    }

    insertValuesToTemplate(templateResource, templateExtractPathMap);
  }
}
