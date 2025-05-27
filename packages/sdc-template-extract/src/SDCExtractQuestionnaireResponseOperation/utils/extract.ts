import type { InputParameters } from '../interfaces/inputParameters.interface';
import type { OutputParameters, TemplateExtractDebugInfo } from '../interfaces';
import type {
  FetchResourceCallback,
  FetchResourceRequestConfig
} from '../interfaces/callback.interface';
import type { OperationOutcome, OperationOutcomeIssue, QuestionnaireResponse } from 'fhir/r4';
import { getQuestionnaireResponse } from './getQuestionnaireResponse';
import { fetchQuestionnaire } from './fetchQuestionnaire';
import { createErrorOutcome, createInvalidWarningIssue } from './operationOutcome';
import { collectTemplateExtractRefs } from './templateExtractRef';
import { createContainedTemplateMap } from './templateMap';
import { populateIntoTemplates } from './populateIntoTemplates';
import { allocateIdsForExtract } from './extractAllocateId';
import { buildTransactionBundle } from './buildBundle';
import { createOutputParameters } from './createOutputParameters';

export async function extract(
  parameters: InputParameters | QuestionnaireResponse,
  fetchResourceCallback: FetchResourceCallback,
  fetchResourceRequestConfig: FetchResourceRequestConfig
): Promise<OutputParameters | OperationOutcome> {
  // Get QuestionnaireResponse from input parameters
  const questionnaireResponse = getQuestionnaireResponse(parameters);
  if (questionnaireResponse.resourceType === 'OperationOutcome') {
    // Return as FHIR OperationOutcome
    return questionnaireResponse;
  }

  // Get Questionnaire from input parameters or from QuestionnaireResponse.questionnaire
  const questionnaire = await fetchQuestionnaire(
    parameters,
    questionnaireResponse,
    fetchResourceCallback,
    fetchResourceRequestConfig
  );
  if (questionnaire.resourceType === 'OperationOutcome') {
    // Return as FHIR OperationOutcome
    return questionnaire;
  }

  // set extractAllocateIds to UUIDs
  const extractAllocateIds = allocateIdsForExtract(questionnaire);

  // Validation
  if (!questionnaire.item || questionnaire.item.length === 0) {
    return createErrorOutcome(`Questionnaire.item is empty, there are no items to process`);
  }

  if (!questionnaire.contained || questionnaire.contained.length === 0) {
    return createErrorOutcome(
      `Questionnaire.contained is empty, an extraction template should be provided as a contained resource`
    );
  }

  if (!questionnaireResponse.item || questionnaireResponse.item.length === 0) {
    return createErrorOutcome(
      `QuestionnaireResponse.item is empty, there are no answers to process`
    );
  }

  const combinedWarnings: OperationOutcomeIssue[] = [];

  // Get extract templates from questionnaire and all its items
  const { templateExtractRefMap: linkIdToTemplateExtractRefMap, templateExtractRefWarnings } =
    collectTemplateExtractRefs(questionnaire);
  if (linkIdToTemplateExtractRefMap.size === 0) {
    return {
      resourceType: 'OperationOutcome',
      issue: [
        createInvalidWarningIssue(
          'No "sdc-questionnaire-templateExtract" extension found in the questionnaire, skipping extraction'
        )
      ]
    };
  }
  combinedWarnings.push(...templateExtractRefWarnings);

  // Create a template details map with details like templateResource, targetLinkId, targetQItem, targetQRItem (if available)
  const containedTemplateMap = createContainedTemplateMap(
    questionnaire,
    questionnaireResponse,
    linkIdToTemplateExtractRefMap
  );

  // Populate answers from questionnaireResponse into contained templates
  const { extractedResourceMap, populateIntoTemplateWarnings, templateIdToExtractPaths } =
    populateIntoTemplates(questionnaireResponse, containedTemplateMap, extractAllocateIds);
  combinedWarnings.push(...populateIntoTemplateWarnings);

  // Build transaction bundle with extracted resources
  const { outputBundle, templateIdToExtractPathTuples } = buildTransactionBundle(
    extractedResourceMap,
    containedTemplateMap,
    extractAllocateIds,
    templateIdToExtractPaths
  );

  const customDebugInfo: TemplateExtractDebugInfo = {
    templateIdToExtractPathTuples: templateIdToExtractPathTuples
  };

  // Create output parameters
  return createOutputParameters(outputBundle, combinedWarnings, customDebugInfo);
}
