import Master from './resources/master-questionnaire.json';
import type { OperationOutcome, Questionnaire } from 'fhir/r5';
import { assembleQuestionnaire } from './AssembleQuestionnaire';

/**
 * Main function of this populate module.
 * Input and output specific parameters conformant to the SDC populate specification.
 *
 * @author Sean Fong
 */
export default async function assemble(): Promise<Questionnaire | OperationOutcome> {
  const masterQuestionnaire = Master as Questionnaire;
  const allCanonicals: string[] = [];

  return await assembleQuestionnaire(masterQuestionnaire, allCanonicals);
}
