import { bloodPressureProcessor } from '../templateProcessors/bloodPressureProcessor';
import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';

describe('Blood Pressure Template Processing', () => {
  const bpQuestionnaire: Questionnaire = {
    resourceType: 'Questionnaire',
    id: 'bp-calc-template',
    meta: {
      profile: ['http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-observationTemplate']
    },
    extension: [{
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-template',
      valueBoolean: true
    }],
    status: 'active',
    title: 'Blood Pressure Measurement',
    item: [
      {
        linkId: 'systolic',
        text: 'Systolic Blood Pressure',
        type: 'integer',
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
        text: 'Diastolic Blood Pressure',
        type: 'integer',
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
          unit: 'mm[Hg]',
          system: 'http://unitsofmeasure.org',
          code: 'mm[Hg]'
        },
        extension: [{
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
          valueString: "item.where(linkId='systolic').answer.valueInteger"
        }]
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
          unit: 'mm[Hg]',
          system: 'http://unitsofmeasure.org',
          code: 'mm[Hg]'
        },
        extension: [{
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
          valueString: "item.where(linkId='diastolic').answer.valueInteger"
        }]
      }
    ]
  };

  it('should process systolic blood pressure observation correctly', async () => {
    const response: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'completed',
      item: [
        {
          linkId: 'systolic',
          answer: [{ valueInteger: 120 }]
        }
      ]
    };

    const observations = await bloodPressureProcessor.process(bpQuestionnaire, response);
    expect(observations).toHaveLength(1);
    expect(observations[0].code?.coding?.[0].code).toBe('8480-6');
    expect(observations[0].valueQuantity?.value).toBe(120);
    expect(observations[0].valueQuantity?.unit).toBe('mm[Hg]');
  });

  it('should process diastolic blood pressure observation correctly', async () => {
    const response: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'completed',
      item: [
        {
          linkId: 'diastolic',
          answer: [{ valueInteger: 80 }]
        }
      ]
    };

    const observations = await bloodPressureProcessor.process(bpQuestionnaire, response);
    expect(observations).toHaveLength(1);
    expect(observations[0].code?.coding?.[0].code).toBe('8462-4');
    expect(observations[0].valueQuantity?.value).toBe(80);
    expect(observations[0].valueQuantity?.unit).toBe('mm[Hg]');
  });

  it('should process both systolic and diastolic blood pressure observations', async () => {
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

    const observations = await bloodPressureProcessor.process(bpQuestionnaire, response);
    expect(observations).toHaveLength(2);
    
    const systolicObs = observations.find(obs => obs.code?.coding?.[0].code === '8480-6');
    expect(systolicObs?.valueQuantity?.value).toBe(120);
    expect(systolicObs?.valueQuantity?.unit).toBe('mm[Hg]');

    const diastolicObs = observations.find(obs => obs.code?.coding?.[0].code === '8462-4');
    expect(diastolicObs?.valueQuantity?.value).toBe(80);
    expect(diastolicObs?.valueQuantity?.unit).toBe('mm[Hg]');
  });

  it('should handle missing values gracefully', async () => {
    const response: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'completed',
      item: [
        {
          linkId: 'systolic',
          answer: [{ valueInteger: 120 }]
        }
      ]
    };

    const observations = await bloodPressureProcessor.process(bpQuestionnaire, response);
    expect(observations).toHaveLength(1);
    expect(observations[0].code?.coding?.[0].code).toBe('8480-6');
  });
}); 