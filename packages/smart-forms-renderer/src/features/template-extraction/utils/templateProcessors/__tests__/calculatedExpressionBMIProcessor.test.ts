import { Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import { processCalculatedExpressionBMITemplate } from '../calculatedExpressionBMIProcessor';
import { qCalculatedExpressionBMICalculatorPrepop } from '../../../../../stories/assets/questionnaires/QFormPopulation';

describe('Calculated Expression BMI Template Processing', () => {
  it('should process height, weight and BMI observations correctly', async () => {
    const response: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'completed',
      item: [
        {
          linkId: 'bmi-calculation',
          item: [
            {
              linkId: 'patient-height',
              answer: [{ valueDecimal: 180 }]
            },
            {
              linkId: 'patient-weight',
              answer: [{ valueDecimal: 75 }]
            },
            {
              linkId: 'bmi-result',
              answer: [{ valueDecimal: 23.1 }]
            }
          ]
        }
      ]
    };

    const result = await processCalculatedExpressionBMITemplate(qCalculatedExpressionBMICalculatorPrepop, response);
    const observations = result.observations;

    expect(observations).toHaveLength(3);
    expect(observations[0].code.coding?.[0].code).toBe('8302-2');
    expect(observations[0].valueQuantity?.value).toBe(180);
    expect(observations[1].code.coding?.[0].code).toBe('29463-7');
    expect(observations[1].valueQuantity?.value).toBe(75);
    expect(observations[2].code.coding?.[0].code).toBe('39156-5');
    expect(observations[2].valueQuantity?.value).toBe(23.1);
  });

  it('should handle missing height value', async () => {
    const response: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'completed',
      item: [
        {
          linkId: 'bmi-calculation',
          item: [
            {
              linkId: 'patient-weight',
              answer: [{ valueDecimal: 75 }]
            },
            {
              linkId: 'bmi-result',
              answer: [{ valueDecimal: 23.1 }]
            }
          ]
        }
      ]
    };

    const result = await processCalculatedExpressionBMITemplate(qCalculatedExpressionBMICalculatorPrepop, response);
    const observations = result.observations;

    expect(observations).toHaveLength(1);
    expect(observations[0].code.coding?.[0].code).toBe('29463-7');
    expect(observations[0].valueQuantity?.value).toBe(75);
  });

  it('should handle missing weight value', async () => {
    const response: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'completed',
      item: [
        {
          linkId: 'bmi-calculation',
          item: [
            {
              linkId: 'patient-height',
              answer: [{ valueDecimal: 180 }]
            },
            {
              linkId: 'bmi-result',
              answer: [{ valueDecimal: 23.1 }]
            }
          ]
        }
      ]
    };

    const result = await processCalculatedExpressionBMITemplate(qCalculatedExpressionBMICalculatorPrepop, response);
    const observations = result.observations;

    expect(observations).toHaveLength(1);
    expect(observations[0].code.coding?.[0].code).toBe('8302-2');
    expect(observations[0].valueQuantity?.value).toBe(180);
  });

  it('should handle empty response', async () => {
    const response: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'completed',
      item: []
    };

    const result = await processCalculatedExpressionBMITemplate(qCalculatedExpressionBMICalculatorPrepop, response);
    const observations = result.observations;

    expect(observations).toHaveLength(0);
  });

  it('should handle invalid questionnaire without templates', async () => {
    const invalidQuestionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      id: 'invalid',
      status: 'draft',
      item: []
    };

    const response: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'completed',
      item: []
    };

    const result = await processCalculatedExpressionBMITemplate(invalidQuestionnaire, response);
    const observations = result.observations;

    expect(observations).toHaveLength(0);
  });
}); 