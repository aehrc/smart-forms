import {Parameters, ParametersParameter, Reference} from 'fhir/r5';
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
import {PopulateInputParameters, PopulateOutputParameters, PatientParameter} from "./Interfaces";

function isPopulateInputParameters(parameters: Parameters): parameter is PopulateInputParameters {
  return !!parameters.parameter?.find(p => p.name === "patient" && p.resource?.resourceType === "Patient");
}

export default function sdcPopulate(parameters: PopulateInputParameters): PopulateOutputParameters {
  const parameterArr = parameters.parameter;

  const questionnaire = parameterArr.find(
    (parameter) => (parameter instanceof PatientParameter)
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
