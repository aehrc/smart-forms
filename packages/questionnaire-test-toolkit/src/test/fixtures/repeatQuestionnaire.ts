import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';

const templateExtractValue = (valueString: string) => ({
  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
  valueString
});

const templateExtract = (reference: string) => ({
  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtract',
  extension: [{ url: 'template', valueReference: { reference } }]
});

// A minimal questionnaire with a repeating group and a plain string, each extracted into its own
// contained Observation template. Used for saved-response, repeat-survival and modified-only
// extraction checks.
export const repeatQuestionnaire: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'toolkit-repeat',
  status: 'draft',
  item: [
    {
      linkId: 'root',
      text: 'Root',
      type: 'group',
      extension: [templateExtract('#notes-observation-template')],
      item: [
        {
          linkId: 'medications',
          text: 'Medications',
          type: 'group',
          repeats: true,
          extension: [templateExtract('#med-observation-template')],
          item: [
            { linkId: 'med-name', text: 'Medication name', type: 'string' },
            { linkId: 'med-dose', text: 'Dose', type: 'string' }
          ]
        },
        { linkId: 'notes', text: 'Notes', type: 'string' }
      ]
    }
  ],
  contained: [
    {
      resourceType: 'Observation',
      id: 'med-observation-template',
      status: 'final',
      code: { text: 'Medication' },
      valueString: '',
      _valueString: {
        extension: [templateExtractValue("item.where(linkId='med-name').answer.value")]
      }
    },
    {
      resourceType: 'Observation',
      id: 'notes-observation-template',
      status: 'final',
      code: { text: 'Notes' },
      valueString: '',
      _valueString: {
        extension: [templateExtractValue("item.where(linkId='notes').answer.value")]
      }
    }
  ]
};

function buildSavedResponse(
  notes: string,
  medications: Array<[string, string]>
): QuestionnaireResponse {
  return {
    resourceType: 'QuestionnaireResponse',
    status: 'in-progress',
    item: [
      {
        linkId: 'root',
        text: 'Root',
        item: [
          ...medications.map(([name, dose]) => ({
            linkId: 'medications',
            text: 'Medications',
            item: [
              {
                linkId: 'med-name',
                text: 'Medication name',
                answer: [{ valueString: name }]
              },
              {
                linkId: 'med-dose',
                text: 'Dose',
                answer: [{ valueString: dose }]
              }
            ]
          })),
          {
            linkId: 'notes',
            text: 'Notes',
            answer: [{ valueString: notes }]
          }
        ]
      }
    ]
  };
}

export const savedResponseA: QuestionnaireResponse = buildSavedResponse('Baseline notes', [
  ['Paracetamol', '500mg'],
  ['Ibuprofen', '200mg']
]);

export const savedResponseB: QuestionnaireResponse = buildSavedResponse('Second notes', [
  ['Aspirin', '100mg']
]);
