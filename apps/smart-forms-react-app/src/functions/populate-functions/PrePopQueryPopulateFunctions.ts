import { Bundle, Patient, Questionnaire } from 'fhir/r5';
import Client from 'fhirclient/lib/Client';
import { getBatchResponse } from './PrepopulateFunctions';

/**
 * Get pre-population query bundle from the questionnaire's contained resources
 *
 * @author Sean Fong
 */
export function getPrePopQuery(questionnaire: Questionnaire): Bundle | null {
  if (!questionnaire.contained || questionnaire.contained.length === 0) return null;

  for (const entry of questionnaire.contained) {
    if (entry.resourceType === 'Bundle' && entry.id === 'PrePopQuery') {
      return entry;
    }
  }

  return null;
}

/**
 * Retrieve a batch response from PrePopQuery defined in the questionnaire's contained resources
 *
 * @author Sean Fong
 */
export function getBatchResponseFromPrePopQuery(
  client: Client,
  patient: Patient,
  prePopQuery: Bundle
): Promise<Bundle> {
  prePopQuery = replacePatientIdInstances(prePopQuery, patient);
  return getBatchResponse(client, prePopQuery);
}

/**
 * Replace patientId variable instances in batch query entries with CMS Patient ID
 *
 * @author Sean Fong
 */
function replacePatientIdInstances(batchQuery: Bundle, patient: Patient): Bundle {
  if (batchQuery.entry) {
    batchQuery.entry.forEach((entry) => {
      if (entry.request && patient.id)
        entry.request.url = entry.request.url.replace('{{%patient.id}}', patient.id);
    });
  }
  return { ...batchQuery };
}
