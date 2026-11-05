import type { Questionnaire } from 'fhir/r4';

const answerOption = (code: string, display: string) => ({
  valueCoding: { system: 'http://example.org/options', code, display }
});

const itemControl = (code: string) => ({
  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
  valueCodeableConcept: {
    coding: [{ system: 'http://hl7.org/fhir/questionnaire-item-control', code }]
  }
});

// Small generic questionnaire exercising writable, read-only and choice controls through the real
// renderer. Used for interaction-guard checks.
export const interactionQuestionnaire: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'toolkit-interaction',
  status: 'draft',
  item: [
    { linkId: 'plain-text', text: 'Plain text', type: 'string' },
    { linkId: 'locked-text', text: 'Locked text', type: 'string', readOnly: true },
    {
      linkId: 'locked-group',
      text: 'Locked group',
      type: 'group',
      readOnly: true,
      item: [{ linkId: 'nested-text', text: 'Nested text', type: 'string' }]
    },
    { linkId: 'plain-check', text: 'Plain check', type: 'boolean' },
    { linkId: 'locked-check', text: 'Locked check', type: 'boolean', readOnly: true },
    {
      linkId: 'plain-pet',
      text: 'Plain pet',
      type: 'choice',
      extension: [itemControl('radio-button')],
      answerOption: [answerOption('cat', 'Cat'), answerOption('dog', 'Dog')]
    },
    {
      linkId: 'locked-pet',
      text: 'Locked pet',
      type: 'choice',
      readOnly: true,
      extension: [itemControl('radio-button')],
      answerOption: [answerOption('cat', 'Cat'), answerOption('dog', 'Dog')]
    },
    {
      linkId: 'plain-toppings',
      text: 'Plain toppings',
      type: 'choice',
      extension: [itemControl('check-box')],
      answerOption: [answerOption('cheese', 'Cheese'), answerOption('olives', 'Olives')]
    },
    {
      linkId: 'plain-colour',
      text: 'Plain colour',
      type: 'choice',
      answerOption: [
        answerOption('red', 'Red'),
        answerOption('green', 'Green'),
        answerOption('blue', 'Blue')
      ]
    },
    {
      linkId: 'locked-colour',
      text: 'Locked colour',
      type: 'choice',
      readOnly: true,
      answerOption: [answerOption('red', 'Red'), answerOption('green', 'Green')]
    }
  ]
};
