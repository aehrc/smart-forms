import { complexTemplateQuestionnaire } from './resources/complexTemplateSample';
import { complexTemplateResponse } from './resources/complexTemplateResponse';

import {extract } from '../SDCExtractQuestionnaireResponseOperation';
import type { ExtractInputParameters } from '../SDCExtractQuestionnaireResponseOperation/types';

describe('extract', () => {
  // it('should extract an Observation from a valid Questionnaire and QuestionnaireResponse', async () => {
  //   const questionnaire = {
  //     resourceType: 'Questionnaire',
  //     item: [
  //       { linkId: 'obs1', type: 'decimal', text: 'Height' }
  //     ],
  //     contained: [
  //       {
  //         resourceType: 'Observation',
  //         id: 'obs1',
  //         code: { coding: [{ code: '8302-2', display: 'Body height' }] }
  //       }
  //     ]
  //   };
  //   const questionnaireResponse = {
  //     resourceType: 'QuestionnaireResponse' as const,
  //     status: 'completed' as const,
  //     item: [
  //       { linkId: 'obs1', answer: [{ valueDecimal: 180 }] }
  //     ]
  //   };
  //   const params: ExtractInputParameters = { questionnaire, questionnaireResponse };
  //   const result = await extract(params);
  //   expect(result.result).toBeTruthy();
  //   expect(result.debugInfo).toBeTruthy();
  //   if (result.result && 'valueQuantity' in result.result) {
  //     expect((result.result as any).valueQuantity.value).toBe(180);
  //   } else if (result.result && 'entry' in result.result) {
  //     expect((result.result as any).entry?.length).toBeGreaterThan(0);
  //   }
  // });

  it('should return error if questionnaire is missing', async () => {
    const questionnaireResponse = { resourceType: 'QuestionnaireResponse' as const, status: 'completed' as const, item: [] };
    const params: ExtractInputParameters = { questionnaireResponse };
    const result = await extract(params);
    expect(result.error).toBe('Missing questionnaire');
  });

  it('should return error if questionnaire has no items', async () => {
    const questionnaire = { resourceType: 'Questionnaire', contained: [{}] };
    const questionnaireResponse = { resourceType: 'QuestionnaireResponse' as const, status: 'completed' as const, item: [] };
    const params: ExtractInputParameters = { questionnaire, questionnaireResponse };
    const result = await extract(params);
    expect(result.error).toBe('Questionnaire has no items');
  });

  it('should return error if questionnaire has no contained templates', async () => {
    const questionnaire = { resourceType: 'Questionnaire', item: [{ linkId: 'obs1', type: 'decimal' }] };
    const questionnaireResponse = { resourceType: 'QuestionnaireResponse' as const, status: 'completed' as const, item: [] };
    const params: ExtractInputParameters = { questionnaire, questionnaireResponse };
    const result = await extract(params);
    expect(result.error).toBe('Questionnaire has no contained resources for templates');
  });

  // it('should warn if no matching items are found', async () => {
  //   const questionnaire = {
  //     resourceType: 'Questionnaire',
  //     item: [{ linkId: 'obs1', type: 'decimal' }],
  //     contained: [
  //       {
  //         resourceType: 'Observation',
  //         id: 'obs2',
  //         code: { coding: [{ code: '8302-2', display: 'Body height' }] }
  //       }
  //     ]
  //   };
  //   const questionnaireResponse = {
  //     resourceType: 'QuestionnaireResponse' as const,
  //     status: 'completed' as const,
  //     item: [{ linkId: 'obs1', answer: [{ valueDecimal: 180 }] }]
  //   };
  //   const params: ExtractInputParameters = { questionnaire, questionnaireResponse };
  //   const result = await extract(params);
  //   expect(result.result).toBeNull();
  //   expect(result.debugInfo?.fieldMapping.mappedFields['8302-2'].warning).toBe('No matching questionnaire item found');
  // });
});

describe('extract with complex template', () => {
  it('should extract resources from the complex template', async () => {
    const params = { questionnaire: complexTemplateQuestionnaire, questionnaireResponse: complexTemplateResponse };
    const result = await extract(params);
    console.log('Complex template extract result:', result);
    expect(result.result).toBeTruthy();
    // Check that the result is a Bundle with at least one Observation
    if (result.result && result.result.resourceType === 'Bundle') {
      const bundle = result.result as any;
      const observations = bundle.entry.filter((e: any) => e.resource.resourceType === 'Observation');
      expect(observations.length).toBeGreaterThan(0);
    }
  });
}); 