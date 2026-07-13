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

import { describe, expect, test } from '@jest/globals';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import React from 'react';

// react-markdown, react-dnd and react-dnd-html5-backend are ESM-only and cannot be transformed by ts-jest
jest.mock('react-markdown', () => ({
  __esModule: true,
  default: (props: { children?: React.ReactNode }) => <>{props.children}</>
}));
jest.mock('react-dnd', () => ({
  __esModule: true,
  useDrop: () => [{ isOver: false, canDrop: false }, jest.fn()]
}));
jest.mock('react-dnd-html5-backend', () => ({
  __esModule: true,
  NativeTypes: { FILE: '__NATIVE_FILE__' }
}));

import SmartFormsRenderer from '../components/Renderer/SmartFormsRenderer';
import { questionnaireResponseStore } from '../stores';

// jsdom does not implement ResizeObserver, required by GroupTable's useResizeColumns
global.ResizeObserver =
  global.ResizeObserver ||
  class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };

// jsdom does not implement matchMedia, required by MUI useMediaQuery
window.matchMedia =
  window.matchMedia ||
  ((query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn()
    }) as unknown as MediaQueryList);

const autocompleteItemControlExtension = {
  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
  valueCodeableConcept: {
    coding: [
      {
        system: 'http://hl7.org/fhir/questionnaire-item-control',
        code: 'autocomplete'
      }
    ]
  }
};

const asthmaCoding = {
  system: 'http://snomed.info/sct',
  code: '195967001',
  display: 'Asthma'
};

function getUpdatableResponseString(): string {
  return JSON.stringify(questionnaireResponseStore.getState().updatableResponse);
}

async function clearAutocompleteField(linkId: string) {
  // MUI Autocomplete renders the clear indicator button whenever it holds a value
  const itemBox = document.querySelector(`[data-linkid="${linkId}"]`) ?? document.body;
  const clearButton = itemBox.querySelector('.MuiAutocomplete-clearIndicator');
  expect(clearButton).not.toBeNull();
  fireEvent.click(clearButton as Element);
}

describe('clearing choice fields removes the answer from updatableResponse', () => {
  test('standalone ChoiceAutocomplete - answer without id', async () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'active',
      item: [
        {
          linkId: 'condition',
          text: 'Condition',
          type: 'choice',
          extension: [autocompleteItemControlExtension],
          answerValueSet: 'https://example.com/fhir/ValueSet/conditions'
        }
      ]
    };

    const questionnaireResponse: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'in-progress',
      item: [
        {
          linkId: 'condition',
          text: 'Condition',
          answer: [{ valueCoding: asthmaCoding }]
        }
      ]
    };

    render(
      <SmartFormsRenderer
        questionnaire={questionnaire}
        questionnaireResponse={questionnaireResponse}
      />
    );

    await waitFor(() => expect(screen.getByDisplayValue('Asthma')).toBeTruthy());
    expect(getUpdatableResponseString()).toContain('Asthma');

    await clearAutocompleteField('condition');

    await waitFor(() => expect(getUpdatableResponseString()).not.toContain('Asthma'));
    await waitFor(() => expect(getUpdatableResponseString()).not.toContain('"linkId":"condition"'));
  });

  test('standalone ChoiceAutocomplete - answer with an id (stub answer scenario from issue #1994)', async () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'active',
      item: [
        {
          linkId: 'condition',
          text: 'Condition',
          type: 'choice',
          extension: [autocompleteItemControlExtension],
          answerValueSet: 'https://example.com/fhir/ValueSet/conditions'
        }
      ]
    };

    const questionnaireResponse: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'in-progress',
      item: [
        {
          linkId: 'condition',
          text: 'Condition',
          answer: [{ id: 'someAnswerKey', valueCoding: asthmaCoding }]
        }
      ]
    };

    render(
      <SmartFormsRenderer
        questionnaire={questionnaire}
        questionnaireResponse={questionnaireResponse}
      />
    );

    await waitFor(() => expect(screen.getByDisplayValue('Asthma')).toBeTruthy());
    expect(getUpdatableResponseString()).toContain('Asthma');

    await clearAutocompleteField('condition');

    await waitFor(() => expect(getUpdatableResponseString()).not.toContain('Asthma'));
    await waitFor(() => expect(getUpdatableResponseString()).not.toContain('"linkId":"condition"'));
  });

  test('ChoiceAutocomplete inside a repeat group - answer without id', async () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'active',
      item: [
        {
          linkId: 'problems',
          text: 'New problems',
          type: 'group',
          repeats: true,
          item: [
            {
              linkId: 'condition',
              text: 'Condition',
              type: 'choice',
              extension: [autocompleteItemControlExtension],
              answerValueSet: 'https://example.com/fhir/ValueSet/conditions'
            },
            {
              linkId: 'note',
              text: 'Note',
              type: 'string'
            }
          ]
        }
      ]
    };

    const questionnaireResponse: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'in-progress',
      item: [
        {
          linkId: 'problems',
          text: 'New problems',
          item: [
            {
              linkId: 'condition',
              text: 'Condition',
              answer: [{ valueCoding: asthmaCoding }]
            },
            {
              linkId: 'note',
              text: 'Note',
              answer: [{ valueString: 'a note' }]
            }
          ]
        }
      ]
    };

    render(
      <SmartFormsRenderer
        questionnaire={questionnaire}
        questionnaireResponse={questionnaireResponse}
      />
    );

    await waitFor(() => expect(screen.getByDisplayValue('Asthma')).toBeTruthy());
    expect(getUpdatableResponseString()).toContain('Asthma');

    await clearAutocompleteField('condition');

    await waitFor(() => expect(getUpdatableResponseString()).not.toContain('Asthma'));
    await waitFor(() => expect(getUpdatableResponseString()).not.toContain('"linkId":"condition"'));
  });

  test('ChoiceSelect (answerOption) inside a repeat group - answer without id', async () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'active',
      item: [
        {
          linkId: 'problems',
          text: 'New problems',
          type: 'group',
          repeats: true,
          item: [
            {
              linkId: 'severity',
              text: 'Severity',
              type: 'choice',
              answerOption: [
                { valueCoding: { code: 'mild', display: 'Mild' } },
                { valueCoding: { code: 'severe', display: 'Severe' } }
              ]
            },
            {
              linkId: 'note',
              text: 'Note',
              type: 'string'
            }
          ]
        }
      ]
    };

    const questionnaireResponse: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'in-progress',
      item: [
        {
          linkId: 'problems',
          text: 'New problems',
          item: [
            {
              linkId: 'severity',
              text: 'Severity',
              answer: [{ valueCoding: { code: 'severe', display: 'Severe' } }]
            },
            {
              linkId: 'note',
              text: 'Note',
              answer: [{ valueString: 'a note' }]
            }
          ]
        }
      ]
    };

    render(
      <SmartFormsRenderer
        questionnaire={questionnaire}
        questionnaireResponse={questionnaireResponse}
      />
    );

    await waitFor(() =>
      expect(
        document.querySelector('[data-linkid="severity"] .MuiAutocomplete-clearIndicator')
      ).toBeTruthy()
    );
    expect(getUpdatableResponseString()).toContain('Severe');

    await clearAutocompleteField('severity');

    await waitFor(() => expect(getUpdatableResponseString()).not.toContain('Severe'));
    await waitFor(() => expect(getUpdatableResponseString()).not.toContain('"linkId":"severity"'));
  });

  test('ChoiceAutocomplete with repeats: true (RepeatItem) - answer with internal repeat id', async () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'active',
      item: [
        {
          linkId: 'condition',
          text: 'Condition',
          type: 'choice',
          repeats: true,
          extension: [autocompleteItemControlExtension],
          answerValueSet: 'https://example.com/fhir/ValueSet/conditions'
        }
      ]
    };

    // Simulates the state after a user selects a condition in a repeat item row -
    // the answer carries the internal repeat id assigned by useInitialiseRepeatAnswers
    const questionnaireResponse: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'in-progress',
      item: [
        {
          linkId: 'condition',
          text: 'Condition',
          answer: [{ id: 'condition-repeat-000000', valueCoding: asthmaCoding }]
        }
      ]
    };

    render(
      <SmartFormsRenderer
        questionnaire={questionnaire}
        questionnaireResponse={questionnaireResponse}
      />
    );

    await waitFor(() => expect(screen.getByDisplayValue('Asthma')).toBeTruthy());
    expect(getUpdatableResponseString()).toContain('Asthma');

    await clearAutocompleteField('condition');

    await waitFor(() => expect(getUpdatableResponseString()).not.toContain('Asthma'));
    await waitFor(() => expect(getUpdatableResponseString()).not.toContain('"linkId":"condition"'));
  });

  test('ChoiceAutocomplete with repeats: true - clearing one row keeps the other row values and both rows visible', async () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'active',
      item: [
        {
          linkId: 'condition',
          text: 'Condition',
          type: 'choice',
          repeats: true,
          extension: [autocompleteItemControlExtension],
          answerValueSet: 'https://example.com/fhir/ValueSet/conditions'
        }
      ]
    };

    const questionnaireResponse: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'in-progress',
      item: [
        {
          linkId: 'condition',
          text: 'Condition',
          answer: [
            { id: 'condition-repeat-000000', valueCoding: asthmaCoding },
            {
              id: 'condition-repeat-000001',
              valueCoding: {
                system: 'http://snomed.info/sct',
                code: '38341003',
                display: 'Hypertension'
              }
            }
          ]
        }
      ]
    };

    render(
      <SmartFormsRenderer
        questionnaire={questionnaire}
        questionnaireResponse={questionnaireResponse}
      />
    );

    await waitFor(() => expect(screen.getByDisplayValue('Asthma')).toBeTruthy());
    expect(getUpdatableResponseString()).toContain('Hypertension');

    // Clear the first row only
    const clearButtons = document.querySelectorAll(
      '[data-linkid="condition"] .MuiAutocomplete-clearIndicator'
    );
    expect(clearButtons.length).toBe(2);
    fireEvent.click(clearButtons[0]);

    // First row answer removed, second row answer retained
    await waitFor(() => expect(getUpdatableResponseString()).not.toContain('Asthma'));
    expect(getUpdatableResponseString()).toContain('Hypertension');

    // Both rows are still rendered - the cleared row stays as an empty row
    const comboboxes = document.querySelectorAll('[data-linkid="condition"] .MuiAutocomplete-root');
    expect(comboboxes.length).toBe(2);
  });

  test('ChoiceAutocomplete inside a gtable repeat group (Aboriginal Health Check shape) - clearing removes the value', async () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'active',
      item: [
        {
          linkId: 'problems-summary',
          text: 'New problems',
          type: 'group',
          repeats: true,
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
              valueCodeableConcept: {
                coding: [
                  {
                    system: 'http://hl7.org/fhir/questionnaire-item-control',
                    code: 'gtable'
                  }
                ]
              }
            }
          ],
          item: [
            {
              linkId: 'conditionId',
              type: 'string',
              extension: [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-hidden',
                  valueBoolean: true
                }
              ]
            },
            {
              linkId: 'condition',
              text: 'Condition',
              type: 'choice',
              extension: [autocompleteItemControlExtension],
              answerValueSet: 'https://example.com/fhir/ValueSet/conditions'
            },
            {
              linkId: 'note',
              text: 'Note',
              type: 'string'
            }
          ]
        }
      ]
    };

    const questionnaireResponse: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'in-progress',
      item: [
        {
          linkId: 'problems-summary',
          text: 'New problems',
          item: [
            {
              linkId: 'conditionId',
              answer: [{ valueString: 'condition-1' }]
            },
            {
              linkId: 'condition',
              text: 'Condition',
              answer: [{ valueCoding: asthmaCoding }]
            },
            {
              linkId: 'note',
              text: 'Note',
              answer: [{ valueString: 'a note' }]
            }
          ]
        }
      ]
    };

    render(
      <SmartFormsRenderer
        questionnaire={questionnaire}
        questionnaireResponse={questionnaireResponse}
      />
    );

    await waitFor(() => expect(screen.getByDisplayValue('Asthma')).toBeTruthy());
    expect(getUpdatableResponseString()).toContain('Asthma');

    // Clear the autocomplete cell in the gtable row
    const clearButton = document.querySelector('.MuiAutocomplete-clearIndicator');
    expect(clearButton).toBeTruthy();
    fireEvent.click(clearButton as Element);

    // The condition value is removed, sibling cells are retained
    await waitFor(() => expect(getUpdatableResponseString()).not.toContain('Asthma'));
    await waitFor(() =>
      expect(getUpdatableResponseString()).not.toContain('"linkId":"condition","text"')
    );
    expect(getUpdatableResponseString()).toContain('a note');
    expect(getUpdatableResponseString()).toContain('condition-1');
  });

  test('standalone OpenChoiceAutocomplete - clearing removes the value (health check condition field type)', async () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'active',
      item: [
        {
          linkId: 'condition',
          text: 'Condition',
          type: 'open-choice',
          extension: [autocompleteItemControlExtension],
          answerValueSet: 'https://example.com/fhir/ValueSet/conditions'
        }
      ]
    };

    const questionnaireResponse: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'in-progress',
      item: [
        {
          linkId: 'condition',
          text: 'Condition',
          answer: [{ valueCoding: asthmaCoding }]
        }
      ]
    };

    render(
      <SmartFormsRenderer
        questionnaire={questionnaire}
        questionnaireResponse={questionnaireResponse}
      />
    );

    await waitFor(() => expect(screen.getByDisplayValue('Asthma')).toBeTruthy());
    expect(getUpdatableResponseString()).toContain('Asthma');

    await clearAutocompleteField('condition');

    await waitFor(() => expect(getUpdatableResponseString()).not.toContain('Asthma'));
    await waitFor(() => expect(getUpdatableResponseString()).not.toContain('"linkId":"condition"'));
  });

  test('OpenChoiceAutocomplete inside a gtable repeat group (Aboriginal Health Check shape) - clearing removes the value', async () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'active',
      item: [
        {
          linkId: 'medical-history-summary',
          text: 'Medical history summary',
          type: 'group',
          repeats: true,
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
              valueCodeableConcept: {
                coding: [
                  {
                    system: 'http://hl7.org/fhir/questionnaire-item-control',
                    code: 'gtable'
                  }
                ]
              }
            }
          ],
          item: [
            {
              linkId: 'conditionId',
              type: 'string',
              extension: [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-hidden',
                  valueBoolean: true
                }
              ]
            },
            {
              linkId: 'condition',
              text: 'Condition',
              type: 'open-choice',
              extension: [autocompleteItemControlExtension],
              answerValueSet: 'https://example.com/fhir/ValueSet/conditions'
            },
            {
              linkId: 'onset-date',
              text: 'Onset date',
              type: 'date'
            }
          ]
        }
      ]
    };

    const questionnaireResponse: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'in-progress',
      item: [
        {
          linkId: 'medical-history-summary',
          text: 'Medical history summary',
          item: [
            {
              linkId: 'conditionId',
              answer: [{ valueString: 'condition-1' }]
            },
            {
              linkId: 'condition',
              text: 'Condition',
              answer: [{ valueCoding: asthmaCoding }]
            }
          ]
        }
      ]
    };

    render(
      <SmartFormsRenderer
        questionnaire={questionnaire}
        questionnaireResponse={questionnaireResponse}
      />
    );

    await waitFor(() => expect(screen.getByDisplayValue('Asthma')).toBeTruthy());
    expect(getUpdatableResponseString()).toContain('Asthma');

    const clearButton = document.querySelector('.MuiAutocomplete-clearIndicator');
    expect(clearButton).toBeTruthy();
    fireEvent.click(clearButton as Element);

    await waitFor(() => expect(getUpdatableResponseString()).not.toContain('Asthma'));
    await waitFor(() =>
      expect(getUpdatableResponseString()).not.toContain('"linkId":"condition","text"')
    );
    expect(getUpdatableResponseString()).toContain('condition-1');
  });

  test('RepeatGroup - clearing the only answer in a row removes the whole row instance (issue #1994 follow-up)', async () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'active',
      item: [
        {
          linkId: 'new-medications',
          text: 'New medications',
          type: 'group',
          repeats: true,
          item: [
            {
              linkId: 'medication',
              text: 'Medication',
              type: 'choice',
              extension: [autocompleteItemControlExtension],
              answerValueSet: 'https://example.com/fhir/ValueSet/medications'
            },
            {
              linkId: 'dosage',
              text: 'Dosage',
              type: 'string'
            }
          ]
        }
      ]
    };

    // One repeat group instance whose only answer is the medication
    const questionnaireResponse: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'in-progress',
      item: [
        {
          linkId: 'new-medications',
          text: 'New medications',
          item: [
            {
              linkId: 'medication',
              text: 'Medication',
              answer: [
                {
                  valueCoding: {
                    system: 'http://snomed.info/sct',
                    code: '1162331000168106',
                    display: 'Cocaine (Perrigo) 0.5% mouthwash'
                  }
                }
              ]
            }
          ]
        }
      ]
    };

    render(
      <SmartFormsRenderer
        questionnaire={questionnaire}
        questionnaireResponse={questionnaireResponse}
      />
    );

    await waitFor(() => expect(screen.getByDisplayValue(/Cocaine/)).toBeTruthy());
    expect(getUpdatableResponseString()).toContain('1162331000168106');

    const clearButton = document.querySelector('.MuiAutocomplete-clearIndicator');
    expect(clearButton).toBeTruthy();
    fireEvent.click(clearButton as Element);

    // The whole row instance is removed - no { linkId, text, item: [] } husk remains
    await waitFor(() => expect(getUpdatableResponseString()).not.toContain('1162331000168106'));
    await waitFor(() =>
      expect(getUpdatableResponseString()).not.toContain('"linkId":"new-medications"')
    );
    // Only the response root remains, with an empty top-level item array
    expect((questionnaireResponseStore.getState().updatableResponse.item ?? []).length).toBe(0);
  });

  test('RepeatGroup - clearing one answer keeps the row when it still has other answers', async () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'active',
      item: [
        {
          linkId: 'new-medications',
          text: 'New medications',
          type: 'group',
          repeats: true,
          item: [
            {
              linkId: 'medication',
              text: 'Medication',
              type: 'choice',
              extension: [autocompleteItemControlExtension],
              answerValueSet: 'https://example.com/fhir/ValueSet/medications'
            },
            {
              linkId: 'dosage',
              text: 'Dosage',
              type: 'string'
            }
          ]
        }
      ]
    };

    const questionnaireResponse: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'in-progress',
      item: [
        {
          linkId: 'new-medications',
          text: 'New medications',
          item: [
            {
              linkId: 'medication',
              text: 'Medication',
              answer: [{ valueCoding: asthmaCoding }]
            },
            {
              linkId: 'dosage',
              text: 'Dosage',
              answer: [{ valueString: '5mg daily' }]
            }
          ]
        }
      ]
    };

    render(
      <SmartFormsRenderer
        questionnaire={questionnaire}
        questionnaireResponse={questionnaireResponse}
      />
    );

    await waitFor(() => expect(screen.getByDisplayValue('Asthma')).toBeTruthy());

    const clearButton = document.querySelector('.MuiAutocomplete-clearIndicator');
    fireEvent.click(clearButton as Element);

    // Medication answer removed, but the row survives because dosage still has a value
    await waitFor(() => expect(getUpdatableResponseString()).not.toContain('Asthma'));
    expect(getUpdatableResponseString()).toContain('5mg daily');
    expect(getUpdatableResponseString()).toContain('"linkId":"new-medications"');
  });

  test('gtable - clearing the only answer in a row removes the whole row instance', async () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'active',
      item: [
        {
          linkId: 'new-diagnoses',
          text: 'New diagnoses',
          type: 'group',
          repeats: true,
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
              valueCodeableConcept: {
                coding: [
                  {
                    system: 'http://hl7.org/fhir/questionnaire-item-control',
                    code: 'gtable'
                  }
                ]
              }
            }
          ],
          item: [
            {
              linkId: 'condition',
              text: 'Condition',
              type: 'open-choice',
              extension: [autocompleteItemControlExtension],
              answerValueSet: 'https://example.com/fhir/ValueSet/conditions'
            },
            {
              linkId: 'onset-date',
              text: 'Onset date',
              type: 'date'
            }
          ]
        }
      ]
    };

    const questionnaireResponse: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'in-progress',
      item: [
        {
          linkId: 'new-diagnoses',
          text: 'New diagnoses',
          item: [
            {
              linkId: 'condition',
              text: 'Condition',
              answer: [{ valueCoding: asthmaCoding }]
            }
          ]
        }
      ]
    };

    render(
      <SmartFormsRenderer
        questionnaire={questionnaire}
        questionnaireResponse={questionnaireResponse}
      />
    );

    await waitFor(() => expect(screen.getByDisplayValue('Asthma')).toBeTruthy());
    expect(getUpdatableResponseString()).toContain('Asthma');

    const clearButton = document.querySelector('.MuiAutocomplete-clearIndicator');
    expect(clearButton).toBeTruthy();
    fireEvent.click(clearButton as Element);

    // The whole row instance is removed - no { linkId, text, item: [] } husk remains
    await waitFor(() => expect(getUpdatableResponseString()).not.toContain('Asthma'));
    await waitFor(() =>
      expect(getUpdatableResponseString()).not.toContain('"linkId":"new-diagnoses"')
    );
    // Only the response root remains, with an empty top-level item array
    expect((questionnaireResponseStore.getState().updatableResponse.item ?? []).length).toBe(0);
  });

  test('RepeatItem Add Item button adds a visible empty row without changing the QuestionnaireResponse', async () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'active',
      item: [
        {
          linkId: 'condition',
          text: 'Condition',
          type: 'choice',
          repeats: true,
          extension: [autocompleteItemControlExtension],
          answerValueSet: 'https://example.com/fhir/ValueSet/conditions'
        }
      ]
    };

    const questionnaireResponse: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'in-progress',
      item: [
        {
          linkId: 'condition',
          text: 'Condition',
          answer: [{ id: 'condition-repeat-000000', valueCoding: asthmaCoding }]
        }
      ]
    };

    render(
      <SmartFormsRenderer
        questionnaire={questionnaire}
        questionnaireResponse={questionnaireResponse}
      />
    );

    await waitFor(() => expect(screen.getByDisplayValue('Asthma')).toBeTruthy());
    const responseBeforeAdd = getUpdatableResponseString();

    const addButton = document.querySelector('[data-test="button-add-repeat-item"]');
    expect(addButton).toBeTruthy();
    fireEvent.click(addButton as Element);

    // A second (empty) row is rendered
    await waitFor(() =>
      expect(
        document.querySelectorAll('[data-linkid="condition"] .MuiAutocomplete-root').length
      ).toBe(2)
    );

    // The QuestionnaireResponse is unchanged - no stub answer was added
    expect(getUpdatableResponseString()).toBe(responseBeforeAdd);
    expect(getUpdatableResponseString()).not.toContain('condition-repeat-000001');
  });
});
