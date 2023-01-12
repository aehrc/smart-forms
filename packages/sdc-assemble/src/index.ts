import type { OperationOutcome, Questionnaire } from 'fhir/r5';
import { assembleQuestionnaire } from './AssembleQuestionnaire';
import type { AssembleInputParameters } from './Interfaces';

/**
 * Main function of this populate module.
 * Input and output specific parameters conformant to the SDC populate specification.
 *
 * @author Sean Fong
 */
export default async function assemble(
  parameters: AssembleInputParameters
): Promise<Questionnaire | OperationOutcome> {
  const masterQuestionnaire = parameters.parameter[0].resource;
  // const masterQuestionnaire = Master as Questionnaire;
  const allCanonicals: string[] = [];

  return await assembleQuestionnaire(masterQuestionnaire, allCanonicals);
}
