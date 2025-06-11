import type { InputParameters } from '../interfaces/inputParameters.interface';
import type { OutputParameters, TemplateExtractDebugInfo } from '../interfaces';
import type {
  FetchQuestionnaireCallback,
  FetchQuestionnaireRequestConfig
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
import { createFhirPathContext } from './createFhirPathContext';
import { filterResources } from './filterResources';

export async function extract(
  inputParameters: InputParameters | QuestionnaireResponse,
  fetchQuestionnaireCallback: FetchQuestionnaireCallback,
  fetchQuestionnaireRequestConfig: FetchQuestionnaireRequestConfig
): Promise<OutputParameters | OperationOutcome> {
  // Get QuestionnaireResponse from input parameters
  const questionnaireResponse = getQuestionnaireResponse(inputParameters);
  if (questionnaireResponse.resourceType === 'OperationOutcome') {
    // Return as FHIR OperationOutcome
    return questionnaireResponse;
  }

  // Get Questionnaire from input parameters or from QuestionnaireResponse.questionnaire
  const questionnaire = await fetchQuestionnaire(
    inputParameters,
    questionnaireResponse,
    fetchQuestionnaireCallback,
    fetchQuestionnaireRequestConfig
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

  // Create a fhirPathContext object that acts as envVars for fhirpath.evaluate
  const fhirPathContext = createFhirPathContext(questionnaireResponse, extractAllocateIds);

  // Evaluate and populate answers from questionnaireResponse into contained templates
  const { extractedResourceMap, populateIntoTemplateWarnings, templateIdToExtractPaths } =
    populateIntoTemplates(questionnaireResponse, containedTemplateMap, fhirPathContext);
  combinedWarnings.push(...populateIntoTemplateWarnings);

  // Filter out resources based on two criteria:
  // 1. Ensure FHIRPatch "value" part has value[x] field.
  // 2. If a comparison-source-response (i.e. a pre-populated questionnaireResponse) is provided, only include changes compared to that response.
  const filteredExtractedResourceMap = filterResources(
    extractedResourceMap,
    containedTemplateMap,
    templateIdToExtractPaths,
    fhirPathContext,
    inputParameters
  );

  // Build transaction bundle with extracted resources
  const { outputBundle, templateIdToExtractPathTuples } = buildTransactionBundle(
    filteredExtractedResourceMap,
    containedTemplateMap,
    templateIdToExtractPaths,
    fhirPathContext,
    questionnaireResponse
  );

  const customDebugInfo: TemplateExtractDebugInfo = {
    templateIdToExtractPathTuples: templateIdToExtractPathTuples
  };

  // Create output parameters
  return createOutputParameters(outputBundle, combinedWarnings, customDebugInfo);
}
