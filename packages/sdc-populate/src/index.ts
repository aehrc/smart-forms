import questionnaireMbs715 from './resources/715.R4.json';
import patient from '../src/resources/patient.json';
import batchResponse from '../src/resources/batchresponse.json';
import { Questionnaire } from 'fhir/r5';
import { readInitialExpressions } from './ReadInitialExpressions';
import { constructResponse } from './ConstructQuestionnaireResponse';
import { evaluateInitialExpressions } from './EvaulateInitialExpressions';

export function populate() {
  const questionnaire = questionnaireMbs715 as Questionnaire;
  const context: any = { LaunchPatient: patient, PrePopQuery: batchResponse };

  let initialExpressions = readInitialExpressions(questionnaire);
  initialExpressions = evaluateInitialExpressions(initialExpressions, context);

  return constructResponse(questionnaire, initialExpressions);
}
