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

import { describe, expect, it } from '@jest/globals';
import type { Extension, FhirResource, Questionnaire, QuestionnaireItem } from 'fhir/r4';
import { propagateProperties } from '../utils/propagate';

describe('propagateProperties', () => {
  const createBaseParentQuestionnaire = (): Questionnaire => ({
    resourceType: 'Questionnaire',
    id: 'parent-questionnaire',
    status: 'draft',
    version: '1.0.0',
    url: 'http://example.com/parent',
    meta: {
      profile: ['http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-modular']
    },
    text: {
      status: 'generated',
      div: '<div>Some narrative text</div>'
    },
    item: [
      {
        linkId: 'root',
        type: 'group',
        item: [
          {
            linkId: 'subq1-ref',
            type: 'display'
          },
          {
            linkId: 'subq2-ref',
            type: 'display'
          }
        ]
      }
    ]
  });

  it('should return parent questionnaire unchanged when no items', () => {
    const parentQuestionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      id: 'empty',
      status: 'draft'
    };

    const result = propagateProperties(parentQuestionnaire, [], [], {}, [], []);

    expect(result).toBe(parentQuestionnaire);
  });

  it('should return parent questionnaire unchanged when top-level item has no children', () => {
    const parentQuestionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      id: 'no-children',
      status: 'draft',
      item: [
        {
          linkId: 'root',
          type: 'group'
        }
      ]
    };

    const result = propagateProperties(parentQuestionnaire, [], [], {}, [], []);

    expect(result).toBe(parentQuestionnaire);
  });

  it('should propagate items from subquestionnaires', () => {
    const parentQuestionnaire = createBaseParentQuestionnaire();

    const subqItem1: QuestionnaireItem = {
      linkId: 'question1',
      type: 'string',
      text: 'What is your name?'
    };

    const subqItem2: QuestionnaireItem = {
      linkId: 'question2',
      type: 'integer',
      text: 'What is your age?'
    };

    const itemsFromSubquestionnaires = [[subqItem1], [subqItem2]];

    const result = propagateProperties(
      parentQuestionnaire,
      ['http://example.com/subq1', 'http://example.com/subq2'],
      itemsFromSubquestionnaires,
      {},
      [],
      [[], []]
    ) as Questionnaire;

    expect(result.item?.[0]?.item).toEqual([subqItem1, subqItem2]);
  });

  it('should propagate item-level extensions to top-level item', () => {
    const parentQuestionnaire = createBaseParentQuestionnaire();

    const variableExtension: Extension = {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'patientAge',
        language: 'text/fhirpath',
        expression: '%patient.birthDate'
      }
    };

    const itemLevelExtensions = [[variableExtension]];

    const result = propagateProperties(
      parentQuestionnaire,
      ['http://example.com/subq1'],
      [null],
      {},
      [],
      itemLevelExtensions
    ) as Questionnaire;

    expect(result.item?.[0]?.extension).toContain(variableExtension);
  });

  it('should return error for duplicate variable names in item-level extensions', () => {
    const parentQuestionnaire = createBaseParentQuestionnaire();

    const variableExtension1: Extension = {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'duplicateName',
        language: 'text/fhirpath',
        expression: '%patient.birthDate'
      }
    };

    const variableExtension2: Extension = {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'duplicateName',
        language: 'text/fhirpath',
        expression: '%patient.gender'
      }
    };

    const itemLevelExtensions = [[variableExtension1], [variableExtension2]];

    const result = propagateProperties(
      parentQuestionnaire,
      ['http://example.com/subq1'],
      [null],
      {},
      [],
      itemLevelExtensions
    );

    expect(result).toEqual({
      resourceType: 'OperationOutcome',
      issue: [
        {
          severity: 'error',
          code: 'invalid',
          details: {
            text: "The variable 'duplicateName' is duplicated."
          }
        }
      ]
    });
  });

  it('should add assembledFrom extensions for each subquestionnaire URL', () => {
    const parentQuestionnaire = createBaseParentQuestionnaire();

    const urls = ['http://example.com/subq1|1.0.0', 'http://example.com/subq2|2.0.0'];

    const result = propagateProperties(
      parentQuestionnaire,
      urls,
      [null, null],
      {},
      [],
      [[], []]
    ) as Questionnaire;

    const assembledFromExtensions = result.extension?.filter(
      (ext) =>
        ext.url === 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-assembledFrom'
    );

    expect(assembledFromExtensions).toHaveLength(2);
    expect(assembledFromExtensions?.[0]?.valueCanonical).toBe('http://example.com/subq1|1.0.0');
    expect(assembledFromExtensions?.[1]?.valueCanonical).toBe('http://example.com/subq2|2.0.0');
  });

  it('should append "-assembled" to version', () => {
    const parentQuestionnaire = createBaseParentQuestionnaire();

    const result = propagateProperties(
      parentQuestionnaire,
      ['http://example.com/subq1'],
      [null],
      {},
      [],
      [[]]
    ) as Questionnaire;

    expect(result.version).toBe('1.0.0-assembled');
  });

  it('should remove modular profile from meta', () => {
    const parentQuestionnaire = createBaseParentQuestionnaire();
    parentQuestionnaire.meta = {
      profile: [
        'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-modular',
        'http://example.com/other-profile'
      ]
    };

    const result = propagateProperties(
      parentQuestionnaire,
      ['http://example.com/subq1'],
      [null],
      {},
      [],
      [[]]
    ) as Questionnaire;

    expect(result.meta?.profile).toEqual(['http://example.com/other-profile']);
  });

  it('should remove text element', () => {
    const parentQuestionnaire = createBaseParentQuestionnaire();

    const result = propagateProperties(
      parentQuestionnaire,
      ['http://example.com/subq1'],
      [null],
      {},
      [],
      [[]]
    ) as Questionnaire;

    expect(result.text).toBeUndefined();
  });

  it('should merge contained resources from subquestionnaires', () => {
    const parentQuestionnaire = createBaseParentQuestionnaire();

    const valueSet: FhirResource = {
      resourceType: 'ValueSet',
      id: 'vs1',
      status: 'draft'
    };

    const containedResources = { vs1: valueSet };

    const result = propagateProperties(
      parentQuestionnaire,
      ['http://example.com/subq1'],
      [null],
      containedResources,
      [],
      [[]]
    ) as Questionnaire;

    expect(result.contained).toEqual([valueSet]);
  });

  it('should propagate cqf-library extension from subquestionnaires', () => {
    const parentQuestionnaire = createBaseParentQuestionnaire();

    const cqfLibraryExtension: Extension = {
      url: 'http://hl7.org/fhir/StructureDefinition/cqf-library',
      valueCanonical: 'http://example.com/Library/example'
    };

    const rootLevelExtensions = [cqfLibraryExtension];

    const result = propagateProperties(
      parentQuestionnaire,
      ['http://example.com/subq1'],
      [null],
      {},
      rootLevelExtensions,
      [[]]
    ) as Questionnaire;

    expect(result.extension).toContain(cqfLibraryExtension);
  });

  it('should prioritize cqf-library extension from parent over subquestionnaires', () => {
    const parentQuestionnaire = createBaseParentQuestionnaire();
    parentQuestionnaire.extension = [
      {
        url: 'http://hl7.org/fhir/StructureDefinition/cqf-library',
        valueCanonical: 'http://example.com/Library/parent'
      }
    ];

    const cqfLibraryFromSubq: Extension = {
      url: 'http://hl7.org/fhir/StructureDefinition/cqf-library',
      valueCanonical: 'http://example.com/Library/subq'
    };

    const result = propagateProperties(
      parentQuestionnaire,
      ['http://example.com/subq1'],
      [null],
      {},
      [cqfLibraryFromSubq],
      [[]]
    ) as Questionnaire;

    const cqfLibraryExtensions = result.extension?.filter(
      (ext) => ext.url === 'http://hl7.org/fhir/StructureDefinition/cqf-library'
    );

    expect(cqfLibraryExtensions).toHaveLength(1);
    expect(cqfLibraryExtensions?.[0]?.valueCanonical).toBe('http://example.com/Library/parent');
  });

  it('should use cqf-library extension from subquestionnaire when not present in parent', () => {
    const parentQuestionnaire = createBaseParentQuestionnaire();
    parentQuestionnaire.extension = [
      {
        url: 'http://example.com/other-extension',
        valueString: 'test'
      }
    ];

    const cqfLibraryFromSubq: Extension = {
      url: 'http://hl7.org/fhir/StructureDefinition/cqf-library',
      valueCanonical: 'http://example.com/Library/subq'
    };

    const result = propagateProperties(
      parentQuestionnaire,
      ['http://example.com/subq1'],
      [null],
      {},
      [cqfLibraryFromSubq],
      [[]]
    ) as Questionnaire;

    const cqfLibraryExtensions = result.extension?.filter(
      (ext) => ext.url === 'http://hl7.org/fhir/StructureDefinition/cqf-library'
    );

    expect(cqfLibraryExtensions).toHaveLength(1);
    expect(cqfLibraryExtensions?.[0]?.valueCanonical).toBe('http://example.com/Library/subq');
  });

  it('should merge launchContext extensions from parent and subquestionnaires', () => {
    const parentQuestionnaire = createBaseParentQuestionnaire();
    parentQuestionnaire.extension = [
      {
        url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext',
        extension: [
          {
            url: 'name',
            valueCoding: {
              system: 'http://hl7.org/fhir/uv/sdc/CodeSystem/launchContext',
              code: 'patient'
            }
          },
          {
            url: 'type',
            valueCode: 'Patient'
          }
        ]
      }
    ];

    const launchContextFromSubq: Extension = {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext',
      extension: [
        {
          url: 'name',
          valueCoding: {
            system: 'http://hl7.org/fhir/uv/sdc/CodeSystem/launchContext',
            code: 'encounter'
          }
        },
        {
          url: 'type',
          valueCode: 'Encounter'
        }
      ]
    };

    const result = propagateProperties(
      parentQuestionnaire,
      ['http://example.com/subq1'],
      [null],
      {},
      [launchContextFromSubq],
      [[]]
    ) as Questionnaire;

    const launchContextExtensions = result.extension?.filter(
      (ext) =>
        ext.url === 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext'
    );

    expect(launchContextExtensions).toHaveLength(2);
  });

  it('should prevent duplicate launchContext extensions with same name', () => {
    const parentQuestionnaire = createBaseParentQuestionnaire();
    parentQuestionnaire.extension = [
      {
        url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext',
        extension: [
          {
            url: 'name',
            valueCoding: {
              system: 'http://hl7.org/fhir/uv/sdc/CodeSystem/launchContext',
              code: 'patient'
            }
          },
          {
            url: 'type',
            valueCode: 'Patient'
          }
        ]
      }
    ];

    const duplicateLaunchContextFromSubq: Extension = {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext',
      extension: [
        {
          url: 'name',
          valueCoding: {
            system: 'http://hl7.org/fhir/uv/sdc/CodeSystem/launchContext',
            code: 'patient'
          }
        },
        {
          url: 'type',
          valueCode: 'Patient'
        }
      ]
    };

    const result = propagateProperties(
      parentQuestionnaire,
      ['http://example.com/subq1'],
      [null],
      {},
      [duplicateLaunchContextFromSubq],
      [[]]
    ) as Questionnaire;

    const launchContextExtensions = result.extension?.filter(
      (ext) =>
        ext.url === 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext'
    );

    expect(launchContextExtensions).toHaveLength(1);
  });

  it('should filter out specific extensions from parent', () => {
    const parentQuestionnaire = createBaseParentQuestionnaire();
    parentQuestionnaire.extension = [
      {
        url: 'http://hl7.org/fhir/StructureDefinition/cqf-library',
        valueCanonical: 'http://example.com/Library/parent'
      },
      {
        url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext',
        extension: [
          {
            url: 'name',
            valueCoding: {
              code: 'patient'
            }
          }
        ]
      },
      {
        url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-assemble-expectation',
        valueCode: 'assemble-root'
      },
      {
        url: 'http://example.com/custom-extension',
        valueString: 'should-be-preserved'
      }
    ];

    const result = propagateProperties(
      parentQuestionnaire,
      ['http://example.com/subq1'],
      [null],
      {},
      [],
      [[]]
    ) as Questionnaire;

    const customExtensions = result.extension?.filter(
      (ext) => ext.url === 'http://example.com/custom-extension'
    );
    const assembleExpectationExtensions = result.extension?.filter(
      (ext) =>
        ext.url ===
        'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-assemble-expectation'
    );

    expect(customExtensions).toHaveLength(1);
    expect(customExtensions?.[0]?.valueString).toBe('should-be-preserved');
    expect(assembleExpectationExtensions).toHaveLength(0);
  });

  it('should handle complex scenario with multiple property types', () => {
    const parentQuestionnaire = createBaseParentQuestionnaire();

    const subqItem1: QuestionnaireItem = {
      linkId: 'subq1-item',
      type: 'string'
    };

    const variableExtension: Extension = {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'var1',
        language: 'text/fhirpath',
        expression: '%patient.id'
      }
    };

    const result = propagateProperties(
      parentQuestionnaire,
      ['http://example.com/subq1|1.0.0'],
      [[subqItem1]],
      {},
      [],
      [[variableExtension]]
    ) as Questionnaire;

    expect(result.item?.[0]?.item).toEqual([
      subqItem1,
      {
        linkId: 'subq2-ref',
        type: 'display'
      }
    ]);
    expect(result.item?.[0]?.extension).toContain(variableExtension);
    expect(result.version).toBe('1.0.0-assembled');
    expect(result.text).toBeUndefined();
  });
});
