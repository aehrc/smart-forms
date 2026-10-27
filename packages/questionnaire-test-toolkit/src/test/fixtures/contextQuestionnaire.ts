import type { Questionnaire } from 'fhir/r4';

const launchContext = (name: string, type: string) => ({
  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext',
  extension: [
    { url: 'name', valueCoding: { code: name } },
    { url: 'type', valueCode: type }
  ]
});

const calculatedExpression = (expression: string) => ({
  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression',
  valueExpression: { language: 'text/fhirpath', expression }
});

const initialExpression = (expression: string) => ({
  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
  valueExpression: { language: 'text/fhirpath', expression }
});

// Population fills initialExpression items; the renderer evaluates calculatedExpression items from
// the launch context on every build. Used to check that saved answers win over generated ones
// while context-dependent calculations still resolve.
export const contextQuestionnaire: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'toolkit-context',
  status: 'draft',
  extension: [
    launchContext('user', 'Practitioner'),
    launchContext('practitionerrole', 'PractitionerRole')
  ],
  item: [
    {
      linkId: 'user-initial',
      text: 'User initial',
      type: 'string',
      extension: [initialExpression('%user.name.family')]
    },
    {
      linkId: 'user-calc',
      text: 'User calc',
      type: 'string',
      extension: [calculatedExpression('%user.name.family')]
    },
    {
      linkId: 'role-calc',
      text: 'Role calc',
      type: 'string',
      extension: [calculatedExpression('%practitionerrole.location.reference')]
    }
  ]
};
