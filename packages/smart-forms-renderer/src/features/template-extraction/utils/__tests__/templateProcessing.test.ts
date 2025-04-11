import { processTemplateObservations } from '../templateProcessingUtils';
import type { Questionnaire, QuestionnaireResponse, Observation } from 'fhir/r4';
import { SDC_TEMPLATE_EXTRACTION_PROFILE } from '../templateValidationUtils';

const SDC_TEMPLATE_EXTENSION_URL = 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-template';

describe('Template Processing Scenarios', () => {
  describe('Scenario 1: Blood Pressure Template - Flat Structure', () => {
    it('should process blood pressure with systolic and diastolic at root level', async () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        id: 'bp-test',
        status: 'active',
        meta: {
          profile: [SDC_TEMPLATE_EXTRACTION_PROFILE]
        },
        extension: [{
          url: SDC_TEMPLATE_EXTENSION_URL,
          valueBoolean: true
        }],
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
                  valueString: "item.where(linkId='systolic').answer.valueInteger"
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
                  valueString: "item.where(linkId='diastolic').answer.valueInteger"
                }]
              }
            ]
          }
        ],
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
      };

      const response: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'completed',
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
      };

      const result = await processTemplateObservations(questionnaire, response);
      expect(result.observations).toHaveLength(1);
      expect(result.observations[0].component).toHaveLength(2);
      expect(result.observations[0].component![0].valueInteger).toBe(120);
      expect(result.observations[0].component![1].valueInteger).toBe(80);
    });
  });

  describe('Scenario 2: Blood Pressure Template - Nested Structure', () => {
    it('should process blood pressure with systolic and diastolic within a group', async () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        id: 'nested-bp-test',
        status: 'active',
        meta: {
          profile: [SDC_TEMPLATE_EXTRACTION_PROFILE]
        },
        extension: [{
          url: SDC_TEMPLATE_EXTENSION_URL,
          valueBoolean: true
        }],
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

      const response: QuestionnaireResponse = {
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

      const result = await processTemplateObservations(questionnaire, response);
      expect(result.observations).toHaveLength(1);
      expect(result.observations[0].component).toHaveLength(2);
      expect(result.observations[0].component![0].valueInteger).toBe(120);
      expect(result.observations[0].component![1].valueInteger).toBe(80);
    });
  });

  describe('Scenario 3: BMI Calculator Template - Flat Structure', () => {
    it('should process BMI calculation with height, weight, and BMI at root level', async () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        id: 'bmi-test',
        status: 'active',
        meta: {
          profile: [SDC_TEMPLATE_EXTRACTION_PROFILE]
        },
        extension: [{
          url: SDC_TEMPLATE_EXTENSION_URL,
          valueBoolean: true
        }],
        contained: [
          {
            resourceType: 'Observation',
            id: 'height-obs',
            status: 'final',
            code: {
              coding: [{
                system: 'http://loinc.org',
                code: '8302-2',
                display: 'Body height'
              }]
            }
          },
          {
            resourceType: 'Observation',
            id: 'weight-obs',
            status: 'final',
            code: {
              coding: [{
                system: 'http://loinc.org',
                code: '29463-7',
                display: 'Body weight'
              }]
            }
          },
          {
            resourceType: 'Observation',
            id: 'bmi-obs',
            status: 'final',
            code: {
              coding: [{
                system: 'http://loinc.org',
                code: '39156-5',
                display: 'Body mass index'
              }]
            }
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
                text: 'Height (cm)',
                type: 'decimal',
                extension: [{
                  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-observationTemplate',
                  valueReference: { reference: '#height-obs' }
                }]
              },
              {
                linkId: 'patient-weight',
                text: 'Weight (kg)',
                type: 'decimal',
                extension: [{
                  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-observationTemplate',
                  valueReference: { reference: '#weight-obs' }
                }]
              },
              {
                linkId: 'bmi-result',
                text: 'BMI',
                type: 'decimal',
                readOnly: true,
                extension: [{
                  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-observationTemplate',
                  valueReference: { reference: '#bmi-obs' }
                }]
              }
            ]
          }
        ]
      };

      const response: QuestionnaireResponse = {
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
                answer: [{ valueQuantity: { value: 24.2, unit: 'kg/m^2' } }]
              }
            ]
          }
        ]
      };

      const result = await processTemplateObservations(questionnaire, response);
      expect(result.observations).toHaveLength(3);
      expect(result.observations[0].valueQuantity?.value).toBe(170);
      expect(result.observations[1].valueQuantity?.value).toBe(70);
      expect(result.observations[2].valueQuantity?.value).toBe(24.2);
    });
  });

  describe('Scenario 4: BMI Calculator Template - Nested Structure', () => {
    it('should process BMI calculation with height, weight, and BMI within a group', async () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        id: 'nested-bmi-test',
        status: 'active',
        meta: {
          profile: [SDC_TEMPLATE_EXTRACTION_PROFILE]
        },
        extension: [{
          url: SDC_TEMPLATE_EXTENSION_URL,
          valueBoolean: true
        }],
        contained: [
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
            extension: [{
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-fhirPath',
              valueString: "item.where(linkId='bmi-calculation').item.where(linkId='bmi-result').answer.valueQuantity"
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
                linkId: 'height',
                text: 'Height (cm)',
                type: 'decimal'
              },
              {
                linkId: 'weight',
                text: 'Weight (kg)',
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

      const response: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'completed',
        item: [
          {
            linkId: 'bmi-calculation',
            item: [
              {
                linkId: 'height',
                answer: [{ valueDecimal: 170 }]
              },
              {
                linkId: 'weight',
                answer: [{ valueDecimal: 70 }]
              },
              {
                linkId: 'bmi-result',
                answer: [{ valueQuantity: { value: 24.2, unit: 'kg/m^2' } }]
              }
            ]
          }
        ]
      };

      const result = await processTemplateObservations(questionnaire, response);
      expect(result.observations).toHaveLength(1);
      expect(result.observations[0].valueQuantity?.value).toBe(24.2);
    });
  });

  describe('Scenario 5: Error Handling - Invalid FHIRPath', () => {
    it('should handle invalid FHIRPath expressions gracefully', async () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        id: 'invalid-test',
        status: 'active',
        meta: {
          profile: [SDC_TEMPLATE_EXTRACTION_PROFILE]
        },
        extension: [{
          url: SDC_TEMPLATE_EXTENSION_URL,
          valueBoolean: true
        }],
        contained: [
          {
            resourceType: 'Observation',
            id: 'invalid-template',
            status: 'final',
            code: {
              coding: [{
                system: 'http://loinc.org',
                code: 'test',
                display: 'Test'
              }]
            },
            extension: [{
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-fhirPath',
              valueString: "invalid expression"
            }]
          }
        ],
        item: [
          {
            linkId: 'test',
            text: 'Test',
            type: 'string'
          }
        ]
      };

      const response: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'completed',
        item: [
          {
            linkId: 'test',
            answer: [{ valueString: 'test' }]
          }
        ]
      };

      const result = await processTemplateObservations(questionnaire, response);
      expect(result.observations).toHaveLength(0);
      expect(result.errors).toBeDefined();
      expect(result.errors![0].code).toBe('INVALID_EXPRESSION');
    });
  });

  describe('Scenario 6: Error Handling - Missing Answers', () => {
    it('should handle missing answers gracefully', async () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        id: 'missing-test',
        status: 'active',
        meta: {
          profile: [SDC_TEMPLATE_EXTRACTION_PROFILE]
        },
        extension: [{
          url: SDC_TEMPLATE_EXTENSION_URL,
          valueBoolean: true
        }],
        contained: [
          {
            resourceType: 'Observation',
            id: 'missing-template',
            status: 'final',
            code: {
              coding: [{
                system: 'http://loinc.org',
                code: 'test',
                display: 'Test'
              }]
            },
            extension: [{
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-fhirPath',
              valueString: "item.where(linkId='test').answer.valueString"
            }]
          }
        ],
        item: [
          {
            linkId: 'test',
            text: 'Test',
            type: 'string'
          }
        ]
      };

      const response: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'completed',
        item: [
          {
            linkId: 'test'
          }
        ]
      };

      const result = await processTemplateObservations(questionnaire, response);
      expect(result.observations).toHaveLength(0);
      expect(result.errors).toBeDefined();
      expect(result.errors![0].code).toBe('MISSING_ANSWER');
    });
  });
}); 