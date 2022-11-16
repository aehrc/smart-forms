import { OperationOutcome, QuestionnaireResponse } from 'fhir/r5';
import {
  PopulateOutputParameters,
  PopulateOutputParametersWithIssues,
  ResponseParameter
} from './Interfaces';

export function createOutputParameters(
  questionnaireResponse: QuestionnaireResponse,
  issue?: OperationOutcome
): PopulateOutputParameters | PopulateOutputParametersWithIssues {
  const responseParameter: ResponseParameter = {
    name: 'response',
    resource: questionnaireResponse
  };

  if (issue) {
    return {
      resourceType: 'Parameters',
      parameter: [
        responseParameter,
        {
          name: 'issues',
          resource: issue
        }
      ]
    };
  } else {
    return {
      resourceType: 'Parameters',
      parameter: [responseParameter]
    };
  }
}
