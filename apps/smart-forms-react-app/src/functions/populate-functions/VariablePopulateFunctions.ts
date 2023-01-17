import {
  Bundle,
  BundleEntry,
  Extension,
  ParametersParameter,
  Patient,
  Questionnaire
} from 'fhir/r5';
import Client from 'fhirclient/lib/Client';
import UUID from 'uuidjs';
import { constructContextParameters, getBatchResponse } from './PrepopulateFunctions';

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
 * Construct variables context parameter from x-fhir-queries defined in the questionnaire's extensions
 *
 * @author Sean Fong
 */
export async function constructVariablesContextParameters(
  client: Client,
  patient: Patient,
  variables: Extension[]
): Promise<ParametersParameter> {
  // replace all instances of patientId placeholder with patient id
  variables = replacePatientIdInstances(variables, patient);

  // construct and perform batch query to CMS
  const batchQuery = constructBatchQuery(variables);
  let batchResponse = await getBatchResponse(client, batchQuery);

  // Assign original names of variables to batch response variables
  batchResponse = assignVariableNamesToBundleResources(batchResponse, variables);

  // construct context parameters for PrePopQuery
  return constructContextParameters('Variables', batchResponse);
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

function assignVariableNamesToBundleResources(bundle: Bundle, variables: Extension[]): Bundle {
  bundle.entry?.forEach((entry, i) => {
    const variable = variables[i];
    if (entry.resource && variable && variable.valueExpression) {
      entry.resource.id = variable.valueExpression.name;
    }
  });

  return bundle;
}
