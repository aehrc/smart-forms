import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import { extractTemplateBased, mapQItemsTemplate } from '../utils/extractTemplate';
import { bloodPressureQuestionnaire, bloodPressureResponse } from './test-data/bloodPressureSample';

describe('extractTemplateBased', () => {
  it('should return null if questionnaire has no items', async () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'draft'
    };

    const questionnaireResponse: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'completed'
    };

    const { result } = await extractTemplateBased(questionnaire, questionnaireResponse);
    expect(result).toBeNull();
  });

  it('should return null if questionnaire response has no items', async () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'draft',
      item: [
        {
          linkId: '1',
          type: 'string'
        }
      ]
    };

    const questionnaireResponse: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'completed'
    };

    const { result } = await extractTemplateBased(questionnaire, questionnaireResponse);
    expect(result).toBeNull();
  });

  it('should extract blood pressure observations with standard values', async () => {
    const { result, debugInfo } = await extractTemplateBased(bloodPressureQuestionnaire, bloodPressureResponse);
    expect(result).toHaveLength(2);
    if (result && result[0]?.code?.coding?.[0] && result[1]?.code?.coding?.[0] && result[0]?.valueQuantity && result[1]?.valueQuantity) {
      expect(result[0].code.coding[0].code).toBe('8480-6'); // Systolic
      expect(result[1].code.coding[0].code).toBe('8462-4'); // Diastolic
      expect(result[0].valueQuantity.value).toBe(120);
      expect(result[1].valueQuantity.value).toBe(80);
    }
  });

  it('should extract blood pressure observations with different values', async () => {
    const response: QuestionnaireResponse = {
      ...bloodPressureResponse,
      item: [
        {
          linkId: 'systolic',
          answer: [
            {
              valueQuantity: {
                value: 18,
                unit: 'mmHg',
                system: 'http://unitsofmeasure.org',
                code: 'mm[Hg]'
              }
            }
          ]
        },
        {
          linkId: 'diastolic',
          answer: [
            {
              valueQuantity: {
                value: 9,
                unit: 'mmHg',
                system: 'http://unitsofmeasure.org',
                code: 'mm[Hg]'
              }
            }
          ]
        }
      ]
    };

    const { result, debugInfo } = await extractTemplateBased(bloodPressureQuestionnaire, response);
    
    // Display debug information similar to web interface
    console.log('\nTemplate Extraction Debug');
    console.log('Content Analysis');
    console.log(`Detected: ${debugInfo?.contentAnalysis?.detectedSigns?.join(', ')}`);
    console.log(`Confidence: ${debugInfo?.contentAnalysis?.confidence}`);
    console.log(`Patterns: ${debugInfo?.contentAnalysis?.patterns?.join(', ')}`);
    
    console.log('\nField Mapping');
    console.log('Mapped fields:', JSON.stringify(debugInfo?.fieldMapping?.mappedFields, null, 2));
    console.log('Assumptions:', debugInfo?.fieldMapping?.assumptions?.join(', ') || 'None');
    console.log('Alternatives:', debugInfo?.fieldMapping?.alternatives?.join(', ') || 'None');
    
    console.log('\nValue Processing');
    console.log('Processed values:', JSON.stringify(debugInfo?.valueProcessing?.values, null, 2));
    console.log('Transformations:', debugInfo?.valueProcessing?.transformations?.join(', ') || 'None');
    console.log('Quality checks:', JSON.stringify(debugInfo?.valueProcessing?.qualityChecks, null, 2));
    
    console.log('\nResult Generation');
    if (result && result.length > 0) {
      console.log(`Successfully generated ${result.length} observations`);
      console.log('Observations:', JSON.stringify(result, null, 2));
    } else {
      console.log('No observations were generated');
    }

    expect(result).toHaveLength(2);
    if (result && result[0]?.valueQuantity && result[1]?.valueQuantity) {
      expect(result[0].valueQuantity.value).toBe(18);
      expect(result[1].valueQuantity.value).toBe(9);
    }
  });

  it('should handle questionnaire with LOINC codes', async () => {
    const questionnaire: Questionnaire = {
      ...bloodPressureQuestionnaire,
      item: [
        {
          linkId: 'systolic',
          text: 'Systolic Blood Pressure',
          type: 'quantity',
          required: true,
          code: [
            {
              system: 'http://loinc.org',
              code: '8480-6',
              display: 'Systolic blood pressure'
            }
          ],
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
              valueCoding: {
                system: 'http://unitsofmeasure.org',
                code: 'mm[Hg]',
                display: 'mmHg'
              }
            }
          ]
        },
        {
          linkId: 'diastolic',
          text: 'Diastolic Blood Pressure',
          type: 'quantity',
          required: true,
          code: [
            {
              system: 'http://loinc.org',
              code: '8462-4',
              display: 'Diastolic blood pressure'
            }
          ],
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
              valueCoding: {
                system: 'http://unitsofmeasure.org',
                code: 'mm[Hg]',
                display: 'mmHg'
              }
            }
          ]
        }
      ]
    };

    const { result } = await extractTemplateBased(questionnaire, bloodPressureResponse);
    expect(result).toHaveLength(2);
    if (result && result[0]?.code?.coding?.[0] && result[1]?.code?.coding?.[0]) {
      expect(result[0].code.coding[0].code).toBe('8480-6');
      expect(result[1].code.coding[0].code).toBe('8462-4');
    }
  });

  it('should include debug information in the result', async () => {
    const { result, debugInfo } = await extractTemplateBased(bloodPressureQuestionnaire, bloodPressureResponse);
    expect(result).toHaveLength(2);
    expect(debugInfo).toBeDefined();
    if (debugInfo && debugInfo.contentAnalysis && debugInfo.valueProcessing && debugInfo.resultGeneration) {
      expect(debugInfo.contentAnalysis.detectedSigns).toContain('Blood Pressure');
      expect(debugInfo.valueProcessing.values).toEqual({
        systolic: 120,
        diastolic: 80
      });
      expect(debugInfo.resultGeneration.observations).toHaveLength(2);
    }
  });
});

describe('mapQItemsTemplate', () => {
  it('should correctly map template extractable items', () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'draft',
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtract',
          valueBoolean: true
        },
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateReference',
          valueString: 'template-1'
        }
      ],
      item: [
        {
          linkId: '1',
          type: 'string',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtract',
              valueBoolean: true
            },
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateReference',
              valueString: 'template-2'
            }
          ]
        }
      ]
    };

    const result = mapQItemsTemplate(questionnaire);
    expect(result).toEqual({
      root: {
        extractable: true,
        templateReference: 'template-1'
      },
      '1': {
        extractable: true,
        templateReference: 'template-2'
      }
    });
  });
}); 