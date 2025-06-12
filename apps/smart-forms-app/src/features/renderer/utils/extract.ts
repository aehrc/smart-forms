import type { Questionnaire, StructureMap } from 'fhir/r4';
import { canBeTemplateExtracted } from '@aehrc/sdc-template-extract';

export type ExtractMechanism = 'template-based' | 'structured-map' | null;

export function getExtractMechanism(
  sourceQuestionnaire: Questionnaire,
  structuredMapExtractMap: StructureMap | null
): 'template-based' | 'structured-map' | null {
  // Check if questionnaire can be template-based extracted
  if (canBeTemplateExtracted(sourceQuestionnaire)) {
    return 'template-based';
  }

  if (!!structuredMapExtractMap) {
    return 'structured-map';
  }

  return null;
}
