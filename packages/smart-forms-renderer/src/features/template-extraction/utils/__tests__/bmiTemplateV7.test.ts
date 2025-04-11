import { processBMITemplate } from '../templateProcessors/bmiProcessor';
import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import fs from 'fs';
import path from 'path';

describe('BMI Template V7 Processing', () => {
  let bmiTemplate: Questionnaire;

  beforeAll(() => {
    // Read the v7 template file
    const templatePath = path.join(__dirname, '../../../../../JSON_sample/bmiTemplate_v7.json');
    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    bmiTemplate = JSON.parse(templateContent);
  });

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

    const observations = await processBMITemplate(bmiTemplate, response);
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

    const observations = await processBMITemplate(bmiTemplate, response);
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

    const observations = await processBMITemplate(bmiTemplate, response);
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

    const observations = await processBMITemplate(bmiTemplate, response);
    expect(observations).toHaveLength(1);
    expect(observations[0].code?.coding?.[0].code).toBe('8302-2');
  });

  it('should handle invalid FHIRPath expressions gracefully', async () => {
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

    // Create a modified template with an invalid FHIRPath expression
    const modifiedTemplate = JSON.parse(JSON.stringify(bmiTemplate));
    const bmiObs = modifiedTemplate.contained.find((obs: any) => obs.id === 'obs-bmi-result');
    if (bmiObs) {
      bmiObs.extension[0].valueString = 'invalid-expression';
    }

    const observations = await processBMITemplate(modifiedTemplate, response);
    expect(observations).toHaveLength(1);
    expect(observations[0].code?.coding?.[0].code).toBe('8302-2');
  });
}); 