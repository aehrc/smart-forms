import { flattenQuestionnaire, updateTemplateExpressions } from '../questionnaireFlatteningUtils';
import type { Questionnaire, Observation } from 'fhir/r4';

describe('Questionnaire Flattening Utils', () => {
  it('should flatten nested blood pressure questionnaire', () => {
    const nestedBpQuestionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      id: 'nested-bp-test',
      status: 'active',
      item: [
        {
          linkId: 'bp',
          text: 'Blood Pressure',
          type: 'group',
          item: [
            {
              linkId: 'systolic',
              text: 'Systolic',
              type: 'integer'
            },
            {
              linkId: 'diastolic',
              text: 'Diastolic',
              type: 'integer'
            }
          ]
        }
      ]
    };

    const flattened = flattenQuestionnaire(nestedBpQuestionnaire);
    expect(flattened.item).toHaveLength(2);
    expect(flattened.item?.[0].linkId).toBe('bp-systolic');
    expect(flattened.item?.[1].linkId).toBe('bp-diastolic');
  });

  it('should flatten nested BMI calculator questionnaire', () => {
    const nestedBmiQuestionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      id: 'nested-bmi-test',
      status: 'active',
      item: [
        {
          linkId: 'bmi-calculation',
          text: 'BMI Calculation',
          type: 'group',
          item: [
            {
              linkId: 'patient-height',
              text: 'Height',
              type: 'decimal'
            },
            {
              linkId: 'patient-weight',
              text: 'Weight',
              type: 'decimal'
            },
            {
              linkId: 'bmi-result',
              text: 'BMI',
              type: 'decimal',
              readOnly: true
            }
          ]
        }
      ]
    };

    const flattened = flattenQuestionnaire(nestedBmiQuestionnaire);
    expect(flattened.item).toHaveLength(3);
    expect(flattened.item?.[0].linkId).toBe('bmi-calculation-patient-height');
    expect(flattened.item?.[1].linkId).toBe('bmi-calculation-patient-weight');
    expect(flattened.item?.[2].linkId).toBe('bmi-calculation-bmi-result');
  });

  it('should update template expressions for flattened structure', () => {
    const bpTemplate: Observation = {
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
        }
      ]
    };

    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      id: 'test',
      status: 'active',
      contained: [bpTemplate]
    };

    const updated = updateTemplateExpressions(questionnaire);
    const updatedTemplate = updated.contained?.[0] as Observation;
    expect(updatedTemplate.component?.[0].extension?.[0].valueString)
      .toBe("item.where(linkId='bp-systolic').answer.valueInteger");
  });

  it('should handle deeply nested questionnaires', () => {
    const deeplyNestedQuestionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      id: 'deeply-nested-test',
      status: 'active',
      item: [
        {
          linkId: 'group1',
          text: 'Group 1',
          type: 'group',
          item: [
            {
              linkId: 'group2',
              text: 'Group 2',
              type: 'group',
              item: [
                {
                  linkId: 'field1',
                  text: 'Field 1',
                  type: 'string'
                }
              ]
            }
          ]
        }
      ]
    };

    const flattened = flattenQuestionnaire(deeplyNestedQuestionnaire);
    expect(flattened.item).toHaveLength(1);
    expect(flattened.item?.[0].linkId).toBe('group1-group2-field1');
  });
}); 