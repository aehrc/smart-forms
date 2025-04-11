import { processBMITemplate } from '../templateProcessors/bmiProcessor';
import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';

describe('BMI Template Processing', () => {
  const bmiQuestionnaire: Questionnaire = {
    resourceType: 'Questionnaire',
    id: 'bmi-calc-template',
    meta: {
      profile: ['http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-observationTemplate']
    },
    status: 'active',
    title: 'BMI Calculator',
    item: [
      {
        linkId: 'height',
        text: 'Height (in meters)',
        type: 'decimal',
        required: true
      },
      {
        linkId: 'weight',
        text: 'Weight (in kilograms)',
        type: 'decimal',
        required: true
      }
    ],
    contained: [
      {
        resourceType: 'Observation',
        id: 'obs-height',
        status: 'final',
        code: {
          coding: [{
            system: 'http://loinc.org',
            code: '8302-2',
            display: 'Body height'
          }]
        },
        valueQuantity: {
          value: 0,
          unit: 'm',
          system: 'http://unitsofmeasure.org',
          code: 'm'
        },
        extension: [{
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
          valueString: "item.where(linkId='height').answer.value"
        }]
      },
      {
        resourceType: 'Observation',
        id: 'obs-weight',
        status: 'final',
        code: {
          coding: [{
            system: 'http://loinc.org',
            code: '29463-7',
            display: 'Weight'
          }]
        },
        valueQuantity: {
          value: 0,
          unit: 'kg',
          system: 'http://unitsofmeasure.org',
          code: 'kg'
        },
        extension: [{
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
          valueString: "item.where(linkId='weight').answer.value"
        }]
      },
      {
        resourceType: 'Observation',
        id: 'obs-bmi-result',
        status: 'final',
        code: {
          coding: [{
            system: 'http://snomed.info/sct',
            code: '60621009',
            display: 'Body mass index'
          }]
        },
        valueQuantity: {
          value: 0,
          unit: 'kg/m2',
          system: 'http://unitsofmeasure.org',
          code: 'kg/m2'
        },
        extension: [{
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
          valueString: "item.where(linkId='weight').answer.value / (item.where(linkId='height').answer.value * item.where(linkId='height').answer.value)"
        }]
      }
    ]
  };

  it('should process height observation correctly', async () => {
    const response: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'completed',
      item: [
        {
          linkId: 'height',
          answer: [{ valueDecimal: 1.75 }]
        }
      ]
    };

    const observations = await processBMITemplate(bmiQuestionnaire, response);
    expect(observations).toHaveLength(1);
    expect(observations[0].code?.coding?.[0].code).toBe('8302-2');
    expect(observations[0].valueQuantity?.value).toBe(1.75);
    expect(observations[0].valueQuantity?.unit).toBe('m');
  });

  it('should process weight observation correctly', async () => {
    const response: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'completed',
      item: [
        {
          linkId: 'weight',
          answer: [{ valueDecimal: 70 }]
        }
      ]
    };

    const observations = await processBMITemplate(bmiQuestionnaire, response);
    expect(observations).toHaveLength(1);
    expect(observations[0].code?.coding?.[0].code).toBe('29463-7');
    expect(observations[0].valueQuantity?.value).toBe(70);
    expect(observations[0].valueQuantity?.unit).toBe('kg');
  });

  it('should process both height and weight observations and calculate BMI', async () => {
    const response: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'completed',
      item: [
        {
          linkId: 'height',
          answer: [{ valueDecimal: 1.75 }]
        },
        {
          linkId: 'weight',
          answer: [{ valueDecimal: 70 }]
        }
      ]
    };

    const observations = await processBMITemplate(bmiQuestionnaire, response);
    expect(observations).toHaveLength(3);
    
    const heightObs = observations.find(obs => obs.code?.coding?.[0].code === '8302-2');
    expect(heightObs?.valueQuantity?.value).toBe(1.75);
    expect(heightObs?.valueQuantity?.unit).toBe('m');

    const weightObs = observations.find(obs => obs.code?.coding?.[0].code === '29463-7');
    expect(weightObs?.valueQuantity?.value).toBe(70);
    expect(weightObs?.valueQuantity?.unit).toBe('kg');

    const bmiObs = observations.find(obs => obs.code?.coding?.[0].code === '60621009');
    expect(bmiObs?.valueQuantity?.value).toBeCloseTo(22.86, 2); // 70 / (1.75 * 1.75)
    expect(bmiObs?.valueQuantity?.unit).toBe('kg/m2');
  });

  it('should handle missing values gracefully', async () => {
    const response: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'completed',
      item: [
        {
          linkId: 'height',
          answer: [{ valueDecimal: 1.75 }]
        }
      ]
    };

    const observations = await processBMITemplate(bmiQuestionnaire, response);
    expect(observations).toHaveLength(1);
    expect(observations[0].code?.coding?.[0].code).toBe('8302-2');
  });
}); 