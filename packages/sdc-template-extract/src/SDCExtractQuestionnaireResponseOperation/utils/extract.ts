import type { InputParameters } from '../interfaces/inputParameters.interface';
import type { OutputParameters, TemplateExtractDebugInfo } from '../interfaces';
import type {
  FetchQuestionnaireCallback,
  FetchQuestionnaireRequestConfig
} from '../interfaces/callback.interface';
import type {
  FhirResource,
  OperationOutcome,
  OperationOutcomeIssue,
  QuestionnaireResponse
} from 'fhir/r4';
import { getQuestionnaireResponse } from './getQuestionnaireResponse';
import { fetchQuestionnaire } from './fetchQuestionnaire';
import { createErrorOutcome, createWarningOutcomeWithInvalid } from './operationOutcome';
import { canBeTemplateExtracted, collectTemplateExtractRefs } from './templateExtractRef';
import { createContainedTemplateMap } from './templateMap';
import { populateIntoTemplates } from './populateIntoTemplates';
import { allocateIdsForExtract } from './extractAllocateId';
import { buildTransactionBundle } from './buildBundle';
import { createOutputParameters } from './createOutputParameters';
import { createFhirPathContext } from './createFhirPathContext';
import { getComparisonSourceResponse } from './getComparisonSourceResponse';

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

  // Check if questionnaire can be template-extracted
  if (!canBeTemplateExtracted(questionnaire)) {
    return createWarningOutcomeWithInvalid(
      `Questionnaire does not contain any "sdc-questionnaire-templateExtract" extensions. Skipping extraction.`
    );
  }

  // Check if questionnaire.contained is provided and not empty
  if (!questionnaire.contained || questionnaire.contained.length === 0) {
    return createWarningOutcomeWithInvalid(
      `Questionnaire.contained is empty, an extraction template should be provided as a contained resource. Skipping extraction.`
    );
  }

  // Check if questionnaireResponse.item is provided and not empty
  if (!questionnaireResponse.item || questionnaireResponse.item.length === 0) {
    return createWarningOutcomeWithInvalid(
      `QuestionnaireResponse.item is empty, there are no answers to process. Skipping extraction.`
    );
  }

  const combinedWarnings: OperationOutcomeIssue[] = [];

  // Get extract templates from questionnaire and all its items
  const { templateExtractRefMap: linkIdToTemplateExtractRefMap, templateExtractRefWarnings } =
    collectTemplateExtractRefs(questionnaire);
  if (linkIdToTemplateExtractRefMap.size === 0) {
    return createWarningOutcomeWithInvalid(
      `Questionnaire does not contain any "sdc-questionnaire-templateExtract" extensions. Skipping extraction.`
    );
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

  // If a comparison-source-response is provided, use it for comparisons during the filtering process
  // We run another evaluation + populate step, but for comparisonSourceResponse to generate a comparisonResourceMap
  const comparisonSourceResponse = getComparisonSourceResponse(inputParameters);
  let comparisonResourceMap: Map<string, FhirResource[]> | null = null;
  if (comparisonSourceResponse) {
    comparisonResourceMap = populateIntoTemplates(
      comparisonSourceResponse,
      containedTemplateMap,
      fhirPathContext
    ).extractedResourceMap;
  }

  // Build transaction bundle with extracted resources
  const { outputBundle, templateIdToExtractPathTuples } = buildTransactionBundle(
    extractedResourceMap,
    comparisonResourceMap,
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
