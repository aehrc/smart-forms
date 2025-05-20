import { v4 as uuidv4 } from 'uuid';
import { Questionnaire } from 'fhir/r4';

export function allocateIdsForExtract(questionnaire: Questionnaire): Map<string, string> {
  const extractAllocateIds = getExtractAllocateIds(questionnaire);
  const extractAllocateIdMap = new Map<string, string>();

  for (const extractAllocateId of extractAllocateIds) {
    extractAllocateIdMap.set(extractAllocateId, uuidv4());
  }

  return extractAllocateIdMap;
}

/**
 * Returns all extractAllocateId values from the questionnaire.
 */
export function getExtractAllocateIds(questionnaire: Questionnaire): string[] {
  return (
    questionnaire.extension
      ?.filter(
        (ext) =>
          ext.url ===
          'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-extractAllocateId'
      )
      .map((ext) => ext.valueString)
      .filter((v): v is string => typeof v === 'string') ?? []
  );
}
