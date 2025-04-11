import { processTemplateObservations } from '../templateProcessingUtils';
import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import { SDC_TEMPLATE_EXTRACTION_PROFILE } from '../templateValidationUtils';

describe('Nested Template Processing', () => {
  it('should process nested blood pressure template', async () => {
    const nestedBpQuestionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      id: 'nested-bp-test',
      meta: {
        profile: [SDC_TEMPLATE_EXTRACTION_PROFILE]
      },
      status: 'active',
      contained: [
        {
          resourceType: 'Observation',
          id: 'bp-template',
          status: 'final',
          code: {
            coding: [{
              system: 'http://loinc.org',
              code: '85354-9',
              display: 'Blood pressure panel'
            }]
          },
          component: [
            {
              code: {
                coding: [{
                  system: 'http://loinc.org',
                  code: '8480-6',
                  display: 'Systolic blood pressure'
                }]
              },
              extension: [{
                url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-fhirPath',
                valueString: "item.where(linkId='bp').item.where(linkId='systolic').answer.valueInteger"
              }]
            },
            {
              code: {
                coding: [{
                  system: 'http://loinc.org',
                  code: '8462-4',
                  display: 'Diastolic blood pressure'
                }]
              },
              extension: [{
                url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-fhirPath',
                valueString: "item.where(linkId='bp').item.where(linkId='diastolic').answer.valueInteger"
              }]
            }
          ]
        }
      ],
      item: [
        {
          linkId: 'bp',
          text: 'Blood Pressure',
          type: 'group',
          item: [
            {
              linkId: 'systolic',
              text: 'Systolic',
              type: 'integer',
              extension: [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-observationTemplate',
                  valueReference: {
                    reference: '#bp-template'
                  }
                }
              ]
            },
            {
              linkId: 'diastolic',
              text: 'Diastolic',
              type: 'integer',
              extension: [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-observationTemplate',
                  valueReference: {
                    reference: '#bp-template'
                  }
                }
              ]
            }
          ]
        }
      ]
    };

    const questionnaireResponse: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'completed',
      item: [
        {
          linkId: 'bp',
          item: [
            {
              linkId: 'systolic',
              answer: [{ valueInteger: 120 }]
            },
            {
              linkId: 'diastolic',
              answer: [{ valueInteger: 80 }]
            }
          ]
        }
      ]
    };

    const result = await processTemplateObservations(nestedBpQuestionnaire, questionnaireResponse);
    expect(result.observations).toHaveLength(1);
    expect(result.errors).toBeUndefined();

    // Check blood pressure observation
    const bpObs = result.observations[0];
    expect(bpObs.code?.coding?.[0].code).toBe('85354-9');
    expect(bpObs.component).toHaveLength(2);
    expect(bpObs.component?.[0].code?.coding?.[0].code).toBe('8480-6');
    expect(bpObs.component?.[1].code?.coding?.[0].code).toBe('8462-4');
    expect(bpObs.component?.[0].valueInteger).toBe(120);
    expect(bpObs.component?.[1].valueInteger).toBe(80);
  });

  it('should process nested BMI calculator template', async () => {
    const nestedBmiQuestionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      id: 'nested-bmi-test',
      meta: {
        profile: [SDC_TEMPLATE_EXTRACTION_PROFILE]
      },
      status: 'active',
      contained: [
        {
          resourceType: 'Observation',
          id: 'height-template',
          status: 'final',
          code: {
            coding: [{
              system: 'http://loinc.org',
              code: '8302-2',
              display: 'Body height'
            }]
          },
          valueQuantity: {
            unit: 'cm'
          },
          extension: [{
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-fhirPath',
            valueString: "item.where(linkId='bmi-calculation').item.where(linkId='patient-height').answer.valueDecimal"
          }]
        },
        {
          resourceType: 'Observation',
          id: 'weight-template',
          status: 'final',
          code: {
            coding: [{
              system: 'http://loinc.org',
              code: '29463-7',
              display: 'Body weight'
            }]
          },
          valueQuantity: {
            unit: 'kg'
          },
          extension: [{
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-fhirPath',
            valueString: "item.where(linkId='bmi-calculation').item.where(linkId='patient-weight').answer.valueDecimal"
          }]
        },
        {
          resourceType: 'Observation',
          id: 'bmi-template',
          status: 'final',
          code: {
            coding: [{
              system: 'http://loinc.org',
              code: '39156-5',
              display: 'Body mass index'
            }]
          },
          valueQuantity: {
            unit: 'kg/m2'
          },
          extension: [{
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-fhirPath',
            valueString: "item.where(linkId='bmi-calculation').item.where(linkId='bmi-result').answer.valueDecimal"
          }]
        }
      ],
      item: [
        {
          linkId: 'bmi-calculation',
          text: 'BMI Calculation',
          type: 'group',
          item: [
            {
              linkId: 'patient-height',
              text: 'Height',
              type: 'decimal',
              extension: [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-observationTemplate',
                  valueReference: {
                    reference: '#height-template'
                  }
                }
              ]
            },
            {
              linkId: 'patient-weight',
              text: 'Weight',
              type: 'decimal',
              extension: [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-observationTemplate',
                  valueReference: {
                    reference: '#weight-template'
                  }
                }
              ]
            },
            {
              linkId: 'bmi-result',
              text: 'BMI',
              type: 'decimal',
              readOnly: true,
              extension: [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-observationTemplate',
                  valueReference: {
                    reference: '#bmi-template'
                  }
                }
              ]
            }
          ]
        }
      ]
    };

    const questionnaireResponse: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'completed',
      item: [
        {
          linkId: 'bmi-calculation',
          item: [
            {
              linkId: 'patient-height',
              answer: [{ valueDecimal: 170 }]
            },
            {
              linkId: 'patient-weight',
              answer: [{ valueDecimal: 70 }]
            },
            {
              linkId: 'bmi-result',
              answer: [{ valueDecimal: 24.2 }]
            }
          ]
        }
      ]
    };

    const result = await processTemplateObservations(nestedBmiQuestionnaire, questionnaireResponse);
    expect(result.observations).toHaveLength(3);
    expect(result.errors).toBeUndefined();

    // Check height observation
    const heightObs = result.observations.find(obs => obs.code?.coding?.[0].code === '8302-2');
    expect(heightObs?.valueQuantity?.value).toBe(170);
    expect(heightObs?.valueQuantity?.unit).toBe('cm');

    // Check weight observation
    const weightObs = result.observations.find(obs => obs.code?.coding?.[0].code === '29463-7');
    expect(weightObs?.valueQuantity?.value).toBe(70);
    expect(weightObs?.valueQuantity?.unit).toBe('kg');

    // Check BMI observation
    const bmiObs = result.observations.find(obs => obs.code?.coding?.[0].code === '39156-5');
    expect(bmiObs?.valueQuantity?.value).toBe(24.2);
    expect(bmiObs?.valueQuantity?.unit).toBe('kg/m2');
  });
}); 