import { Bundle, BundleEntry, Extension, Patient, Questionnaire } from 'fhir/r5';
import Client from 'fhirclient/lib/Client';
import UUID from 'uuidjs';
import { getBatchResponse } from './PrepopulateFunctions';

/**
 * Filter x-fhir-query variables from questionnaire's extensions needed for population
 *
 * @author Sean Fong
 */
export function getXFhirQueryVariables(questionnaire: Questionnaire): Extension[] | null {
  if (!questionnaire.extension || questionnaire.extension.length === 0) return null;

  return questionnaire.extension.filter(
    (extension: Extension) =>
      extension.url === 'http://hl7.org/fhir/StructureDefinition/variable' &&
      extension.valueExpression?.language === 'application/x-fhir-query'
  );
}

/**
 * Retrieve a batch response from the x-fhir-queries defined in the questionnaire's extensions
 *
 * @author Sean Fong
 */
export function getBatchResponseFromVariables(
  client: Client,
  patient: Patient,
  variables: Extension[]
): Promise<Bundle> {
  // replace all instances of patientId placeholder with patient id
  variables = replacePatientIdInstances(variables, patient);

  const batchQuery = constructBatchQuery(variables);
  return getBatchResponse(client, batchQuery);
}

/**
 * Replace patientId variable instances in variables with CMS Patient ID
 *
 * @author Sean Fong
 */
function replacePatientIdInstances(variables: Extension[], patient: Patient): Extension[] {
  variables.forEach((variable) => {
    if (variable.valueExpression && variable.valueExpression.expression && patient.id) {
      variable.valueExpression.expression = variable.valueExpression.expression.replace(
        '{{%patient.id}}',
        patient.id
      );
    }
  });

  return variables;
}

/**
 * Construct a batch query from x-fhir-query variables
 *
 * @author Sean Fong
 */
function constructBatchQuery(variables: Extension[]): Bundle {
  const entries: BundleEntry[] = [];

  for (const variable of variables) {
    if (variable.valueExpression && variable.valueExpression.expression) {
      const bundleEntry: BundleEntry = {
        fullUrl: UUID.genV4().urn,
        request: {
          method: 'GET',
          url: variable.valueExpression.expression
        }
      };
      entries.push(bundleEntry);
    }
  }

  return {
    resourceType: 'Bundle',
    id: 'PrePopQuery',
    type: 'batch',
    entry: entries
  };
}
