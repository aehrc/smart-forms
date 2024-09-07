import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';

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
    expect(observations).toHaveLength(2);
    expect(observations[0]).toEqual(observationResults[0]);
  });

  it('should return an Observations array only if there are observation-extract extensions', () => {
    const singleExtractExtension: Questionnaire = {
      ...qObservationSampleWithExtractExtension
    };
    singleExtractExtension.item!.at(0)!.extension!.at(0)!.valueBoolean = false;

    const observations = extractObservationBased(
      qObservationSampleWithExtractExtension,
      qrObservationSample
    );
    expect(observations).toHaveLength(1);
    expect(observations[0]).toEqual(observationResults[1]);
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
      'phq-2-questionnaire': false,
      'phq2-1': true,
      'phq2-2': false,
      'phq2-3': false,
      'phq2-4': true,
      'phq2-5': true,
      'phq2-6': false,
      'phq2-7': false,
      'phq2-8': true
    });
  });
});
