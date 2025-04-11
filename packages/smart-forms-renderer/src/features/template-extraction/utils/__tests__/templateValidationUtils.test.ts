import { Questionnaire, Observation } from 'fhir/r4';
import { 
  verifyTemplateProfile, 
  extractTemplateObservations,
  validateBMITemplate,
  validateBloodPressureTemplate
} from '../templateValidationUtils';

describe('Template Validation Utils', () => {
  describe('Profile Verification', () => {
    it('should validate a questionnaire with correct profile', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        meta: {
          profile: ['http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-template']
        },
        extension: [{
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-template',
          valueBoolean: true
        }]
      };
      const result = verifyTemplateProfile(questionnaire);
      expect(result.isValid).toBe(true);
    });

    it('should fail validation for questionnaire without profile', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active'
      };
      const result = verifyTemplateProfile(questionnaire);
      expect(result.isValid).toBe(false);
      expect(result.error?.code).toBe('missing-profile');
    });

    it('should fail validation for questionnaire without template extension', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        meta: {
          profile: ['http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-template']
        }
      };
      const result = verifyTemplateProfile(questionnaire);
      expect(result.isValid).toBe(false);
      expect(result.error?.code).toBe('missing-profile');
    });
  });

  describe('Blood Pressure Template Validation', () => {
    const validBPQuestionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      id: 'bp-template',
      meta: {
        profile: ['http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-observationTemplate']
      },
      status: 'active',
      title: 'Blood Pressure Measurement',
      extension: [{
        url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-template',
        valueBoolean: true
      }],
      item: [
        {
          linkId: 'systolic',
          text: 'Systolic Blood Pressure (mmHg)',
          type: 'decimal',
          required: true,
          extension: [{
            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-observationTemplate',
            valueReference: {
              reference: '#obs-systolic'
            }
          }]
        },
        {
          linkId: 'diastolic',
          text: 'Diastolic Blood Pressure (mmHg)',
          type: 'decimal',
          required: true,
          extension: [{
            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-observationTemplate',
            valueReference: {
              reference: '#obs-diastolic'
            }
          }]
        }
      ],
      contained: [
        {
          resourceType: 'Observation',
          id: 'obs-systolic',
          status: 'final',
          code: {
            coding: [{
              system: 'http://loinc.org',
              code: '8480-6',
              display: 'Systolic blood pressure'
            }]
          },
          valueQuantity: {
            value: 0,
            unit: 'mmHg',
            system: 'http://unitsofmeasure.org',
            code: 'mmHg'
          }
        },
        {
          resourceType: 'Observation',
          id: 'obs-diastolic',
          status: 'final',
          code: {
            coding: [{
              system: 'http://loinc.org',
              code: '8462-4',
              display: 'Diastolic blood pressure'
            }]
          },
          valueQuantity: {
            value: 0,
            unit: 'mmHg',
            system: 'http://unitsofmeasure.org',
            code: 'mmHg'
          }
        }
      ]
    };

    it('should validate a correct blood pressure template', () => {
      const result = extractTemplateObservations(validBPQuestionnaire);
      expect(result.isValid).toBe(true);
      expect(result.templates).toHaveLength(2);
      expect(result.templates?.[0].code?.coding?.[0].code).toBe('8480-6');
      expect(result.templates?.[1].code?.coding?.[0].code).toBe('8462-4');
    });

    it('should not validate blood pressure template as BMI template', () => {
      const result = validateBMITemplate(validBPQuestionnaire);
      expect(result.isValid).toBe(false);
      expect(result.error?.code).toBe('invalid-bmi-template');
    });

    it('should fail validation for blood pressure template missing systolic observation', () => {
      const invalidBPQuestionnaire = {
        ...validBPQuestionnaire,
        contained: validBPQuestionnaire.contained?.filter(
          obs => obs.resourceType !== 'Observation' || obs.code?.coding?.[0]?.code !== '8480-6'
        )
      };
      const result = validateBloodPressureTemplate(invalidBPQuestionnaire);
      expect(result.isValid).toBe(false);
      expect(result.error?.code).toBe('invalid-bp-template');
      expect(result.error?.message).toContain('systolic');
    });

    it('should fail validation for blood pressure template missing diastolic observation', () => {
      const invalidBPQuestionnaire = {
        ...validBPQuestionnaire,
        contained: validBPQuestionnaire.contained?.filter(
          obs => obs.resourceType !== 'Observation' || obs.code?.coding?.[0]?.code !== '8462-4'
        )
      };
      const result = validateBloodPressureTemplate(invalidBPQuestionnaire);
      expect(result.isValid).toBe(false);
      expect(result.error?.code).toBe('invalid-bp-template');
      expect(result.error?.message).toContain('diastolic');
    });

    it('should fail validation for blood pressure template missing systolic item', () => {
      const invalidBPQuestionnaire = {
        ...validBPQuestionnaire,
        item: validBPQuestionnaire.item?.filter(item => item.linkId !== 'systolic')
      };
      const result = validateBloodPressureTemplate(invalidBPQuestionnaire);
      expect(result.isValid).toBe(false);
      expect(result.error?.code).toBe('invalid-bp-template');
      expect(result.error?.message).toContain('systolic');
    });

    it('should fail validation for blood pressure template missing diastolic item', () => {
      const invalidBPQuestionnaire = {
        ...validBPQuestionnaire,
        item: validBPQuestionnaire.item?.filter(item => item.linkId !== 'diastolic')
      };
      const result = validateBloodPressureTemplate(invalidBPQuestionnaire);
      expect(result.isValid).toBe(false);
      expect(result.error?.code).toBe('invalid-bp-template');
      expect(result.error?.message).toContain('diastolic');
    });
  });
}); 