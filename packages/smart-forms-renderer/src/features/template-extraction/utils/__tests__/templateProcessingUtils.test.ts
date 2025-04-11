import type { Questionnaire, QuestionnaireResponse, Observation } from 'fhir/r4';
import { processTemplateObservations } from '../templateProcessingUtils';

describe('Template Processing Utils', () => {
  const mockQuestionnaire: Questionnaire = {
    resourceType: 'Questionnaire',
    id: 'test-questionnaire',
    status: 'active'
  };

  const mockQuestionnaireResponse: QuestionnaireResponse = {
    resourceType: 'QuestionnaireResponse',
    id: 'test-response',
    status: 'completed',
    item: [
      {
        linkId: 'height',
        answer: [{ valueQuantity: { value: 180, unit: 'cm' } }]
      },
      {
        linkId: 'weight',
        answer: [{ valueQuantity: { value: 75, unit: 'kg' } }]
      }
    ]
  };

  it('should process template observations', async () => {
    const result = await processTemplateObservations(mockQuestionnaire, mockQuestionnaireResponse);
    expect(result.observations).toBeDefined();
    expect(result.errors).toBeUndefined();
  });
}); 