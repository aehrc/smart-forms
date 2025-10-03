import { Questionnaire } from 'fhir/r4';

export const qAutocompletePerformanceTest: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'AutocompletePerformanceTest',
  name: 'AutocompletePerformanceTest',
  title: 'Autocomplete Performance Test - Demonstrates QR Update Issue',
  version: '1.0.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2025-01-27',
  url: 'https://smartforms.csiro.au/docs/performance/autocomplete-test',
  item: [
    {
      linkId: 'test-section',
      text: 'Performance Test Section',
      type: 'group',
      item: [
        {
          linkId: 'open-choice-autocomplete',
          text: 'Open Choice Autocomplete (Updates QR on every keystroke)',
          type: 'open-choice',
          required: true,
          answerValueSet: 'https://clinicaltables.nlm.nih.gov/fhir/R4/ValueSet/icd10cm',
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/terminology-server',
              valueUrl: 'https://clinicaltables.nlm.nih.gov/fhir/R4'
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
              valueCodeableConcept: {
                coding: [
                  {
                    system: 'http://hl7.org/fhir/questionnaire-item-control',
                    code: 'autocomplete'
                  }
                ]
              }
            }
          ]
        },
        {
          linkId: 'choice-autocomplete',
          text: 'Choice Autocomplete (Updates QR on every keystroke)',
          type: 'choice',
          required: true,
          answerValueSet: 'https://clinicaltables.nlm.nih.gov/fhir/R4/ValueSet/icd10cm',
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/terminology-server',
              valueUrl: 'https://clinicaltables.nlm.nih.gov/fhir/R4'
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
              valueCodeableConcept: {
                coding: [
                  {
                    system: 'http://hl7.org/fhir/questionnaire-item-control',
                    code: 'autocomplete'
                  }
                ]
              }
            }
          ]
        },
        {
          linkId: 'string-field',
          text: 'String Field (Properly debounced - 300ms delay)',
          type: 'string',
          required: true
        },
        {
          linkId: 'text-field',
          text: 'Text Field (Properly debounced - 300ms delay)',
          type: 'text',
          required: true
        }
      ]
    }
  ]
};
