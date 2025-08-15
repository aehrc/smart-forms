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
import {
  checkProhibitedAttributes,
  checkMatchingLanguage,
  getContainedResources,
  getExtensions,
  getItems,
  getUrls,
  isValidExtensions
} from '../utils/getProperties';

describe('checkProhibitedAttributes', () => {
  it('should return null when no prohibited attributes are found', () => {
    const subquestionnaires: Questionnaire[] = [
      {
        resourceType: 'Questionnaire',
        id: 'q1',
        status: 'draft',
        url: 'http://example.com/questionnaire1'
      },
      {
        resourceType: 'Questionnaire',
        id: 'q2',
        status: 'draft',
        url: 'http://example.com/questionnaire2'
      }
    ];

    const result = checkProhibitedAttributes(subquestionnaires);
    expect(result).toBeNull();
  });

  it('should return error when implicitRules is present', () => {
    const subquestionnaires: Questionnaire[] = [
      {
        resourceType: 'Questionnaire',
        id: 'q1',
        status: 'draft',
        url: 'http://example.com/questionnaire1',
        implicitRules: 'http://example.com/rules'
      }
    ];

    const result = checkProhibitedAttributes(subquestionnaires);
    expect(result).toEqual({
      resourceType: 'OperationOutcome',
      issue: [
        {
          severity: 'error',
          code: 'invalid',
          details: {
            text: 'The subquestionnaire http://example.com/questionnaire1 contains implicitRules, which is prohibited.'
          }
        }
      ]
    });
  });

  it('should return error when modifierExtension is present', () => {
    const subquestionnaires: Questionnaire[] = [
      {
        resourceType: 'Questionnaire',
        id: 'q1',
        status: 'draft',
        url: 'http://example.com/questionnaire1',
        modifierExtension: [
          {
            url: 'http://example.com/modifier',
            valueString: 'test'
          }
        ]
      }
    ];

    const result = checkProhibitedAttributes(subquestionnaires);
    expect(result).toEqual({
      resourceType: 'OperationOutcome',
      issue: [
        {
          severity: 'error',
          code: 'invalid',
          details: {
            text: 'The subquestionnaire http://example.com/questionnaire1 contains a modifierExtension, which is prohibited.'
          }
        }
      ]
    });
  });
});

describe('checkMatchingLanguage', () => {
  const parentQuestionnaire: Questionnaire = {
    resourceType: 'Questionnaire',
    id: 'parent',
    status: 'draft',
    url: 'http://example.com/parent',
    language: 'en'
  };

  it('should return null when languages match', () => {
    const subquestionnaires: Questionnaire[] = [
      {
        resourceType: 'Questionnaire',
        id: 'q1',
        status: 'draft',
        url: 'http://example.com/questionnaire1',
        language: 'en'
      }
    ];

    const result = checkMatchingLanguage(subquestionnaires, parentQuestionnaire);
    expect(result).toBeNull();
  });

  it('should return null when subquestionnaire has no language', () => {
    const subquestionnaires: Questionnaire[] = [
      {
        resourceType: 'Questionnaire',
        id: 'q1',
        status: 'draft',
        url: 'http://example.com/questionnaire1'
        // No language property
      }
    ];

    const result = checkMatchingLanguage(subquestionnaires, parentQuestionnaire);
    expect(result).toBeNull();
  });

  it('should return error when parent has no language but subquestionnaire does', () => {
    const parentWithoutLanguage: Questionnaire = {
      resourceType: 'Questionnaire',
      id: 'parent',
      status: 'draft',
      url: 'http://example.com/parent'
      // No language property
    };

    const subquestionnaires: Questionnaire[] = [
      {
        resourceType: 'Questionnaire',
        id: 'q1',
        status: 'draft',
        url: 'http://example.com/questionnaire1',
        language: 'en'
      }
    ];

    const result = checkMatchingLanguage(subquestionnaires, parentWithoutLanguage);
    expect(result).toEqual({
      resourceType: 'OperationOutcome',
      issue: [
        {
          severity: 'error',
          code: 'invalid',
          details: {
            text: "The subquestionnaire http://example.com/questionnaire1 contains a language property but its parent questionnaire http://example.com/parent doesn't."
          }
        }
      ]
    });
  });

  it('should return error when languages differ', () => {
    const subquestionnaires: Questionnaire[] = [
      {
        resourceType: 'Questionnaire',
        id: 'q1',
        status: 'draft',
        url: 'http://example.com/questionnaire1',
        language: 'fr'
      }
    ];

    const result = checkMatchingLanguage(subquestionnaires, parentQuestionnaire);
    expect(result).toEqual({
      resourceType: 'OperationOutcome',
      issue: [
        {
          severity: 'error',
          code: 'invalid',
          details: {
            text: 'The subquestionnaire http://example.com/questionnaire1 has a different language from its parent questionnaire http://example.com/parent'
          }
        }
      ]
    });
  });
});

describe('getContainedResources', () => {
  it('should collect contained resources from subquestionnaires', () => {
    const valueSet: FhirResource = {
      resourceType: 'ValueSet',
      id: 'vs1',
      status: 'draft'
    };

    const codeSystem: FhirResource = {
      resourceType: 'CodeSystem',
      id: 'cs1',
      status: 'draft',
      content: 'complete'
    };

    const subquestionnaires: Questionnaire[] = [
      {
        resourceType: 'Questionnaire',
        id: 'q1',
        status: 'draft',
        contained: [valueSet]
      },
      {
        resourceType: 'Questionnaire',
        id: 'q2',
        status: 'draft',
        contained: [codeSystem]
      }
    ];

    const result = getContainedResources(subquestionnaires);
    expect(result).toEqual({
      vs1: valueSet,
      cs1: codeSystem
    });
  });

  it('should skip resources without id', () => {
    const resourceWithoutId: FhirResource = {
      resourceType: 'ValueSet',
      status: 'draft'
      // No id property
    };

    const resourceWithId: FhirResource = {
      resourceType: 'CodeSystem',
      id: 'cs1',
      status: 'draft',
      content: 'complete'
    };

    const subquestionnaires: Questionnaire[] = [
      {
        resourceType: 'Questionnaire',
        id: 'q1',
        status: 'draft',
        contained: [resourceWithoutId, resourceWithId]
      }
    ];

    const result = getContainedResources(subquestionnaires);
    expect(result).toEqual({
      cs1: resourceWithId
    });
  });

  it('should handle questionnaires without contained resources', () => {
    const subquestionnaires: Questionnaire[] = [
      {
        resourceType: 'Questionnaire',
        id: 'q1',
        status: 'draft'
        // No contained property
      }
    ];

    const result = getContainedResources(subquestionnaires);
    expect(result).toEqual({});
  });

  it('should not override existing resources with same id', () => {
    const resource1: FhirResource = {
      resourceType: 'ValueSet',
      id: 'vs1',
      status: 'draft',
      url: 'http://first.com'
    };

    const resource2: FhirResource = {
      resourceType: 'ValueSet',
      id: 'vs1',
      status: 'active',
      url: 'http://second.com'
    };

    const subquestionnaires: Questionnaire[] = [
      {
        resourceType: 'Questionnaire',
        id: 'q1',
        status: 'draft',
        contained: [resource1]
      },
      {
        resourceType: 'Questionnaire',
        id: 'q2',
        status: 'draft',
        contained: [resource2]
      }
    ];

    const result = getContainedResources(subquestionnaires);
    expect(result).toEqual({
      vs1: resource1 // First one should be kept
    });
  });
});

describe('getExtensions', () => {
  it('should extract cqf-library extension to root level', () => {
    const cqfLibraryExtension: Extension = {
      url: 'http://hl7.org/fhir/StructureDefinition/cqf-library',
      valueCanonical: 'http://example.com/Library/example'
    };

    const subquestionnaires: Questionnaire[] = [
      {
        resourceType: 'Questionnaire',
        id: 'q1',
        status: 'draft',
        extension: [cqfLibraryExtension]
      }
    ];

    const result = getExtensions(subquestionnaires);

    if ('rootLevelExtensions' in result) {
      expect(result.rootLevelExtensions).toEqual([cqfLibraryExtension]);
      expect(result.itemLevelExtensions).toEqual([[]]);
    } else {
      fail('Expected PropagatedExtensions but got OperationOutcome');
    }
  });

  it('should extract launchContext extension to root level', () => {
    const launchContextExtension: Extension = {
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

    const subquestionnaires: Questionnaire[] = [
      {
        resourceType: 'Questionnaire',
        id: 'q1',
        status: 'draft',
        extension: [launchContextExtension]
      }
    ];

    const result = getExtensions(subquestionnaires);

    if ('rootLevelExtensions' in result) {
      expect(result.rootLevelExtensions).toEqual([launchContextExtension]);
      expect(result.itemLevelExtensions).toEqual([[]]);
    } else {
      fail('Expected PropagatedExtensions but got OperationOutcome');
    }
  });

  it('should extract questionnaire-constraint extension to item level', () => {
    const constraintExtension: Extension = {
      url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-constraint',
      extension: [
        {
          url: 'key',
          valueId: 'constraint-1'
        },
        {
          url: 'expression',
          valueString: "item.where(linkId='age').answer.valueInteger > 0"
        }
      ]
    };

    const subquestionnaires: Questionnaire[] = [
      {
        resourceType: 'Questionnaire',
        id: 'q1',
        status: 'draft',
        extension: [constraintExtension]
      }
    ];

    const result = getExtensions(subquestionnaires);

    if ('rootLevelExtensions' in result) {
      expect(result.rootLevelExtensions).toEqual([]);
      expect(result.itemLevelExtensions).toEqual([[constraintExtension]]);
    } else {
      fail('Expected PropagatedExtensions but got OperationOutcome');
    }
  });

  it('should extract variable extension to item level', () => {
    const variableExtension: Extension = {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'patientAge',
        language: 'text/fhirpath',
        expression: '%patient.birthDate'
      }
    };

    const subquestionnaires: Questionnaire[] = [
      {
        resourceType: 'Questionnaire',
        id: 'q1',
        status: 'draft',
        extension: [variableExtension]
      }
    ];

    const result = getExtensions(subquestionnaires);

    if ('rootLevelExtensions' in result) {
      expect(result.rootLevelExtensions).toEqual([]);
      expect(result.itemLevelExtensions).toEqual([[variableExtension]]);
    } else {
      fail('Expected PropagatedExtensions but got OperationOutcome');
    }
  });

  it('should return error for duplicate variable names', () => {
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

    const subquestionnaires: Questionnaire[] = [
      {
        resourceType: 'Questionnaire',
        id: 'q1',
        status: 'draft',
        url: 'http://example.com/q1',
        extension: [variableExtension1, variableExtension2]
      }
    ];

    const result = getExtensions(subquestionnaires);

    if ('issue' in result) {
      expect(result.resourceType).toBe('OperationOutcome');
      expect(result.issue[0].severity).toBe('error');
    } else {
      fail('Expected OperationOutcome but got PropagatedExtensions');
    }
  });

  it('should extract itemPopulationContext extension to item level', () => {
    const itemPopulationContextExtension: Extension = {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-itemPopulationContext',
      valueExpression: {
        language: 'text/fhirpath',
        expression: '%patient.contact'
      }
    };

    const subquestionnaires: Questionnaire[] = [
      {
        resourceType: 'Questionnaire',
        id: 'q1',
        status: 'draft',
        extension: [itemPopulationContextExtension]
      }
    ];

    const result = getExtensions(subquestionnaires);

    if ('rootLevelExtensions' in result) {
      expect(result.rootLevelExtensions).toEqual([]);
      expect(result.itemLevelExtensions).toEqual([[itemPopulationContextExtension]]);
    } else {
      fail('Expected PropagatedExtensions but got OperationOutcome');
    }
  });

  it('should return error for multiple itemPopulationContext extensions', () => {
    const itemPopulationContext1: Extension = {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-itemPopulationContext',
      valueExpression: {
        language: 'text/fhirpath',
        expression: '%patient.contact'
      }
    };

    const itemPopulationContext2: Extension = {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-itemPopulationContext',
      valueExpression: {
        language: 'text/fhirpath',
        expression: '%patient.address'
      }
    };

    const subquestionnaires: Questionnaire[] = [
      {
        resourceType: 'Questionnaire',
        id: 'q1',
        status: 'draft',
        url: 'http://example.com/q1',
        extension: [itemPopulationContext1, itemPopulationContext2]
      }
    ];

    const result = getExtensions(subquestionnaires);

    if ('issue' in result) {
      expect(result.resourceType).toBe('OperationOutcome');
      expect(result.issue[0].severity).toBe('error');
      expect(result.issue[0].details?.text).toContain('more than one itemPopulationContext');
    } else {
      fail('Expected OperationOutcome but got PropagatedExtensions');
    }
  });

  it('should extract itemExtractionContext extension to item level', () => {
    const itemExtractionContextExtension: Extension = {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-itemExtractionContext',
      valueExpression: {
        language: 'text/fhirpath',
        expression: '%patient.contact'
      }
    };

    const subquestionnaires: Questionnaire[] = [
      {
        resourceType: 'Questionnaire',
        id: 'q1',
        status: 'draft',
        extension: [itemExtractionContextExtension]
      }
    ];

    const result = getExtensions(subquestionnaires);

    if ('rootLevelExtensions' in result) {
      expect(result.rootLevelExtensions).toEqual([]);
      expect(result.itemLevelExtensions).toEqual([[itemExtractionContextExtension]]);
    } else {
      fail('Expected PropagatedExtensions but got OperationOutcome');
    }
  });

  it('should return error for multiple itemExtractionContext extensions', () => {
    const itemExtractionContext1: Extension = {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-itemExtractionContext',
      valueExpression: {
        language: 'text/fhirpath',
        expression: '%patient.contact'
      }
    };

    const itemExtractionContext2: Extension = {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-itemExtractionContext',
      valueExpression: {
        language: 'text/fhirpath',
        expression: '%patient.address'
      }
    };

    const subquestionnaires: Questionnaire[] = [
      {
        resourceType: 'Questionnaire',
        id: 'q1',
        status: 'draft',
        url: 'http://example.com/q1',
        extension: [itemExtractionContext1, itemExtractionContext2]
      }
    ];

    const result = getExtensions(subquestionnaires);

    if ('issue' in result) {
      expect(result.resourceType).toBe('OperationOutcome');
      expect(result.issue[0].severity).toBe('error');
      expect(result.issue[0].details?.text).toContain('more than one itemExtractionContext');
    } else {
      fail('Expected OperationOutcome but got PropagatedExtensions');
    }
  });

  it('should handle questionnaires without extensions', () => {
    const subquestionnaires: Questionnaire[] = [
      {
        resourceType: 'Questionnaire',
        id: 'q1',
        status: 'draft'
      }
    ];

    const result = getExtensions(subquestionnaires);

    if ('rootLevelExtensions' in result) {
      expect(result.rootLevelExtensions).toEqual([]);
      expect(result.itemLevelExtensions).toEqual([null]);
    } else {
      fail('Expected PropagatedExtensions but got OperationOutcome');
    }
  });

  it('should handle mixed extension types correctly', () => {
    const cqfLibraryExtension: Extension = {
      url: 'http://hl7.org/fhir/StructureDefinition/cqf-library',
      valueCanonical: 'http://example.com/Library/example'
    };

    const variableExtension: Extension = {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'patientAge',
        language: 'text/fhirpath',
        expression: '%patient.birthDate'
      }
    };

    const constraintExtension: Extension = {
      url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-constraint',
      extension: [
        {
          url: 'key',
          valueId: 'constraint-1'
        }
      ]
    };

    const subquestionnaires: Questionnaire[] = [
      {
        resourceType: 'Questionnaire',
        id: 'q1',
        status: 'draft',
        extension: [cqfLibraryExtension, variableExtension, constraintExtension]
      }
    ];

    const result = getExtensions(subquestionnaires);

    if ('rootLevelExtensions' in result) {
      expect(result.rootLevelExtensions).toEqual([cqfLibraryExtension]);
      expect(result.itemLevelExtensions).toEqual([[constraintExtension, variableExtension]]);
    } else {
      fail('Expected PropagatedExtensions but got OperationOutcome');
    }
  });

  it('should not duplicate cqf-library extensions from multiple subquestionnaires', () => {
    const cqfLibraryExtension: Extension = {
      url: 'http://hl7.org/fhir/StructureDefinition/cqf-library',
      valueCanonical: 'http://example.com/Library/example'
    };

    const subquestionnaires: Questionnaire[] = [
      {
        resourceType: 'Questionnaire',
        id: 'q1',
        status: 'draft',
        extension: [cqfLibraryExtension]
      },
      {
        resourceType: 'Questionnaire',
        id: 'q2',
        status: 'draft',
        extension: [cqfLibraryExtension]
      }
    ];

    const result = getExtensions(subquestionnaires);

    if ('rootLevelExtensions' in result) {
      expect(result.rootLevelExtensions).toEqual([cqfLibraryExtension]);
      expect(result.itemLevelExtensions).toEqual([[], []]);
    } else {
      fail('Expected PropagatedExtensions but got OperationOutcome');
    }
  });

  it('should handle launchContext extensions with different codes', () => {
    const launchContext1: Extension = {
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

    const launchContext2: Extension = {
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

    const subquestionnaires: Questionnaire[] = [
      {
        resourceType: 'Questionnaire',
        id: 'q1',
        status: 'draft',
        extension: [launchContext1, launchContext2]
      }
    ];

    const result = getExtensions(subquestionnaires);

    if ('rootLevelExtensions' in result) {
      expect(result.rootLevelExtensions).toHaveLength(2);
      expect(result.rootLevelExtensions).toContain(launchContext1);
      expect(result.rootLevelExtensions).toContain(launchContext2);
      expect(result.itemLevelExtensions).toEqual([[]]);
    } else {
      fail('Expected PropagatedExtensions but got OperationOutcome');
    }
  });
});

describe('getItems', () => {
  it('should extract items from subquestionnaires', () => {
    const item1: QuestionnaireItem = {
      linkId: 'item1',
      type: 'string',
      text: 'Question 1'
    };

    const item2: QuestionnaireItem = {
      linkId: 'item2',
      type: 'string',
      text: 'Question 2'
    };

    const rootItem1: QuestionnaireItem = {
      linkId: 'root',
      type: 'group',
      item: [item1]
    };

    const rootItem2: QuestionnaireItem = {
      linkId: 'root',
      type: 'group',
      item: [item2]
    };

    const subquestionnaires: Questionnaire[] = [
      {
        resourceType: 'Questionnaire',
        id: 'q1',
        status: 'draft',
        item: [rootItem1]
      },
      {
        resourceType: 'Questionnaire',
        id: 'q2',
        status: 'draft',
        item: [rootItem2]
      }
    ];

    const result = getItems(subquestionnaires);
    
    // First questionnaire returns original root item
    expect(result[0]).toHaveLength(1);
    expect(result[0]?.[0]?.linkId).toBe('root');
    expect(result[0]?.[0]?.item).toEqual([item1]);
    
    // Second questionnaire has root item with prefixed linkId due to duplication
    expect(result[1]).toHaveLength(1);
    expect(result[1]?.[0]?.linkId).toBe('linkIdPrefix-root');
    expect(result[1]?.[0]?.item).toEqual([item2]);
  });

  it('should handle questionnaires without items', () => {
    const subquestionnaires: Questionnaire[] = [
      {
        resourceType: 'Questionnaire',
        id: 'q1',
        status: 'draft'
        // No item property
      }
    ];

    const result = getItems(subquestionnaires);
    expect(result).toEqual([null]);
  });
});

describe('getUrls', () => {
  it('should extract URLs from subquestionnaires', () => {
    const subquestionnaires: Questionnaire[] = [
      {
        resourceType: 'Questionnaire',
        id: 'q1',
        status: 'draft',
        url: 'http://example.com/questionnaire1'
      },
      {
        resourceType: 'Questionnaire',
        id: 'q2',
        status: 'draft',
        url: 'http://example.com/questionnaire2'
      }
    ];

    const result = getUrls(subquestionnaires);
    expect(result).toEqual([
      'http://example.com/questionnaire1',
      'http://example.com/questionnaire2'
    ]);
  });

  it('should handle questionnaires without URLs', () => {
    const subquestionnaires: Questionnaire[] = [
      {
        resourceType: 'Questionnaire',
        id: 'q1',
        status: 'draft'
        // No url property
      }
    ];

    const result = getUrls(subquestionnaires);
    expect(result).toEqual([undefined]);
  });
});

describe('isValidExtensions', () => {
  it('should return true for valid PropagatedExtensions', () => {
    const propagatedExtensions = {
      rootLevelExtensions: [],
      itemLevelExtensions: []
    };

    const result = isValidExtensions(propagatedExtensions);
    expect(result).toBe(true);
  });

  it('should return false for OperationOutcome', () => {
    const operationOutcome = {
      resourceType: 'OperationOutcome' as const,
      issue: []
    };

    const result = isValidExtensions(operationOutcome);
    expect(result).toBe(false);
  });

  it('should return true for PropagatedExtensions with extensions', () => {
    const propagatedExtensions = {
      rootLevelExtensions: [
        {
          url: 'http://example.com/extension',
          valueString: 'test'
        }
      ],
      itemLevelExtensions: [
        [
          {
            url: 'http://example.com/item-extension',
            valueBoolean: true
          }
        ]
      ]
    };

    const result = isValidExtensions(propagatedExtensions);
    expect(result).toBe(true);
  });
});
