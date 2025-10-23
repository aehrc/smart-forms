/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type {
  CodeableConcept,
  Observation,
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItemAnswer
} from 'fhir/r4';

import type { Extractable } from '../utils/extractObservation';
import {
  buildBundleFromObservationArray,
  canBeObservationExtracted,
  createObservation,
  extractObservationBased,
  generateUniqueId,
  mapQItemsExtractable
} from '../utils/extractObservation';
import {
  observationResults,
  qExtractSample,
  qObservationSample,
  qObservationSampleWithExtractExtension,
  qrObservationSample
} from './data/observationSample';

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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    singleExtractExtension.item!.at(0)!.extension!.at(0)!.valueBoolean = false;

    const observations = extractObservationBased(singleExtractExtension, qrObservationSample);
    expect(observations).toHaveLength(2);
    expect(observations[0].id).toContain('phq2-4');
  });

  it('should return all Observations expect for observation-extract extensions false', () => {
    const topLevelExtract: Questionnaire = JSON.parse(
      JSON.stringify(qObservationSampleWithExtractExtension)
    );
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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

describe('createObservation', () => {
  const basicQuestionnaireItem: QuestionnaireItem = {
    linkId: 'height',
    type: 'decimal',
    text: 'Height',
    code: [
      {
        system: 'http://loinc.org',
        code: '8302-2',
        display: 'Body height'
      }
    ]
  };

  const basicAnswer: QuestionnaireResponseItemAnswer = {
    valueDecimal: 180
  };

  const basicCategories: CodeableConcept[] = [
    {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/observation-category',
          code: 'vital-signs',
          display: 'Vital Signs'
        }
      ]
    }
  ];

  it('should create basic observation with minimal response', () => {
    const questionnaireResponse: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'completed',
      id: 'qr-123'
    };

    const observation = createObservation(
      basicQuestionnaireItem,
      questionnaireResponse,
      basicAnswer,
      basicCategories
    );

    expect(observation.resourceType).toBe('Observation');
    expect(observation.status).toBe('final');
    expect(observation.id).toBe('obs-height');
    expect(observation.code.coding).toHaveLength(1);
    expect(observation.code.coding?.[0].system).toBe('http://loinc.org');
    expect(observation.derivedFrom).toEqual([{ reference: 'QuestionnaireResponse/qr-123' }]);
  });

  it('should include basedOn when present in QuestionnaireResponse', () => {
    const questionnaireResponse: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'completed',
      id: 'qr-123',
      basedOn: [{ reference: 'ServiceRequest/sr-123' }]
    };

    const observation = createObservation(
      basicQuestionnaireItem,
      questionnaireResponse,
      basicAnswer,
      basicCategories
    );

    expect(observation.basedOn).toEqual([{ reference: 'ServiceRequest/sr-123' }]);
  });

  it('should include partOf when present in QuestionnaireResponse', () => {
    const questionnaireResponse: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'completed',
      id: 'qr-123',
      partOf: [{ reference: 'Procedure/proc-123' }]
    };

    const observation = createObservation(
      basicQuestionnaireItem,
      questionnaireResponse,
      basicAnswer,
      basicCategories
    );

    expect(observation.partOf).toEqual([{ reference: 'Procedure/proc-123' }]);
  });

  it('should include subject when present in QuestionnaireResponse', () => {
    const questionnaireResponse: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'completed',
      id: 'qr-123',
      subject: { reference: 'Patient/patient-123' }
    };

    const observation = createObservation(
      basicQuestionnaireItem,
      questionnaireResponse,
      basicAnswer,
      basicCategories
    );

    expect(observation.subject).toEqual({ reference: 'Patient/patient-123' });
  });

  it('should include encounter when present in QuestionnaireResponse', () => {
    const questionnaireResponse: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'completed',
      id: 'qr-123',
      encounter: { reference: 'Encounter/enc-123' }
    };

    const observation = createObservation(
      basicQuestionnaireItem,
      questionnaireResponse,
      basicAnswer,
      basicCategories
    );

    expect(observation.encounter).toEqual({ reference: 'Encounter/enc-123' });
  });

  it('should handle QuestionnaireItem without code', () => {
    const itemWithoutCode: QuestionnaireItem = {
      linkId: 'no-code',
      type: 'string',
      text: 'Item without code'
    };

    const questionnaireResponse: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'completed',
      id: 'qr-123'
    };

    const observation = createObservation(
      itemWithoutCode,
      questionnaireResponse,
      basicAnswer,
      basicCategories
    );

    expect(observation.code.coding).toEqual([]);
  });

  it('should handle partial code information', () => {
    const itemWithPartialCode: QuestionnaireItem = {
      linkId: 'partial-code',
      type: 'string',
      text: 'Item with partial code',
      code: [
        {
          system: 'http://example.com',
          code: 'test-code'
          // display is missing
        }
      ]
    };

    const questionnaireResponse: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'completed',
      id: 'qr-123'
    };

    const observation = createObservation(
      itemWithPartialCode,
      questionnaireResponse,
      basicAnswer,
      basicCategories
    );

    expect(observation.code.coding).toHaveLength(1);
    expect(observation.code.coding?.[0]).toEqual({
      system: 'http://example.com',
      code: 'test-code'
    });
  });
});

describe('generateUniqueId', () => {
  it('should generate unique ID with prefix', () => {
    const id1 = generateUniqueId('test');
    const id2 = generateUniqueId('test');

    expect(id1).toMatch(/^test-\d+-\d+-[a-f0-9]+$/);
    expect(id2).toMatch(/^test-\d+-\d+-[a-f0-9]+$/);
    expect(id1).not.toBe(id2);
  });

  it('should handle different prefixes', () => {
    const id1 = generateUniqueId('obs');
    const id2 = generateUniqueId('qr');

    expect(id1).toMatch(/^obs-\d+-\d+-[a-f0-9]+$/);
    expect(id2).toMatch(/^qr-\d+-\d+-[a-f0-9]+$/);
  });

  it('should handle empty prefix', () => {
    const id = generateUniqueId('');

    expect(id).toMatch(/^-\d+-\d+-[a-f0-9]+$/);
  });
});

describe('canBeObservationExtracted', () => {
  it('should return true when questionnaire has observation extract extension', () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'active',
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-observationExtract',
          valueBoolean: true
        }
      ]
    };

    const result = canBeObservationExtracted(questionnaire);

    expect(result).toBe(true);
  });

  it('should return true when item has observation extract extension and code', () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'active',
      item: [
        {
          linkId: 'height',
          type: 'decimal',
          text: 'Height',
          code: [
            {
              system: 'http://loinc.org',
              code: '8302-2'
            }
          ],
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-observationExtract',
              valueBoolean: true
            }
          ]
        }
      ]
    };

    const result = canBeObservationExtracted(questionnaire);

    expect(result).toBe(true);
  });

  it('should return false when item has observation extract extension but no code', () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'active',
      item: [
        {
          linkId: 'height',
          type: 'decimal',
          text: 'Height',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-observationExtract',
              valueBoolean: true
            }
          ]
        }
      ]
    };

    const result = canBeObservationExtracted(questionnaire);

    expect(result).toBe(false);
  });

  it('should return false when questionnaire has no observation extract extensions', () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'active',
      item: [
        {
          linkId: 'name',
          type: 'string',
          text: 'Name'
        }
      ]
    };

    const result = canBeObservationExtracted(questionnaire);

    expect(result).toBe(false);
  });

  it('should return false when questionnaire has no items', () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'active'
    };

    const result = canBeObservationExtracted(questionnaire);

    expect(result).toBe(false);
  });

  it('should return true when nested item has valid observation extract extension', () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'active',
      item: [
        {
          linkId: 'section',
          type: 'group',
          text: 'Section',
          item: [
            {
              linkId: 'height',
              type: 'decimal',
              text: 'Height',
              code: [
                {
                  system: 'http://loinc.org',
                  code: '8302-2'
                }
              ],
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-observationExtract',
                  valueBoolean: true
                }
              ]
            }
          ]
        }
      ]
    };

    const result = canBeObservationExtracted(questionnaire);

    expect(result).toBe(true);
  });
});

describe('buildBundleFromObservationArray', () => {
  it('should create bundle with observations', () => {
    const observations: Observation[] = [
      {
        resourceType: 'Observation',
        status: 'final',
        id: 'obs-1',
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '8302-2',
              display: 'Body height'
            }
          ]
        },
        valueQuantity: {
          value: 180,
          unit: 'cm'
        }
      },
      {
        resourceType: 'Observation',
        status: 'final',
        id: 'obs-2',
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '29463-7',
              display: 'Body weight'
            }
          ]
        },
        valueQuantity: {
          value: 70,
          unit: 'kg'
        }
      }
    ];

    const bundle = buildBundleFromObservationArray(observations);

    expect(bundle.resourceType).toBe('Bundle');
    expect(bundle.type).toBe('transaction');
    expect(bundle.id).toMatch(/^sdc-observation-extract-/);
    expect(bundle.meta?.tag).toEqual([
      {
        code: '@aehrc/smart-forms-renderer:generated',
        system: 'urn:aehrc:sdc-template-extract'
      }
    ]);
    expect(bundle.timestamp).toBeDefined();
    expect(bundle.entry).toHaveLength(2);
    expect(bundle.entry?.[0].fullUrl).toBe('Observation/obs-1');
    expect(bundle.entry?.[0].resource).toEqual(observations[0]);
    expect(bundle.entry?.[0].request?.method).toBe('POST');
    expect(bundle.entry?.[1].fullUrl).toBe('Observation/obs-2');
  });

  it('should handle empty observations array', () => {
    const bundle = buildBundleFromObservationArray([]);

    expect(bundle.resourceType).toBe('Bundle');
    expect(bundle.type).toBe('transaction');
    expect(bundle.entry).toEqual([]);
  });

  it('should generate fullUrl for observations without id', () => {
    const observations: Observation[] = [
      {
        resourceType: 'Observation',
        status: 'final',
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '8302-2'
            }
          ]
        }
        // No id property
      }
    ];

    const bundle = buildBundleFromObservationArray(observations);

    expect(bundle.entry).toHaveLength(1);
    expect(bundle.entry?.[0].fullUrl).toMatch(/^Observation\/obs-/);
  });
});
