import { extractTemplateBased, mapQItemsTemplate } from '../utils/extractTemplate';
import { bloodPressureQuestionnaire, bloodPressureResponse } from './test-data/bloodPressureSample';

describe('extractTemplateBased', () => {
  it('should return null if questionnaire has no items', async () => {
    const { result } = await extractTemplateBased(
      { ...bloodPressureQuestionnaire, item: undefined },
      bloodPressureResponse
    );
    expect(result).toBeNull();
  });

  it('should return null if questionnaire response has no items', async () => {
    const { result } = await extractTemplateBased(bloodPressureQuestionnaire, {
      ...bloodPressureResponse,
      item: undefined
    });
    expect(result).toBeNull();
  });

  it('should extract blood pressure observations with standard values', async () => {
    const { result } = await extractTemplateBased(bloodPressureQuestionnaire, bloodPressureResponse);
    expect(result).toBeDefined();
    expect(result).toHaveLength(2);
    if (result && result[0]?.code?.coding?.[0] && result[1]?.code?.coding?.[0] && result[0]?.valueQuantity && result[1]?.valueQuantity) {
      expect(result[0].code.coding[0].code).toBe('8480-6'); // Systolic
      expect(result[1].code.coding[0].code).toBe('8462-4'); // Diastolic
      expect(result[0].valueQuantity.value).toBe(120);
      expect(result[1].valueQuantity.value).toBe(80);
    }
  });

  it('should extract blood pressure observations with different values', async () => {
    const differentResponse = {
      ...bloodPressureResponse,
      item: [
        {
          linkId: 'systolic',
          answer: [{ valueQuantity: { value: 18, unit: 'mmHg' } }]
        },
        {
          linkId: 'diastolic',
          answer: [{ valueQuantity: { value: 9, unit: 'mmHg' } }]
        }
      ]
    };

    const { result } = await extractTemplateBased(bloodPressureQuestionnaire, differentResponse);
    expect(result).toHaveLength(2);
    if (result && result[0]?.valueQuantity && result[1]?.valueQuantity) {
      expect(result[0].valueQuantity.value).toBe(18);
      expect(result[1].valueQuantity.value).toBe(9);
    }
  });

  it('should handle questionnaire with LOINC codes', async () => {
    const { result } = await extractTemplateBased(bloodPressureQuestionnaire, bloodPressureResponse);
    expect(result).toBeDefined();
    if (result && result[0]?.code?.coding?.[0] && result[1]?.code?.coding?.[0]) {
      expect(result[0].code.coding[0].system).toBe('http://loinc.org');
      expect(result[1].code.coding[0].system).toBe('http://loinc.org');
    }
  });

  it('should include debug information in the result', async () => {
    const { result, debugInfo } = await extractTemplateBased(bloodPressureQuestionnaire, bloodPressureResponse);
    
    expect(result).toBeDefined();
    expect(debugInfo).toBeDefined();
    if (debugInfo && debugInfo.contentAnalysis && debugInfo.valueProcessing && debugInfo.resultGeneration) {
      expect(debugInfo.contentAnalysis.detectedTemplates).toContain('systolic-bp-template');
      expect(debugInfo.contentAnalysis.detectedTemplates).toContain('diastolic-bp-template');
      expect(debugInfo.valueProcessing.values).toEqual({
        "systolic-bp-template": 120,
        "diastolic-bp-template": 80
      });
      expect(debugInfo.resultGeneration.observations).toHaveLength(2);
    }
  });
});

describe('mapQItemsTemplate', () => {
  it('should correctly map template extractable items', () => {
    const result = mapQItemsTemplate(bloodPressureQuestionnaire);
    expect(result['blood-pressure-questionnaire'].extractable).toBe(true);
    expect(result['systolic'].extractable).toBe(true);
    expect(result['diastolic'].extractable).toBe(true);
  });
}); 