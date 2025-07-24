import type { Questionnaire } from 'fhir/r4';
import { canBeTemplateExtracted } from '@aehrc/sdc-template-extract';
import { canBeObservationExtracted } from '@aehrc/smart-forms-renderer';

export type SavingWriteBackMode = 'saving-only' | 'saving-write-back' | false;

export type ExtractMechanism = 'template-based' | 'observation-based' | null;

export function getExtractMechanism(sourceQuestionnaire: Questionnaire): ExtractMechanism {
  // Check if questionnaire can be template-based extracted
  if (canBeTemplateExtracted(sourceQuestionnaire)) {
    return 'template-based';
  }

  if (canBeObservationExtracted(sourceQuestionnaire)) {
    return 'observation-based';
  }

  return null;
}
