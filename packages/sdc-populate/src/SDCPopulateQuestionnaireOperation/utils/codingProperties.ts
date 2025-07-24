import type { Coding } from 'fhir/r4';

/**
 * Retrieves only the relevant properties of a Coding object.
 * Reason: https://tx.ontoserver.csiro.au/fhir returns a Coding with designation element, which is not in the FHIR spec, causing QRs with it to fail validation.
 *
 * @author Sean Fong
 */
export function getRelevantCodingProperties(coding: Coding): Coding {
  return {
    system: coding.system,
    code: coding.code,
    display: coding.display,
    ...(coding.extension && { extension: coding.extension })
  };
}
