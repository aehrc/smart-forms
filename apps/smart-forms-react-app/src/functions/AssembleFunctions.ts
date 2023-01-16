import { Extension, Parameters, Questionnaire } from 'fhir/r5';
import assemble, { isAssembleInputParameters } from 'sdc-assemble';
import Client from 'fhirclient/lib/Client';

export function assemblyIsRequired(questionnaire: Questionnaire): boolean {
  return !!questionnaire.extension?.find(
    (extension: Extension) =>
      extension.url ===
        'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-assemble-expectation' &&
      extension.valueCode === 'assemble-root'
  );
}

function defineAssembleParameters(questionnaire: Questionnaire): Parameters {
  return {
    resourceType: 'Parameters',
    parameter: [
      {
        name: 'questionnaire',
        resource: questionnaire
      }
    ]
  };
}

export async function assembleQuestionnaire(questionnaire: Questionnaire): Promise<Questionnaire> {
  const parameters = defineAssembleParameters(questionnaire);
  if (isAssembleInputParameters(parameters)) {
    const outputAssembleParams = await assemble(parameters);
    if (outputAssembleParams.parameter[0].resource.resourceType === 'Questionnaire') {
      return outputAssembleParams.parameter[0].resource;
    } else {
      console.log('Assemble fail');
      console.log(outputAssembleParams.parameter[0].resource);
    }
  }

  return questionnaire;
}

export function updateAssembledQuestionnaire(client: Client, questionnaire: Questionnaire) {
  const headers = {
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/json+fhir; charset=UTF-8'
  };

  return client.request({
    url: `Questionnaire/${questionnaire.id}`,
    method: 'PUT',
    body: JSON.stringify(questionnaire),
    headers: headers
  });
}
