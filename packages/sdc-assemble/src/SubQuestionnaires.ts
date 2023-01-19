import type { Bundle, OperationOutcome, Questionnaire } from 'fhir/r5';
import { client } from 'fhirclient';
import { createOperationOutcome } from './index';

import SQ715AboutTheHealthCheck from './resources/subquestionnaires/Questionnaire-715AboutTheHealthCheck.json';
import SQ715Consent from './resources/subquestionnaires/Questionnaire-715Consent.json';
import SQ715PatientDetails from './resources/subquestionnaires/Questionnaire-715PatientDetails.json';
import SQ715AssessmentCurrentPriorities from './resources/subquestionnaires/Questionnaire-715AssessmentCurrentPriorities.json';
import SQ715AssessmentMedicalHistory from './resources/subquestionnaires/Questionnaire-715AssessmentMedicalHistory.json';
import SQ715AssessmentRegularMedications from './resources/subquestionnaires/Questionnaire-715AssessmentRegularMedications.json';
import SQ715AssessmentAllergiesAdverseReactions from './resources/subquestionnaires/Questionnaire-715AssessmentAllergiesAdverseReactions.json';
import SQ715AssessmentFamilyHistory from './resources/subquestionnaires/Questionnaire-715AssessmentFamilyHistory.json';
import SQ715AssessmentSocialAndEmotionalWellbeing from './resources/subquestionnaires/Questionnaire-715AssessmentSocialAndEmotionalWellbeing.json';
import SQ715AssessmentSocialHistoryChild from './resources/subquestionnaires/Questionnaire-715AssessmentSocialHistoryChild.json';
import SQ715AssessmentHomeAndFamily from './resources/subquestionnaires/Questionnaire-715AssessmentHomeAndFamily.json';
import SQ715AssessmentLearningAndDevelopment from './resources/subquestionnaires/Questionnaire-715AssessmentLearningAndDevelopment.json';
import SQ715AssessmentLearningAndWork from './resources/subquestionnaires/Questionnaire-715AssessmentLearningAndWork.json';
import SQ715AssessmentMood from './resources/subquestionnaires/Questionnaire-715AssessmentMood.json';
import SQ715AssessmentMemoryAndThinking from './resources/subquestionnaires/Questionnaire-715AssessmentMemoryAndThinking.json';
import SQ715AssessmentChronicDiseaseAgeing from './resources/subquestionnaires/Questionnaire-715AssessmentChronicDiseaseAgeing.json';
import SQ715AssessmentScreeningPrograms from './resources/subquestionnaires/Questionnaire-715AssessmentScreeningPrograms.json';
import SQ715AssessmentHealthyEating from './resources/subquestionnaires/Questionnaire-715AssessmentHealthyEating.json';
import SQ715AssessmentPhysicalActivityAndScreenTime from './resources/subquestionnaires/Questionnaire-715AssessmentPhysicalActivityAndScreenTime.json';
import SQ715AssessmentSubstanceUse from './resources/subquestionnaires/Questionnaire-715AssessmentSubstanceUse.json';
import SQ715AssessmentGambling from './resources/subquestionnaires/Questionnaire-715AssessmentGambling.json';
import SQ715AssessmentSexualHealth from './resources/subquestionnaires/Questionnaire-715AssessmentSexualHealth.json';
import SQ715AssessmentEyeHealth from './resources/subquestionnaires/Questionnaire-715AssessmentEyeHealth.json';
import SQ715AssessmentEarHealthAndHearing from './resources/subquestionnaires/Questionnaire-715AssessmentEarHealthAndHearing.json';
import SQ715AssessmentOralAndDentalHealth from './resources/subquestionnaires/Questionnaire-715AssessmentOralAndDentalHealth.json';
import SQ715AssessmentSkin from './resources/subquestionnaires/Questionnaire-715AssessmentSkin.json';
import SQ715AssessmentImmunisation from './resources/subquestionnaires/Questionnaire-715AssessmentImmunisation.json';
import SQ715AssessmentExamination from './resources/subquestionnaires/Questionnaire-715AssessmentExamination.json';
import SQ715AssessmentAbsoluteCVDRiskCalculation from './resources/subquestionnaires/Questionnaire-715AssessmentAbsoluteCVDRiskCalculation.json';
import SQ715AssessmentInvestigations from './resources/subquestionnaires/Questionnaire-715AssessmentInvestigations.json';
import SQ715FinalisingHealthCheck from './resources/subquestionnaires/Questionnaire-715FinalisingHealthCheck.json';

export function getCanonicalUrls(
  parentQuestionnaire: Questionnaire,
  allCanonicals: string[]
): string[] | OperationOutcome {
  if (
    !parentQuestionnaire.item ||
    !parentQuestionnaire.item[0] ||
    !parentQuestionnaire.item[0].item
  )
    return createOperationOutcome('Master questionnaire does not have a valid item.');

  const subquestionnaireCanonicals = [];

  for (const item of parentQuestionnaire.item[0].item) {
    const extensions = item.extension;
    if (!extensions) continue;

    // Check if item has a subquestionnaire extension
    let isSubquestionnaire = false;
    let subquestionnaireCanonicalUrl = '';
    for (const extension of extensions) {
      extension.url;
      if (
        extension.url ===
          'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-subQuestionnaire' &&
        extension.valueCanonical
      ) {
        isSubquestionnaire = true;
        subquestionnaireCanonicalUrl = extension.valueCanonical;
        break;
      }
    }

    // Proceed to next item if subquestionnaire extension is not present
    if (!isSubquestionnaire) continue;

    // Check for duplicate canonicals to prevent a circular dependency situation
    if (allCanonicals.includes(subquestionnaireCanonicalUrl)) {
      return createOperationOutcome(
        parentQuestionnaire.id +
          ' contains a circular dependency on the questionnaire ' +
          subquestionnaireCanonicalUrl
      );
    }

    subquestionnaireCanonicals.push(subquestionnaireCanonicalUrl);
  }

  // Remove all subquestionnaire-items from master questionnaire
  // parentQuestionnaire.item[0].item = [];
  return subquestionnaireCanonicals;
}

export async function fetchSubquestionnaires(canonicalUrls: string[]) {
  // ONLY FOR TESTING
  const subquestionnairesSourceIsLocal = true; // change this to false to use remote subquestionnaires
  if (subquestionnairesSourceIsLocal) {
    return loadSubquestionnairesFromLocal();
  }

  // Gather all promises to be executed at once
  const promises = [];

  // Test on a single questionnaire
  if (canonicalUrls[0]) {
    promises.push(fetchQuestionnaireByCanonical(canonicalUrls[0]));
  }

  // Fetch all questionnaires
  // for (const canonicalUrl of canonicalUrls) {
  //   promises.push(fetchQuestionnaireByCanonical(canonicalUrl));
  // }

  const resources = await Promise.all(promises);

  const subquestionnaires = [];
  for (const [i, resource] of resources.entries()) {
    if (resource.resourceType === 'Bundle') {
      if (!resource.entry || !resource.entry[0]) {
        return createOperationOutcome('Unable to fetch questionnaire ' + canonicalUrls[i] + '.');
      }

      const subquestionnaire = resource.entry[0].resource;
      if (!subquestionnaire || subquestionnaire.resourceType !== 'Questionnaire') {
        return createOperationOutcome('Unable to fetch questionnaire ' + canonicalUrls[i] + '.');
      }
      subquestionnaires.push(subquestionnaire);
    } else {
      return resource.resourceType === 'OperationOutcome'
        ? resource
        : createOperationOutcome('Unable to fetch questionnaire ' + canonicalUrls[i] + '.');
    }
  }

  return subquestionnaires;
}

async function fetchQuestionnaireByCanonical(
  canonicalUrl: string
): Promise<Bundle | OperationOutcome> {
  // TODO temporarily specify form server url
  const serverUrl = 'https://launch.smarthealthit.org/v/r4/fhir';

  const headers = {
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/json+fhir; charset=UTF-8',
    Accept: 'application/json+fhir; charset=utf-8'
  };

  // FIXME version search i.e. "|0.1.0" doesnt work on SMART Health IT, remove version temporarily
  const canonicalUrlWithoutVersion = canonicalUrl.slice(0, -6);

  return client(serverUrl).request({
    url: `Questionnaire?url=${canonicalUrlWithoutVersion}`,
    method: 'GET',
    headers: headers
  });
}

/**
 * FOR TESTING ONLY
 * Loads local subquestionnaires and returns them as an array of questionnaireResponses
 *
 * To add local questionnaires to list:
 * 1. Move questionnaire file to src/data/resources
 * 2. Import file at the beginning of this file
 *    i.e. import SQNew from './resources/subquestionnaires/QuestionnaireNew.json';
 *
 * 3. Add imported questionnaire in localFiles array below
 *    i.e. const subquestionnaires = [
 *            SQ715AboutTheHealthCheck,
 *            SQ715Consent,
 *            SQ715PatientDetails,
 *            SQ715AssessmentCurrentPriorities,
 *            SQNew
 *         ] as Questionnaire[];
 *
 * 4. Change of value of subquestionnairesSourceIsLocal to true on line 94.
 *    If it is already set to true, skip this step.
 *
 * 5. In your terminal, cd to <project dir>/packages/sdc-assemble.
 *    Run "npm run build" to compile the project.
 *
 * 6. Your changes will now be reflected in the renderer app.
 *
 * @author Sean Fong
 */
export function loadSubquestionnairesFromLocal() {
  const subquestionnaires = [
    SQ715AboutTheHealthCheck,
    SQ715Consent,
    SQ715PatientDetails,
    SQ715AssessmentCurrentPriorities,
    SQ715AssessmentMedicalHistory,
    SQ715AssessmentRegularMedications,
    SQ715AssessmentAllergiesAdverseReactions,
    SQ715AssessmentFamilyHistory,
    SQ715AssessmentSocialAndEmotionalWellbeing,
    SQ715AssessmentSocialHistoryChild,
    SQ715AssessmentHomeAndFamily,
    SQ715AssessmentLearningAndDevelopment,
    SQ715AssessmentLearningAndWork,
    SQ715AssessmentMood,
    SQ715AssessmentMemoryAndThinking,
    SQ715AssessmentChronicDiseaseAgeing,
    SQ715AssessmentScreeningPrograms,
    SQ715AssessmentHealthyEating,
    SQ715AssessmentPhysicalActivityAndScreenTime,
    SQ715AssessmentSubstanceUse,
    SQ715AssessmentGambling,
    SQ715AssessmentSexualHealth,
    SQ715AssessmentEyeHealth,
    SQ715AssessmentEarHealthAndHearing,
    SQ715AssessmentOralAndDentalHealth,
    SQ715AssessmentSkin,
    SQ715AssessmentImmunisation,
    SQ715AssessmentExamination,
    SQ715AssessmentAbsoluteCVDRiskCalculation,
    SQ715AssessmentInvestigations,
    SQ715FinalisingHealthCheck
  ] as Questionnaire[];

  return subquestionnaires;
}
