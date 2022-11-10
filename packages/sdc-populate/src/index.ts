import { Parameters } from 'fhir/r5';
import { readInitialExpressions } from './ReadInitialExpressions';
import { constructResponse } from './ConstructQuestionnaireResponse';
import { evaluateInitialExpressions } from './EvaulateInitialExpressions';
import {
  createInvalidParametersIssue,
  createInvalidPatientIssue,
  createInvalidQueryIssue,
  createInvalidQuestionnaireIssue
} from './CreateIssues';
import { createParameters } from './CreateParameters';

export function sdcPopulate(parameters: Parameters) {
  const parameterArr = parameters.parameter;
  if (!parameterArr) return createInvalidParametersIssue();

  const questionnaire = parameterArr.find(
    (parameter) => parameter.name === 'questionnaire'
  )?.resource;
  const patient = parameterArr.find((parameter) => parameter.name === 'patient')?.resource;
  const query = parameterArr.find((parameter) => parameter.name === 'query')?.resource;

  if (!questionnaire || !patient || !query) return createInvalidParametersIssue();
  if (questionnaire.resourceType !== 'Questionnaire') return createInvalidQuestionnaireIssue();
  if (patient.resourceType !== 'Patient') return createInvalidPatientIssue();
  if (query.resourceType !== 'Bundle') return createInvalidQueryIssue();

  let initialExpressions = readInitialExpressions(questionnaire);
  initialExpressions = evaluateInitialExpressions(initialExpressions, {
    LaunchPatient: patient,
    PrePopQuery: query
  });

  const questionnaireResponse = constructResponse(questionnaire, initialExpressions);

  return createParameters({
    name: 'QuestionnaireResponse',
    resource: questionnaireResponse
  });
}
