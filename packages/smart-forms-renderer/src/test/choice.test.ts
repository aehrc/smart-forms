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

import type { Coding, QuestionnaireItemAnswerOption } from 'fhir/r4';
import {
  compareAnswerOptionValue,
  convertCodingsToAnswerOptions,
  findInAnswerOptions,
  getChoiceControlType,
  getChoiceOrientation,
  getQrChoiceValue,
  getRelevantCodingProperties,
  isCodingDisabled,
  isOptionDisabled,
  updateChoiceCheckboxAnswers
} from '../../src/utils/choice';
import { ChoiceItemControl, ChoiceItemOrientation } from '../interfaces/choice.enum';

describe('getRelevantCodingProperties', () => {
  const sampleCoding = {
    system: 'http://loinc.org',
    code: '1234-5',
    display: 'Test Code'
  };

  it('returns system, code, and display when no extension is present', () => {
    const result = getRelevantCodingProperties(sampleCoding);
    expect(result).toEqual({
      system: 'http://loinc.org',
      code: '1234-5',
      display: 'Test Code'
    });

    // Should not include "extension"
    expect(result).not.toHaveProperty('extension');
  });

  it('includes extension if present', () => {
    const sampleCodingWithExtension = {
      ...sampleCoding,
      extension: [{ url: 'x', valueString: 'y' }]
    };

    const result = getRelevantCodingProperties(sampleCodingWithExtension);
    expect(result).toEqual({
      system: 'http://loinc.org',
      code: '1234-5',
      display: 'Test Code',
      extension: [{ url: 'x', valueString: 'y' }]
    });
  });

  it('does not include other unexpected properties', () => {
    const sampleCodingWithExtension = {
      ...sampleCoding,
      designation: [
        {
          use: {
            system: 'http://terminology.hl7.org/CodeSystem/designation-usage',
            code: 'display'
          },
          value: 'Female'
        }
      ]
    };

    const result = getRelevantCodingProperties(sampleCodingWithExtension);
    expect(result).toEqual({
      system: 'http://loinc.org',
      code: '1234-5',
      display: 'Test Code'
    });
    expect(result).not.toHaveProperty('designation');
  });
});

describe('convertCodingsToAnswerOptions', () => {
  const sampleCoding1 = {
    system: 'http://loinc.org',
    code: '1234-5',
    display: 'Test Code One',
    otherField: 123
  };
  const sampleCoding2 = {
    system: 'http://snomed.info/sct',
    code: '5678-0',
    display: 'Test Code Two',
    extension: [{ url: 'x', valueString: 'y' }]
  };

  it('returns an empty array given no codings', () => {
    expect(convertCodingsToAnswerOptions([])).toEqual([]);
  });

  it('maps each coding to a QuestionnaireItemAnswerOption with valueCoding', () => {
    const codings = [sampleCoding1, sampleCoding2];
    const result = convertCodingsToAnswerOptions(codings);

    expect(result).toEqual([
      { valueCoding: { system: 'http://loinc.org', code: '1234-5', display: 'Test Code One' } },
      {
        valueCoding: {
          system: 'http://snomed.info/sct',
          code: '5678-0',
          display: 'Test Code Two',
          extension: [{ url: 'x', valueString: 'y' }]
        }
      }
    ]);
  });
});

describe('findInAnswerOptions', () => {
  const codingOption = {
    valueCoding: { system: 'http://loinc.org', code: '1234-5', display: 'Test Code' }
  };
  const codingDisplayOption = {
    valueCoding: { system: 'http://loinc.org', display: 'Test Display' }
  };
  const stringOption = {
    valueString: 'hello'
  };
  const intOption = {
    valueInteger: 42
  };
  const options = [codingOption, codingDisplayOption, stringOption, intOption];

  it('finds option by valueCoding.code', () => {
    const result = findInAnswerOptions(options, 'Test Code');
    expect(result).toEqual({
      valueCoding: { ...codingOption.valueCoding }
    });
  });

  it('finds option by valueCoding.display if code does not match', () => {
    const result = findInAnswerOptions(options, 'Test Display');
    expect(result).toEqual({
      valueCoding: { ...codingDisplayOption.valueCoding }
    });
  });

  it('finds option by valueString', () => {
    const result = findInAnswerOptions(options, 'hello');
    expect(result).toEqual({ valueString: 'hello' });
  });

  it('finds option by valueInteger', () => {
    const result = findInAnswerOptions(options, '42');
    expect(result).toEqual({ valueInteger: 42 });
  });

  it('returns undefined if no match', () => {
    const result = findInAnswerOptions(options, 'nope');
    expect(result).toBeUndefined();
  });

  it('returns undefined for empty options', () => {
    const result = findInAnswerOptions([], 'anything');
    expect(result).toBeUndefined();
  });
});

describe('compareAnswerOptionValue', () => {
  it('compares by valueCoding.code', () => {
    const sampleOption = {
      valueCoding: { system: 'http://loinc.org', code: '1234-5', display: 'Test Code' }
    };
    const correctValue = {
      valueCoding: { system: 'http://loinc.org', code: '1234-5', display: 'Test Code' }
    };
    const wrongValue = {
      valueCoding: { system: 'http://loinc.org', code: '6789-0', display: 'Wrong Code' }
    };
    expect(compareAnswerOptionValue(sampleOption, correctValue)).toBe(true);
    expect(compareAnswerOptionValue(sampleOption, wrongValue)).toBe(false);
  });

  it('compares by valueString', () => {
    const sampleOption = { valueString: 'hello' };
    const correctValue = { valueString: 'hello' };
    const wrongValue = { valueString: 'bar' };
    expect(compareAnswerOptionValue(sampleOption, correctValue)).toBe(true);
    expect(compareAnswerOptionValue(sampleOption, wrongValue)).toBe(false);
  });

  it('compares by valueInteger', () => {
    const sampleOption = { valueInteger: 42 };
    const correctValue = { valueInteger: 42 };
    const wrongValue = { valueInteger: 7 };
    expect(compareAnswerOptionValue(sampleOption, correctValue)).toBe(true);
    expect(compareAnswerOptionValue(sampleOption, wrongValue)).toBe(false);
  });

  it('compares by valueCoding.display when code missing', () => {
    const sampleOption = { valueCoding: { system: 'http://loinc.org', display: 'Test Code' } };
    const correctValue = { valueCoding: { system: 'http://loinc.org', display: 'Test Code' } };
    const wrongValue = { valueCoding: { system: 'http://loinc.org', display: 'Wrong Code' } };
    expect(compareAnswerOptionValue(sampleOption, correctValue)).toBe(true);
    expect(compareAnswerOptionValue(sampleOption, wrongValue)).toBe(false);
  });

  it('returns false if no branches match', () => {
    const sampleOption = { valueInteger: 42 };
    const wrongValue = { valueString: 'hello' };
    expect(compareAnswerOptionValue(sampleOption, wrongValue)).toBe(false);
  });
});

describe('getChoiceControlType', () => {
  it('returns Autocomplete if isSpecificItemControl detects autocomplete', () => {
    expect(
      getChoiceControlType({
        linkId: 'item1',
        type: 'choice',
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
            valueCodeableConcept: { coding: [{ code: 'autocomplete' }] }
          }
        ]
      })
    ).toBe(ChoiceItemControl.Autocomplete);
  });

  it('returns Checkbox if isSpecificItemControl detects check-box', () => {
    expect(
      getChoiceControlType({
        linkId: 'item1',
        type: 'choice',
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
            valueCodeableConcept: { coding: [{ code: 'check-box' }] }
          }
        ]
      })
    ).toBe(ChoiceItemControl.Checkbox);
  });

  it('returns Radio if isSpecificItemControl detects radio-button', () => {
    expect(
      getChoiceControlType({
        linkId: 'item1',
        type: 'choice',
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
            valueCodeableConcept: { coding: [{ code: 'radio-button' }] }
          }
        ]
      })
    ).toBe(ChoiceItemControl.Radio);
  });

  it('returns Select if isSpecificItemControl detects drop-down', () => {
    expect(
      getChoiceControlType({
        linkId: 'item1',
        type: 'choice',
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
            valueCodeableConcept: { coding: [{ code: 'drop-down' }] }
          }
        ]
      })
    ).toBe(ChoiceItemControl.Select);
  });

  it('returns Select as default if no matching (choice) item control', () => {
    expect(
      getChoiceControlType({
        linkId: 'item1',
        type: 'choice',
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
            valueCodeableConcept: { coding: [{ code: 'tab-container' }] }
          }
        ]
      })
    ).toBe(ChoiceItemControl.Select);
  });

  it('returns Select if no extension present', () => {
    expect(
      getChoiceControlType({
        linkId: 'item1',
        type: 'choice'
      })
    ).toBe(ChoiceItemControl.Select);
  });
});

describe('getQrChoiceValue', () => {
  it('returns code from valueCoding if present', () => {
    const qrChoice = {
      linkId: 'item1',
      type: 'choice',
      answer: [
        { valueCoding: { system: 'http://loinc.org', code: '1234-5', display: 'Test Code' } }
      ]
    };
    expect(getQrChoiceValue(qrChoice)).toBe('1234-5');
  });

  it('returns display from valueCoding if code is missing', () => {
    const qrChoice = {
      linkId: 'item1',
      answer: [{ valueCoding: { system: 'http://loinc.org', display: 'Test Display' } }]
    };
    expect(getQrChoiceValue(qrChoice)).toBe('Test Display');
  });

  it('returns empty string if valueCoding code and display are missing', () => {
    const qrChoice = {
      linkId: 'item1',
      answer: [{ valueCoding: { system: 'http://loinc.org' } }]
    };
    expect(getQrChoiceValue(qrChoice)).toBe('');
  });

  it('returns valueString if present', () => {
    const qrChoice = {
      linkId: 'item1',
      answer: [{ valueString: 'hello' }]
    };
    expect(getQrChoiceValue(qrChoice)).toBe('hello');
  });

  it('returns valueInteger as string if present', () => {
    const qrChoice = {
      linkId: 'item1',
      answer: [{ valueInteger: 42 }]
    };
    expect(getQrChoiceValue(qrChoice)).toBe('42');
  });

  it('returns empty string if answer is missing', () => {
    expect(
      getQrChoiceValue({
        linkId: 'item1'
      })
    ).toBe('');
    expect(
      getQrChoiceValue({
        linkId: 'item1',
        answer: []
      })
    ).toBe('');
  });

  it('returns null if returnNull is true and answer is missing', () => {
    expect(
      getQrChoiceValue(
        {
          linkId: 'item1',
          answer: []
        },
        true
      )
    ).toBeNull();
  });
});

describe('updateChoiceCheckboxAnswers', () => {
  const options: QuestionnaireItemAnswerOption[] = [
    { valueString: 'Sugary drinks' },
    { valueString: 'Screen use' },
    { valueString: 'Environmental exposure to harmful elements eg tobacco smoke' }
  ];

  const oldQrItem = { linkId: 'brief-intervention', text: 'Brief intervention', answer: [] };

  it('returns null if changedValue not in options', () => {
    const answers: QuestionnaireItemAnswerOption[] = [];
    const result = updateChoiceCheckboxAnswers(
      'Nonexistent',
      answers,
      options,
      oldQrItem,
      true,
      undefined
    );
    expect(result).toBeNull();
  });

  it('adds answer if not present (multi-select)', () => {
    const answers: QuestionnaireItemAnswerOption[] = [];
    const result = updateChoiceCheckboxAnswers(
      'Sugary drinks',
      answers,
      options,
      oldQrItem,
      true,
      'random-key'
    );
    expect(result).toEqual({
      ...oldQrItem,
      answer: [{ valueString: 'Sugary drinks', id: 'random-key' }]
    });
  });

  it('removes answer if already present (multi-select)', () => {
    const answers: QuestionnaireItemAnswerOption[] = [{ valueString: 'Sugary drinks' }];
    const result = updateChoiceCheckboxAnswers(
      'Sugary drinks',
      answers,
      options,
      oldQrItem,
      true,
      'random-key'
    );
    expect(result).toEqual({
      ...oldQrItem,
      // Removed the only one
      answer: []
    });
  });

  it('adds to other selected (multi-select)', () => {
    const answers: QuestionnaireItemAnswerOption[] = [{ valueString: 'Screen use' }];
    const result = updateChoiceCheckboxAnswers(
      'Sugary drinks',
      answers,
      options,
      oldQrItem,
      true,
      'random-key'
    );
    expect(result).toEqual({
      ...oldQrItem,
      answer: [
        { valueString: 'Screen use', id: 'random-key' },
        { valueString: 'Sugary drinks', id: 'random-key' }
      ]
    });
  });

  it('removes just the toggled one (multi-select)', () => {
    const answers: QuestionnaireItemAnswerOption[] = [
      { valueString: 'Sugary drinks' },
      { valueString: 'Screen use' }
    ];
    const result = updateChoiceCheckboxAnswers(
      'Sugary drinks',
      answers,
      options,
      oldQrItem,
      true,
      'random-key'
    );
    expect(result).toEqual({
      ...oldQrItem,
      answer: [{ valueString: 'Screen use', id: 'random-key' }]
    });
  });

  it('sets to answer if not present (single-select)', () => {
    const answers: QuestionnaireItemAnswerOption[] = [];
    const result = updateChoiceCheckboxAnswers(
      'Screen use',
      answers,
      options,
      oldQrItem,
      false,
      'random-key'
    );
    expect(result).toEqual({
      ...oldQrItem,
      answer: [{ valueString: 'Screen use', id: 'random-key' }]
    });
  });

  it('clears answer if already present (single-select)', () => {
    const answers: QuestionnaireItemAnswerOption[] = [{ valueString: 'Screen use' }];
    const result = updateChoiceCheckboxAnswers(
      'Screen use',
      answers,
      options,
      oldQrItem,
      false,
      'random-key'
    );
    expect(result).toEqual({
      ...oldQrItem,
      answer: []
    });
  });

  it('id can be undefined (multi-select)', () => {
    const answers: QuestionnaireItemAnswerOption[] = [];
    const result = updateChoiceCheckboxAnswers(
      'Environmental exposure to harmful elements eg tobacco smoke',
      answers,
      options,
      oldQrItem,
      true,
      undefined
    );
    expect(result).toEqual({
      ...oldQrItem,
      answer: [
        {
          valueString: 'Environmental exposure to harmful elements eg tobacco smoke',
          id: undefined
        }
      ]
    });
  });
});

describe('getChoiceOrientation', () => {
  it('returns Horizontal when extension code is "horizontal"', () => {
    expect(
      getChoiceOrientation({
        linkId: 'item1',
        type: 'choice',
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-choiceOrientation',
            valueCode: 'horizontal'
          }
        ]
      })
    ).toBe(ChoiceItemOrientation.Horizontal);
  });

  it('returns Vertical when extension code is "vertical"', () => {
    expect(
      getChoiceOrientation({
        linkId: 'item1',
        type: 'choice',
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-choiceOrientation',
            valueCode: 'vertical'
          }
        ]
      })
    ).toBe(ChoiceItemOrientation.Vertical);
  });

  it('returns null when extension array is missing', () => {
    expect(
      getChoiceOrientation({
        linkId: 'item1',
        type: 'choice'
      })
    ).toBeNull();
  });
});

describe('isOptionDisabled', () => {
  const sampleOption: QuestionnaireItemAnswerOption = {
    valueCoding: {
      system: 'http://loinc.org',
      code: '1234-5',
      display: 'Example'
    }
  };
  const optionKey = 'coding:http://loinc.org-1234-5-Example';
  it('returns false if the toggle map is empty', () => {
    const map = new Map();
    expect(isOptionDisabled(sampleOption, map)).toBe(false);
  });

  it('returns true if the key exists and its value is false', () => {
    const map = new Map([[optionKey, false]]);
    expect(isOptionDisabled(sampleOption, map)).toBe(true);
  });

  it('returns false if the key exists and its value is true', () => {
    const map = new Map([[optionKey, true]]);
    expect(isOptionDisabled(sampleOption, map)).toBe(false);
  });

  it('returns false if the key does not exist in the map', () => {
    const map = new Map([['some-other-key', false]]);
    expect(isOptionDisabled(sampleOption, map)).toBe(false);
  });
});

describe('isCodingDisabled', () => {
  const sampleCoding: Coding = {
    system: 'http://loinc.org',
    code: '1234-5',
    display: 'Example'
  };
  const codingKey = 'coding:http://loinc.org-1234-5-Example';

  it('returns false if the toggle map is empty', () => {
    const map = new Map();
    expect(isCodingDisabled(sampleCoding, map)).toBe(false);
  });

  it('returns true if the key exists and its value is false', () => {
    const map = new Map([[codingKey, false]]);
    expect(isCodingDisabled(sampleCoding, map)).toBe(true);
  });

  it('returns false if the key exists and its value is true', () => {
    const map = new Map([[codingKey, true]]);
    expect(isCodingDisabled(sampleCoding, map)).toBe(false);
  });

  it('returns false if the key does not exist in the map', () => {
    const map = new Map([['some-other-key', false]]);
    expect(isCodingDisabled(sampleCoding, map)).toBe(false);
  });
});
