import { Extension, Questionnaire } from 'fhir/r5';

export function getXFhirQueryVariables(questionnaire: Questionnaire): Extension[] {
  if (!questionnaire.extension || questionnaire.extension.length === 0) return [];

  const xFhirQueryVariables = questionnaire.extension.filter(
    (extension: Extension) =>
      extension.url === 'http://hl7.org/fhir/StructureDefinition/variable' &&
      extension.valueExpression?.language === 'application/x-fhir-query'
  );

  console.log(xFhirQueryVariables);

  return xFhirQueryVariables;
}
