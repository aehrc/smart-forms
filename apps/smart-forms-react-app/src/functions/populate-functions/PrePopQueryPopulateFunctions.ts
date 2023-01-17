import { Bundle, ParametersParameter, Patient, Questionnaire } from 'fhir/r5';
import Client from 'fhirclient/lib/Client';
import { constructContextParameters, getBatchResponse } from './PrepopulateFunctions';

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
 * Construct PrePopQuery context parameter from PrePopQuery bundle defined in the questionnaire's contained resources
 *
 * @author Sean Fong
 */
export async function constructPrePopQueryContextParameters(
  client: Client,
  patient: Patient,
  prePopQuery: Bundle
): Promise<ParametersParameter> {
  // replace all instances of patientId placeholder with patient id
  prePopQuery = replacePatientIdInstances(prePopQuery, patient);

  // perform batch query to CMS
  const batchResponse = await getBatchResponse(client, prePopQuery);

  // construct context parameters for PrePopQuery
  return constructContextParameters('PrePopQuery', batchResponse);
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
