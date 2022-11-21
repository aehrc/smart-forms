import type { OperationOutcome, QuestionnaireResponse } from 'fhir/r5';
import type {
  PopulateOutputParameters,
  PopulateOutputParametersWithIssues,
  ResponseParameter
} from './Interfaces';

/**
 * Create output parameters as a response to be returned to the renderer. If they are issues, return with an issues parameter.
 *
 * @author Sean Fong
 */
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
