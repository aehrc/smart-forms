import type { Questionnaire } from 'fhir/r4';
import { canBeTemplateExtracted } from '@aehrc/sdc-template-extract';

export type SavingWriteBackMode = 'saving-only' | 'saving-write-back' | false;

export type ExtractMechanism = 'template-based' | 'observation' | null;

export function getExtractMechanism(sourceQuestionnaire: Questionnaire): ExtractMechanism {
  // Check if questionnaire can be template-based extracted
  if (canBeTemplateExtracted(sourceQuestionnaire)) {
    return 'template-based';
  }

  // FIXME implement canBeObservationExtracted
  // if (canBeObservationExtracted(sourceQuestionnaire)) {
  //   return 'observation';
  // }

  return null;
}
