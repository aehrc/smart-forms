import type { Parameters } from 'fhir/r5';
import { assembleQuestionnaire } from './AssembleQuestionnaire';
import type {
  AssembleInputParameters,
  AssembleOutputParameters,
  AssembleOutputParametersWithIssues
} from './Interfaces';
import { createOutputParameters } from './CreateOutputParameters';
import { isQuestionnaireParameter } from './TypePredicates';

/**
 * Main function of this populate module.
 * Input and output specific parameters conformant to the SDC populate specification.
 *
 * @author Sean Fong
 */
export default async function assemble(
  parameters: AssembleInputParameters
): Promise<AssembleOutputParameters | AssembleOutputParametersWithIssues> {
  const masterQuestionnaire = parameters.parameter[0].resource;
  const allCanonicals: string[] = [];

  const assembledResult = await assembleQuestionnaire(masterQuestionnaire, allCanonicals);

  return createOutputParameters(assembledResult);
}

export function isAssembleInputParameters(
  parameters: Parameters
): parameters is AssembleInputParameters {
  return !!parameters.parameter?.find(isQuestionnaireParameter);
}
