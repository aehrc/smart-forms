import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';

import type { Extractable } from '../utils/extractObservation';
import { extractObservationBased, mapQItemsExtractable } from '../utils/extractObservation';
import {
  observationResults,
  qExtractSample,
  qObservationSample,
  qObservationSampleWithExtractExtension,
  qrObservationSample
} from './test-data/observationSample';

describe('extractObservationBased', () => {
  it('should correctly extract Observations from a QuestionnaireResponse', () => {
    const observations = extractObservationBased(
      qObservationSampleWithExtractExtension,
      qrObservationSample
    );
    expect(observations).toHaveLength(4);
    expect(observations[0]).toEqual(observationResults[0]);
  });

  it('should return an Observations array only if there are observation-extract extensions', () => {
    const singleExtractExtension: Questionnaire = JSON.parse(
      JSON.stringify(qObservationSampleWithExtractExtension)
    );
    singleExtractExtension.item!.at(0)!.extension!.at(0)!.valueBoolean = false;

    const observations = extractObservationBased(singleExtractExtension, qrObservationSample);
    expect(observations).toHaveLength(2);
    expect(observations[0].id).toContain('phq2-4');
  });

  it('should return all Observations expect for observation-extract extensions false', () => {
    const topLevelExtract: Questionnaire = JSON.parse(
      JSON.stringify(qObservationSampleWithExtractExtension)
    );
    topLevelExtract.extension!.at(0)!.valueBoolean = true;

    const observations = extractObservationBased(topLevelExtract, qrObservationSample);
    expect(observations).toHaveLength(6);
  });

  it('should return an empty array if there are no observation-extract extensions', () => {
    const observations = extractObservationBased(qObservationSample, qrObservationSample);
    expect(observations).toHaveLength(0);
  });

  it('should return an empty array if there are no items in the Questionnaire or QuestionnaireResponse', () => {
    const emptyQuestionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      item: [],
      status: 'draft'
    };
    const emptyResponse: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      item: [],
      status: 'completed'
    };

    const observations = extractObservationBased(emptyQuestionnaire, emptyResponse);
    expect(observations).toHaveLength(0);
  });

  it('should return an empty array if no matching Questionnaire item is found for a QuestionnaireResponse item', () => {
    const responseWithNoMatch: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'completed',
      id: 'qr2',
      item: [
        {
          linkId: '999', // No matching linkId in the questionnaire
          answer: [
            {
              valueQuantity: {
                value: 100,
                unit: 'kg',
                system: 'http://unitsofmeasure.org',
                code: 'kg'
              }
            }
          ]
        }
      ],
      subject: {
        reference: 'Patient/456'
      }
    };

    const observations = extractObservationBased(qObservationSample, responseWithNoMatch);
    expect(observations).toHaveLength(0);
  });
});

describe('mapQItemsExtractable', () => {
  it('should correctly return extractionMap from a Questionnaire', () => {
    const extractionMap = mapQItemsExtractable(qExtractSample);
    expect(extractionMap).toEqual({
      'phq-2-questionnaire': { extractable: false, extractCategories: [] },
      'phq2-1': { extractable: true, extractCategories: [] },
      'phq2-2': { extractable: false, extractCategories: [] },
      'phq2-3': { extractable: false, extractCategories: [] },
      'phq2-4': { extractable: true, extractCategories: [] },
      'phq2-5': { extractable: true, extractCategories: [] },
      'phq2-6': { extractable: false, extractCategories: [] },
      'phq2-7': { extractable: false, extractCategories: [] },
      'phq2-8': { extractable: true, extractCategories: [] }
    } satisfies Record<string, Extractable>);
  });

  it('should correctly return extractionMap even with topLevel observation-extract extensions true', () => {
    const topLevelExtract: Questionnaire = JSON.parse(JSON.stringify(qExtractSample));
    topLevelExtract.extension!.at(0)!.valueBoolean = true;

    const extractionMap = mapQItemsExtractable(topLevelExtract);

    expect(extractionMap).toEqual({
      'phq-2-questionnaire': { extractable: true, extractCategories: [] },
      'phq2-1': { extractable: true, extractCategories: [] },
      'phq2-2': { extractable: false, extractCategories: [] },
      'phq2-3': { extractable: true, extractCategories: [] },
      'phq2-4': { extractable: true, extractCategories: [] },
      'phq2-5': { extractable: true, extractCategories: [] },
      'phq2-6': { extractable: false, extractCategories: [] },
      'phq2-7': { extractable: true, extractCategories: [] },
      'phq2-8': { extractable: true, extractCategories: [] }
    } satisfies Record<string, Extractable>);
  });
});
