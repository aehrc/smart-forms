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

import {
  getDecimalPrecision,
  getMarkdownString,
  getMaxQuantityValue,
  getMaxQuantityValueFeedback,
  getMaxValue,
  getMaxValueFeedback,
  getMinQuantityValue,
  getMinQuantityValueFeedback,
  getMinValue,
  getMinValueFeedback,
  getOpenLabelText,
  getQuantityUnit,
  getRegexString,
  getRegexValidation,
  getRequiredFeedback,
  getShortText,
  getTextDisplayFlyover,
  getTextDisplayInstructions,
  getTextDisplayLower,
  getTextDisplayPrompt,
  getTextDisplayUnit,
  getTextDisplayUpper,
  getXHtmlString,
  getXHtmlStringFromExtension,
  hasDisplayCategory,
  hasItemControl,
  isItemTextHidden,
  isSpecificDisplayCategory,
  isSpecificItemControl,
  shouldRenderNestedItems
} from '../utils/extensions';
import type { Extension, QuestionnaireItem } from 'fhir/r4';
import React from 'react';

describe('hasDisplayCategory', () => {
  const DISPLAY_CATEGORY_URL =
    'http://hl7.org/fhir/StructureDefinition/questionnaire-displayCategory';

  it('returns true when extension with questionnaire-displayCategory url is present', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'choice',
      extension: [
        {
          url: DISPLAY_CATEGORY_URL,
          valueCodeableConcept: {
            coding: [
              {
                system: 'http://hl7.org/fhir/questionnaire-display-category',
                code: 'instructions'
              }
            ]
          }
        }
      ]
    };
    expect(hasDisplayCategory(qItem)).toBe(true);
  });

  it('returns false when extension array is present but without displayCategory url', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'choice',
      extension: [{ url: 'http://example.org/some-other-extension' }]
    };
    expect(hasDisplayCategory(qItem)).toBe(false);
  });

  it('returns false when no extensions are present', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'choice'
    };
    expect(hasDisplayCategory(qItem)).toBe(false);
  });
});

describe('hasItemControl', () => {
  it('returns true when extension with questionnaire-itemControl url is present', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'choice',
      extension: [{ url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl' }]
    };
    expect(hasItemControl(qItem)).toBe(true);
  });

  it('returns false when extension array is present but without itemControl url', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'choice',
      extension: [{ url: 'http://example.org/some-other-extension' }]
    };
    expect(hasItemControl(qItem)).toBe(false);
  });

  it('returns false when no extensions are present', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'choice'
    };
    expect(hasItemControl(qItem)).toBe(false);
  });
});

describe('shouldRenderNestedItems', () => {
  const DISPLAY_CATEGORY_URL =
    'http://hl7.org/fhir/StructureDefinition/questionnaire-displayCategory';
  const ITEM_CONTROL_URL = 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl';

  // Helper to create a child QuestionnaireItem with type and optional extensions
  function createChild(
    display: QuestionnaireItem['type'],
    extensions?: Extension[]
  ): QuestionnaireItem {
    return {
      linkId: 'q1-child',
      type: display,
      extension: extensions
    };
  }

  it('returns false if all nested items are type display and each has displayCategory extension', () => {
    const children = [
      createChild('display', [{ url: DISPLAY_CATEGORY_URL }]),
      createChild('display', [{ url: DISPLAY_CATEGORY_URL }])
    ];

    expect(shouldRenderNestedItems({ linkId: 'q1', type: 'string', item: children })).toBe(false);
  });

  it('returns false if all nested items are type display and each has itemControl extension', () => {
    const children = [
      createChild('display', [{ url: ITEM_CONTROL_URL }]),
      createChild('display', [{ url: ITEM_CONTROL_URL }])
    ];

    expect(shouldRenderNestedItems({ linkId: 'q1', type: 'string', item: children })).toBe(false);
  });

  it('returns false if all nested items are type display and each has either displayCategory or itemControl extension', () => {
    const children = [
      createChild('display', [{ url: DISPLAY_CATEGORY_URL }]),
      createChild('display', [{ url: ITEM_CONTROL_URL }])
    ];

    expect(shouldRenderNestedItems({ linkId: 'q1', type: 'string', item: children })).toBe(false);
  });

  it('returns true if any nested item is not of type display', () => {
    const children = [
      createChild('display', [{ url: DISPLAY_CATEGORY_URL }]),
      createChild('string'), // not display type
      createChild('display', [{ url: ITEM_CONTROL_URL }])
    ];

    expect(shouldRenderNestedItems({ linkId: 'q1', type: 'string', item: children })).toBe(true);
  });

  it('returns true if a nested item of type display lacks displayCategory and itemControl extensions', () => {
    const children = [
      createChild('display'), // no extensions
      createChild('display', [{ url: DISPLAY_CATEGORY_URL }])
    ];

    expect(shouldRenderNestedItems({ linkId: 'q1', type: 'string', item: children })).toBe(true);
  });
});

describe('isSpecificItemControl', () => {
  const ITEM_CONTROL_URL = 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl';

  it('returns true if itemControl extension with matching code exists', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'choice',
      extension: [
        {
          url: ITEM_CONTROL_URL,
          valueCodeableConcept: {
            coding: [
              { system: 'http://hl7.org/fhir/questionnaire-item-control', code: 'check-box' }
            ]
          }
        }
      ]
    };

    expect(isSpecificItemControl(qItem, 'check-box')).toBe(true);
    expect(isSpecificItemControl(qItem, 'radio-button')).toBe(false);
  });

  it('returns false if no itemControl extensions', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'choice'
    };
    expect(isSpecificItemControl(qItem, 'check-box')).toBe(false);
  });

  it('returns false if extensions exist but not the correct url', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'choice',
      extension: [
        {
          url: 'http://example.org/some-other-extension',
          valueCodeableConcept: {
            coding: [{ code: 'check-box' }]
          }
        }
      ]
    };
    expect(isSpecificItemControl(qItem, 'check-box')).toBe(false);
  });
});

describe('isSpecificDisplayCategory', () => {
  const DISPLAY_CATEGORY_URL =
    'http://hl7.org/fhir/StructureDefinition/questionnaire-displayCategory';

  it('returns true if questionnaire-displayCategory extension with matching code exists', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'choice',
      extension: [
        {
          url: DISPLAY_CATEGORY_URL,
          valueCodeableConcept: {
            coding: [
              { system: 'http://hl7.org/fhir/questionnaire-display-category', code: 'instructions' }
            ]
          }
        }
      ]
    };

    expect(isSpecificDisplayCategory(qItem, 'instructions')).toBe(true);
    expect(isSpecificDisplayCategory(qItem, 'security')).toBe(false);
  });

  it('returns false if no questionnaire-displayCategory extension', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'choice',
      extension: [
        {
          url: DISPLAY_CATEGORY_URL,
          valueCodeableConcept: {
            coding: [
              { system: 'http://hl7.org/fhir/questionnaire-item-control', code: 'check-box' }
            ]
          }
        }
      ]
    };

    expect(isSpecificDisplayCategory(qItem, 'instructions')).toBe(false);
  });

  it('returns false if extensions missing', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'choice'
    };
    expect(isSpecificDisplayCategory(qItem, 'instructions')).toBe(false);
  });

  it('returns false if extensions exist but not the correct url', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'choice',
      extension: [
        {
          url: 'http://example.org/some-other-extension',
          valueCodeableConcept: {
            coding: [{ code: 'instructions' }]
          }
        }
      ]
    };
    expect(isSpecificItemControl(qItem, 'instructions')).toBe(false);
  });
});

describe('getShortText', () => {
  const SHORT_TEXT_URL =
    'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-shortText';

  it('returns the short text when extension is present', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'group',
      extension: [{ url: SHORT_TEXT_URL, valueString: 'Summary text' }]
    };
    expect(getShortText(qItem)).toBe('Summary text');
  });

  it('returns null when relevant extension url is not present', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'group',
      extension: [{ url: 'http://other-url', valueString: 'Other text' }]
    };
    expect(getShortText(qItem)).toBeNull();
  });

  it('returns null when there are no extensions', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'group'
    };
    expect(getShortText(qItem)).toBeNull();
  });

  it('returns null if extension with the URL exists but no valueString', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'group',
      extension: [{ url: SHORT_TEXT_URL }]
    };
    expect(getShortText(qItem)).toBeNull();
  });

  it('returns the first matching short text if multiple matching extensions exist', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'group',
      extension: [
        { url: SHORT_TEXT_URL, valueString: 'First' },
        { url: SHORT_TEXT_URL, valueString: 'Second' }
      ]
    };
    expect(getShortText(qItem)).toBe('First');
  });
});

describe('getOpenLabelText', () => {
  const OPEN_LABEL_URL =
    'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-openLabel';

  it('returns the open label text when extension is present', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'open-choice',
      extension: [{ url: OPEN_LABEL_URL, valueString: 'Specify other' }]
    };
    expect(getOpenLabelText(qItem)).toBe('Specify other');
  });

  it('returns "Other" when relevant extension url is not present', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'open-choice',
      extension: [{ url: 'http://other-url', valueString: 'Not open label' }]
    };
    expect(getOpenLabelText(qItem)).toBe('Other');
  });

  it('returns "Other" when there are no extensions', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'open-choice'
    };
    expect(getOpenLabelText(qItem)).toBe('Other');
  });

  it('returns "Other" if the open label extension exists but has no valueString', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'open-choice',
      extension: [{ url: OPEN_LABEL_URL }]
    };
    expect(getOpenLabelText(qItem)).toBe('Other');
  });

  it('returns the first matching open label text if multiple matching extensions exist', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'open-choice',
      extension: [
        { url: OPEN_LABEL_URL, valueString: 'First' },
        { url: OPEN_LABEL_URL, valueString: 'Second' }
      ]
    };
    expect(getOpenLabelText(qItem)).toBe('First');
  });
});

describe('getDecimalPrecision', () => {
  const PRECISION_URL = 'http://hl7.org/fhir/StructureDefinition/quantity-precision';

  it('returns the precision when extension is present', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'decimal',
      extension: [{ url: PRECISION_URL, valueInteger: 2 }]
    };
    expect(getDecimalPrecision(qItem)).toBe(2);
  });

  it('returns null when relevant extension url is not present', () => {
    const item: QuestionnaireItem = {
      linkId: 'q1',
      type: 'decimal',
      extension: [{ url: 'http://other-url', valueInteger: 3 }]
    };
    expect(getDecimalPrecision(item)).toBeNull();
  });

  it('returns null when there are no extensions', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'decimal'
    };
    expect(getDecimalPrecision(qItem)).toBeNull();
  });

  it('returns null if precision extension exists but has no valueInteger', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'decimal',
      extension: [{ url: PRECISION_URL }]
    };
    expect(getDecimalPrecision(qItem)).toBeNull();
  });

  it('returns the first matching precision if multiple matching extensions exist', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'decimal',
      extension: [
        { url: PRECISION_URL, valueInteger: 1 },
        { url: PRECISION_URL, valueInteger: 5 }
      ]
    };
    expect(getDecimalPrecision(qItem)).toBe(1);
  });
});

describe('getXHtmlStringFromExtension', () => {
  const XHTML_URL = 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml';

  it('returns the xhtml string when extension is present', () => {
    const extensions: Extension[] = [{ url: XHTML_URL, valueString: '<div>Some XHTML</div>' }];
    expect(getXHtmlStringFromExtension(extensions)).toBe('<div>Some XHTML</div>');
  });

  it('returns null if no extensions have the correct url', () => {
    const extensions: Extension[] = [{ url: 'http://other-url', valueString: 'Not XHTML' }];
    expect(getXHtmlStringFromExtension(extensions)).toBeNull();
  });

  it('returns null when the extensions array is empty', () => {
    const extensions: Extension[] = [];
    expect(getXHtmlStringFromExtension(extensions)).toBeNull();
  });

  it('returns null if xhtml extension exists but has no valueString', () => {
    const extensions: Extension[] = [{ url: XHTML_URL }];
    expect(getXHtmlStringFromExtension(extensions)).toBeNull();
  });

  it('returns the first matching xhtml string if multiple matching extensions exist', () => {
    const extensions: Extension[] = [
      { url: XHTML_URL, valueString: '<div>First</div>' },
      { url: XHTML_URL, valueString: '<div>Second</div>' }
    ];
    expect(getXHtmlStringFromExtension(extensions)).toBe('<div>First</div>');
  });
});

describe('getXHtmlString', () => {
  const XHTML_URL = 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml';

  it('returns XHTML string from qItem.extension if present', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'display',
      extension: [{ url: XHTML_URL, valueString: '<div>From extension</div>' }]
    };
    expect(getXHtmlString(qItem)).toBe('<div>From extension</div>');
  });

  it('returns XHTML string from qItem._text.extension if not present on qItem.extension', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'display',
      extension: [{ url: 'http://other-url', valueString: 'irrelevant' }],
      _text: {
        extension: [{ url: XHTML_URL, valueString: '<div>From _text</div>' }]
      }
    };
    expect(getXHtmlString(qItem)).toBe('<div>From _text</div>');
  });

  it('returns null if neither extension nor _text.extension have XHTML', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'display',
      extension: [{ url: 'http://other-url', valueString: 'irrelevant' }],
      _text: {
        extension: [{ url: 'http://other-url', valueString: 'still irrelevant' }]
      }
    };
    expect(getXHtmlString(qItem)).toBeNull();
  });

  it('returns null if both extension and _text are missing', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'display'
    };
    expect(getXHtmlString(qItem)).toBeNull();
  });

  it('returns null if only _text is present but _text.extension is missing', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'display',
      _text: {}
    };
    expect(getXHtmlString(qItem)).toBeNull();
  });
});

describe('getMarkdownString', () => {
  const MARKDOWN_URL = 'http://hl7.org/fhir/StructureDefinition/rendering-markdown';

  it('returns the markdown string when extension is present', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'display',
      _text: {
        extension: [{ url: MARKDOWN_URL, valueMarkdown: 'This is **markdown**!' }]
      }
    };
    expect(getMarkdownString(qItem._text)).toBe('This is **markdown**!');
  });

  it('returns null if no extensions have the correct url', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'display',
      _text: {
        extension: [{ url: 'http://other-url', valueMarkdown: 'Not markdown' }]
      }
    };
    expect(getMarkdownString(qItem._text)).toBeNull();
  });

  it('returns null if extension exists but has no valueMarkdown', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'display',
      _text: {
        extension: [{ url: MARKDOWN_URL }]
      }
    };
    expect(getMarkdownString(qItem._text)).toBeNull();
  });

  it('returns null if _text or _text.extension is missing', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'display'
    };
    expect(getMarkdownString(qItem._text)).toBeNull();

    qItem._text = {};
    expect(getMarkdownString(qItem._text)).toBeNull();
  });

  it('returns the first matching markdown if multiple matching extensions exist', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'display',
      _text: {
        extension: [
          { url: MARKDOWN_URL, valueMarkdown: 'First' },
          { url: MARKDOWN_URL, valueMarkdown: 'Second' }
        ]
      }
    };
    expect(getMarkdownString(qItem._text)).toBe('First');
  });
});

describe('getTextDisplayPrompt', () => {
  const ITEM_CONTROL_URL = 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl';

  it('returns display prompt with first letter capitalized when prompt childItem exists', () => {
    const item: QuestionnaireItem = {
      linkId: 'q1',
      type: 'string',
      item: [
        {
          linkId: 'q1-child',
          type: 'display',
          text: 'example prompt',
          extension: [
            {
              url: ITEM_CONTROL_URL,
              valueCodeableConcept: {
                coding: [
                  {
                    system: 'http://hl7.org/fhir/questionnaire-item-control',
                    code: 'prompt'
                  }
                ]
              }
            }
          ]
        }
      ]
    };
    expect(getTextDisplayPrompt(item)).toBe('Example prompt');
  });

  it('returns empty string if there are no child items', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'string'
    };
    expect(getTextDisplayPrompt(qItem)).toBe('');
  });

  it('returns empty string if no child item has type display', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'string',
      item: [
        {
          linkId: 'q1-child',
          type: 'boolean',
          text: 'not display'
        }
      ]
    };
    expect(getTextDisplayPrompt(qItem)).toBe('');
  });

  it('returns empty string if child display item does not have prompt control', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'string',
      item: [
        {
          linkId: 'q1-child',
          type: 'display',
          text: 'not prompt'
        }
      ]
    };
    expect(getTextDisplayPrompt(qItem)).toBe('');
  });
});

describe('getQuantityUnit', () => {
  const UNIT_URL = 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit';

  it('returns valueCoding wrapped as QuestionnaireItemAnswerOption if present', () => {
    const coding = { system: 'http://unitsofmeasure.org', code: 'kg', display: 'kg' };
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'quantity',
      extension: [{ url: UNIT_URL, valueCoding: coding }]
    };
    expect(getQuantityUnit(qItem)).toEqual({ valueCoding: coding });
  });

  it('returns null if extension with the correct url is not present', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'quantity',
      extension: [{ url: 'http://other-url', valueCoding: { code: 'g' } }]
    };
    expect(getQuantityUnit(qItem)).toBeNull();
  });

  it('returns null if unit extension exists but has no valueCoding', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'quantity',
      extension: [{ url: UNIT_URL }]
    };
    expect(getQuantityUnit(qItem)).toBeNull();
  });

  it('returns the first matching valueCoding if multiple matching extensions exist', () => {
    const coding1 = { system: 'http://unitsofmeasure.org', code: 'cm', display: 'cm' };
    const coding2 = { system: 'http://unitsofmeasure.org', code: 'm', display: 'm' };
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'quantity',
      extension: [
        { url: UNIT_URL, valueCoding: coding1 },
        { url: UNIT_URL, valueCoding: coding2 }
      ]
    };
    expect(getQuantityUnit(qItem)).toEqual({ valueCoding: coding1 });
  });

  it('returns null if there is no extension array', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'quantity'
    };
    expect(getQuantityUnit(qItem)).toBeNull();
  });
});

describe('getTextDisplayUnit', () => {
  const ITEM_CONTROL_URL = 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl';
  const UNIT_URL = 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit';

  it('returns the text of the first display child with itemControl unit', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'quantity',
      item: [
        {
          linkId: 'q1-child',
          type: 'display',
          text: 'kg',
          extension: [
            {
              url: ITEM_CONTROL_URL,
              valueCodeableConcept: {
                coding: [
                  {
                    system: 'http://hl7.org/fhir/questionnaire-item-control',
                    code: 'unit'
                  }
                ]
              }
            }
          ]
        }
      ]
    };
    expect(getTextDisplayUnit(qItem)).toBe('kg');
  });

  it('returns valueCoding.display from unit extension if no display child item matches', () => {
    const coding = { system: 'http://unitsofmeasure.org', code: 'kg', display: 'kg' };
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'quantity',
      extension: [{ url: UNIT_URL, valueCoding: coding }]
    };
    expect(getTextDisplayUnit(qItem)).toBe('kg');
  });

  it('returns text of the first display child with itemControl unit if both exists', () => {
    const coding = { system: 'http://unitsofmeasure.org', code: 'kg', display: 'kilogram' };
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'quantity',
      extension: [{ url: UNIT_URL, valueCoding: coding }],
      item: [
        {
          linkId: 'q1-child',
          type: 'display',
          text: 'kg',
          extension: [
            {
              url: ITEM_CONTROL_URL,
              valueCodeableConcept: {
                coding: [
                  {
                    system: 'http://hl7.org/fhir/questionnaire-item-control',
                    code: 'unit'
                  }
                ]
              }
            }
          ]
        }
      ]
    };

    // Should prefer display child over unit extension
    expect(getTextDisplayUnit(qItem)).toBe('kg');
  });

  it('returns empty string if unit extension exists but has no valueCoding', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'quantity',
      extension: [{ url: UNIT_URL }]
    };
    expect(getTextDisplayUnit(qItem)).toBe('');
  });
});

describe('getTextDisplayLower', () => {
  const ITEM_CONTROL_URL = 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl';

  it('returns the text of the first display child with lower control', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'integer',
      item: [
        {
          linkId: 'q1-child-lower',
          type: 'display',
          text: 'Min: 0',
          extension: [
            {
              url: ITEM_CONTROL_URL,
              valueCodeableConcept: {
                coding: [
                  {
                    system: 'http://hl7.org/fhir/questionnaire-item-control',
                    code: 'lower'
                  }
                ]
              }
            }
          ]
        }
      ]
    };
    expect(getTextDisplayLower(qItem)).toBe('Min: 0');
  });

  it('returns empty string if there is no child item', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'integer'
    };
    expect(getTextDisplayLower(qItem)).toBe('');
  });

  it('returns empty string if display child does not have lower control', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'integer',
      item: [
        {
          linkId: 'q1-child-upper',
          type: 'display',
          text: 'Max: 5',
          extension: [
            {
              url: ITEM_CONTROL_URL,
              valueCodeableConcept: {
                coding: [
                  {
                    system: 'http://hl7.org/fhir/questionnaire-item-control',
                    code: 'upper'
                  }
                ]
              }
            }
          ]
        }
      ]
    };
    expect(getTextDisplayLower(qItem)).toBe('');
  });

  it('handles item.text missing gracefully', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'integer',
      item: [
        {
          linkId: 'q1-child-lower',
          type: 'display',
          extension: [
            {
              url: ITEM_CONTROL_URL,
              valueCodeableConcept: {
                coding: [
                  {
                    system: 'http://hl7.org/fhir/questionnaire-item-control',
                    code: 'lower'
                  }
                ]
              }
            }
          ]
        }
      ]
    };
    expect(getTextDisplayLower(qItem)).toBe('');
  });
});

describe('getTextDisplayUpper', () => {
  const ITEM_CONTROL_URL = 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl';

  it('returns the text of the first display child with upper control', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'integer',
      item: [
        {
          linkId: 'q1-child-upper',
          type: 'display',
          text: 'Max: 12',
          extension: [
            {
              url: ITEM_CONTROL_URL,
              valueCodeableConcept: {
                coding: [
                  {
                    system: 'http://hl7.org/fhir/questionnaire-item-control',
                    code: 'upper'
                  }
                ]
              }
            }
          ]
        }
      ]
    };
    expect(getTextDisplayUpper(qItem)).toBe('Max: 12');
  });

  it('returns empty string if there is no child item', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'integer'
    };
    expect(getTextDisplayUpper(qItem)).toBe('');
  });

  it('returns empty string if display child does not have upper control', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'integer',
      item: [
        {
          linkId: 'q1-child-lower',
          type: 'display',
          text: 'Min: 0',
          extension: [
            {
              url: ITEM_CONTROL_URL,
              valueCodeableConcept: {
                coding: [
                  {
                    system: 'http://hl7.org/fhir/questionnaire-item-control',
                    code: 'lower'
                  }
                ]
              }
            }
          ]
        }
      ]
    };
    expect(getTextDisplayUpper(qItem)).toBe('');
  });

  it('handles item.text missing gracefully', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'integer',
      item: [
        {
          linkId: 'q1-child-upper',
          type: 'display',
          extension: [
            {
              url: ITEM_CONTROL_URL,
              valueCodeableConcept: {
                coding: [
                  {
                    system: 'http://hl7.org/fhir/questionnaire-item-control',
                    code: 'upper'
                  }
                ]
              }
            }
          ]
        }
      ]
    };
    expect(getTextDisplayUpper(qItem)).toBe('');
  });
});

describe('getTextDisplayInstructions', () => {
  const DISPLAY_CATEGORY_URL =
    'http://hl7.org/fhir/StructureDefinition/questionnaire-displayCategory';

  it('returns the text of the first display child with instructions control', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'group',
      item: [
        {
          linkId: 'q1-child-instructions',
          type: 'display',
          text: 'Please answer all questions.',
          extension: [
            {
              url: DISPLAY_CATEGORY_URL,
              valueCodeableConcept: {
                coding: [
                  {
                    system: 'http://hl7.org/fhir/questionnaire-item-control',
                    code: 'instructions'
                  }
                ]
              }
            }
          ]
        }
      ]
    };
    expect(getTextDisplayInstructions(qItem)).toBe('Please answer all questions.');
  });

  it('returns empty string if there is no child item', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'group'
    };
    expect(getTextDisplayInstructions(qItem)).toBe('');
  });

  it('returns empty string if display child does not have instructions control', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'group',
      item: [
        {
          linkId: 'q1-child-help',
          type: 'display',
          text: 'Need help?',
          extension: [
            {
              url: DISPLAY_CATEGORY_URL,
              valueCodeableConcept: {
                coding: [
                  {
                    system: 'http://hl7.org/fhir/StructureDefinition/questionnaire-displayCategory',
                    code: 'legal'
                  }
                ]
              }
            }
          ]
        }
      ]
    };
    expect(getTextDisplayInstructions(qItem)).toBe('');
  });

  it('handles item.text missing gracefully', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'group',
      item: [
        {
          linkId: 'q1-child-instructions',
          type: 'display',
          extension: [
            {
              url: DISPLAY_CATEGORY_URL,
              valueCodeableConcept: {
                coding: [
                  {
                    system: 'http://hl7.org/fhir/StructureDefinition/questionnaire-displayCategory',
                    code: 'instructions'
                  }
                ]
              }
            }
          ]
        }
      ]
    };
    expect(getTextDisplayInstructions(qItem)).toBe('');
  });

  it('returns empty string if display child type is not "display"', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'group',
      item: [
        {
          linkId: 'q1-child-instructions',
          type: 'group',
          text: 'Instructions here',
          extension: [
            {
              url: DISPLAY_CATEGORY_URL,
              valueCodeableConcept: {
                coding: [
                  {
                    system: 'http://hl7.org/fhir/StructureDefinition/questionnaire-displayCategory',
                    code: 'instructions'
                  }
                ]
              }
            }
          ]
        }
      ]
    };
    expect(getTextDisplayInstructions(qItem)).toBe('');
  });
});

describe('getTextDisplayFlyover', () => {
  const ITEM_CONTROL_URL = 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl';

  it('returns parsed xHtmlString when getXHtmlString returns a value', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'group',
      item: [
        {
          linkId: 'q1-child-flyover',
          type: 'display',
          text: 'flyover fallback text',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
                valueString: '<div xmlns="http://www.w3.org/1999/xhtml">Flyover from XHTML</div>'
              }
            ]
          },
          extension: [
            {
              url: ITEM_CONTROL_URL,
              valueCodeableConcept: {
                coding: [
                  {
                    system: 'http://hl7.org/fhir/questionnaire-item-control',
                    code: 'flyover'
                  }
                ]
              }
            }
          ]
        }
      ]
    };

    const jsxResult = getTextDisplayFlyover(qItem);

    // Ensure it's a valid React element
    expect(React.isValidElement(jsxResult)).toBe(true);

    // Check content of the React element
    expect(jsxResult).toEqual(
      React.createElement(
        'div',
        { xmlns: 'http://www.w3.org/1999/xhtml' } as any,
        'Flyover from XHTML'
      )
    );
  });

  it('returns childItem.text if no XHTML string', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'group',
      item: [
        {
          linkId: 'q1-child-flyover',
          type: 'display',
          text: 'flyover plain text',
          extension: [
            {
              url: ITEM_CONTROL_URL,
              valueCodeableConcept: {
                coding: [
                  {
                    system: 'http://hl7.org/fhir/questionnaire-item-control',
                    code: 'flyover'
                  }
                ]
              }
            }
          ]
        }
      ]
    };

    expect(getTextDisplayFlyover(qItem)).toBe('flyover plain text');
  });

  it('returns empty string if there is no child item', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'group'
    };
    expect(getTextDisplayFlyover(qItem)).toBe('');
  });

  it('handles item.text missing gracefully', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'group',
      item: [
        {
          linkId: 'q1-child-flyover',
          type: 'display',
          extension: [
            {
              url: ITEM_CONTROL_URL,
              valueCodeableConcept: {
                coding: [
                  {
                    system: 'http://hl7.org/fhir/questionnaire-item-control',
                    code: 'flyover'
                  }
                ]
              }
            }
          ]
        }
      ]
    };
    expect(getTextDisplayFlyover(qItem)).toBe('');
  });

  it('returns empty string if display child type is not "display"', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'group',
      item: [
        {
          linkId: 'q1-child-instructions',
          type: 'group',
          text: 'flyover plain text',
          extension: [
            {
              url: ITEM_CONTROL_URL,
              valueCodeableConcept: {
                coding: [
                  {
                    system: 'http://hl7.org/fhir/questionnaire-item-control',
                    code: 'flyover'
                  }
                ]
              }
            }
          ]
        }
      ]
    };
    expect(getTextDisplayFlyover(qItem)).toBe('');
  });
});

describe('getRegexString', () => {
  it('returns the regex string when extension.valueString is a plain regex', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'string',
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/regex',
          valueString: '^\\d{3}-\\d{2}-\\d{4}$'
        }
      ]
    };
    expect(getRegexString(qItem)).toBe('^\\d{3}-\\d{2}-\\d{4}$');
  });

  it("extracts the regex from matches('...') valueString", () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'string',
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/regex',
          valueString: "matches('^[a-zA-Z]+$')"
        }
      ]
    };
    expect(getRegexString(qItem)).toBe('^[a-zA-Z]+$');
  });

  it('returns null if there is no regex extension', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'string',
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/notregex',
          valueString: '^\\d{3}-\\d{2}-\\d{4}$'
        }
      ]
    };
    expect(getRegexString(qItem)).toBeNull();
  });

  it('returns null if extension array is missing', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'string'
    };
    expect(getRegexString(qItem)).toBeNull();
  });
});

describe('getRegexValidation', () => {
  it('returns a RegexValidation if getRegexString returns a regex string', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'string',
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/regex',
          valueString: "matches('^[a-zA-Z]+$')"
        }
      ]
    };
    const result = getRegexValidation(qItem);
    expect(result).toEqual({ expression: new RegExp('^[a-zA-Z]+$'), feedback: null });
  });

  it('returns hardcoded RegexValidation for url type when no regex extension present', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'url'
    };
    const result = getRegexValidation(qItem);
    expect(result).toEqual({
      expression: new RegExp(/^\S*$/),
      feedback: 'URLs should not contain any whitespaces'
    });
  });
});

describe('getMinValue', () => {
  it('returns integer minValue when type is integer', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'integer',
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/minValue',
          valueInteger: 5
        }
      ]
    };
    expect(getMinValue(qItem)).toBe(5);
  });

  it('returns decimal minValue when type is decimal and valueDecimal is present', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q2',
      type: 'decimal',
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/minValue',
          valueDecimal: 3.14
        }
      ]
    };
    expect(getMinValue(qItem)).toBe(3.14);
  });

  it('returns integer minValue when type is decimal and valueDecimal is absent', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q3',
      type: 'decimal',
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/minValue',
          valueInteger: 7
        }
      ]
    };
    expect(getMinValue(qItem)).toBe(7);
  });

  it('returns date minValue when type is date', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q4',
      type: 'date',
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/minValue',
          valueDate: '2021-05-05'
        }
      ]
    };
    expect(getMinValue(qItem)).toBe('2021-05-05');
  });

  it('returns dateTime minValue when type is dateTime and valueDateTime is present', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q5',
      type: 'dateTime',
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/minValue',
          valueDateTime: '2021-05-05T10:00:00Z'
        }
      ]
    };
    expect(getMinValue(qItem)).toBe('2021-05-05T10:00:00Z');
  });

  it('returns date minValue when type is dateTime and valueDateTime is absent', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q6',
      type: 'dateTime',
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/minValue',
          valueDate: '2021-05-05'
        }
      ]
    };
    expect(getMinValue(qItem)).toBe('2021-05-05');
  });

  it('returns undefined for unsupported type', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q7',
      type: 'string'
    };
    expect(getMinValue(qItem)).toBeUndefined();
  });
});

describe('getMinValueFeedback', () => {
  it('returns the minValue feedback string when extension is present', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'integer',
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/minValue',
          valueInteger: 5
        },
        {
          url: 'https://smartforms.csiro.au/docs/custom-extension/minValue-feedback',
          valueString: 'Minimum value must be 5'
        }
      ]
    };
    expect(getMinValueFeedback(qItem)).toBe('Minimum value must be 5');
  });

  it('returns null when extension with minValue-feedback url is not present', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'integer',
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/minValue',
          valueInteger: 5
        }
      ]
    };
    expect(getMinValueFeedback(qItem)).toBeNull();
  });

  it('returns null when extension array is missing', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'integer'
    };
    expect(getMinValueFeedback(qItem)).toBeNull();
  });
});

describe('getMaxValue', () => {
  it('returns integer maxValue when type is integer', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'integer',
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/maxValue',
          valueInteger: 10
        }
      ]
    };
    expect(getMaxValue(qItem)).toBe(10);
  });

  it('returns decimal maxValue when type is decimal and valueDecimal is present', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q2',
      type: 'decimal',
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/maxValue',
          valueDecimal: 9.99
        }
      ]
    };
    expect(getMaxValue(qItem)).toBe(9.99);
  });

  it('returns integer maxValue when type is decimal and valueDecimal is absent', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q3',
      type: 'decimal',
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/maxValue',
          valueInteger: 8
        }
      ]
    };
    expect(getMaxValue(qItem)).toBe(8);
  });

  it('returns date maxValue when type is date', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q4',
      type: 'date',
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/maxValue',
          valueDate: '2022-12-31'
        }
      ]
    };
    expect(getMaxValue(qItem)).toBe('2022-12-31');
  });

  it('returns dateTime maxValue when type is dateTime and valueDateTime is present', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q5',
      type: 'dateTime',
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/maxValue',
          valueDateTime: '2022-12-31T23:59:59Z'
        }
      ]
    };
    expect(getMaxValue(qItem)).toBe('2022-12-31T23:59:59Z');
  });

  it('returns date maxValue when type is dateTime and valueDateTime is absent', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q6',
      type: 'dateTime',
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/maxValue',
          valueDate: '2022-12-31'
        }
      ]
    };
    expect(getMaxValue(qItem)).toBe('2022-12-31');
  });

  it('returns undefined for unsupported type', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q7',
      type: 'string'
    };
    expect(getMaxValue(qItem)).toBeUndefined();
  });
});

describe('getMaxValueFeedback', () => {
  it('returns the maxValue feedback string when extension is present', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'integer',
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/maxValue',
          valueInteger: 10
        },
        {
          url: 'https://smartforms.csiro.au/docs/custom-extension/maxValue-feedback',
          valueString: 'Maximum value must be 10'
        }
      ]
    };
    expect(getMaxValueFeedback(qItem)).toBe('Maximum value must be 10');
  });

  it('returns null when extension with maxValue-feedback url is not present', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'integer',
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/maxValue',
          valueInteger: 10
        }
      ]
    };
    expect(getMaxValueFeedback(qItem)).toBeNull();
  });

  it('returns null when extension array is missing', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'integer'
    };
    expect(getMaxValueFeedback(qItem)).toBeNull();
  });
});

describe('getRequiredFeedback', () => {
  it('returns the required feedback string when extension is present', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'string',
      extension: [
        {
          url: 'https://smartforms.csiro.au/docs/custom-extension/required-feedback',
          valueString: 'This field is required'
        }
      ]
    };
    expect(getRequiredFeedback(qItem)).toBe('This field is required');
  });

  it('returns null when extension with required-feedback url is not present', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q2',
      type: 'string',
      extension: [
        {
          url: 'http://example.org/some-other-extension',
          valueString: 'Some other value'
        }
      ]
    };
    expect(getRequiredFeedback(qItem)).toBeNull();
  });

  it('returns null when extension array is missing', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q3',
      type: 'string'
    };
    expect(getRequiredFeedback(qItem)).toBeNull();
  });
});

describe('getMinQuantityValue', () => {
  it('returns the numeric value when extension with minQuantity and valid value exists', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'quantity',
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-minQuantity',
          valueQuantity: {
            value: 42,
            unit: 'kg',
            system: 'http://unitsofmeasure.org',
            code: 'kg'
          }
        }
      ]
    };
    expect(getMinQuantityValue(qItem)).toBe(42);
  });

  it('returns undefined when extension is present but valueQuantity is missing', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'quantity',
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-minQuantity'
        }
      ]
    };
    expect(getMinQuantityValue(qItem)).toBeUndefined();
  });

  it('returns undefined when extension is present but valueQuantity.value is missing', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'quantity',
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-minQuantity',
          valueQuantity: {
            unit: 'kg',
            system: 'http://unitsofmeasure.org',
            code: 'kg'
          }
        }
      ]
    };
    expect(getMinQuantityValue(qItem)).toBeUndefined();
  });

  it('returns undefined when extension array is missing', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'quantity'
    };
    expect(getMinQuantityValue(qItem)).toBeUndefined();
  });
});

describe('getMinQuantityValueFeedback', () => {
  it('returns the minQuantityValue feedback string when extension is present', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'quantity',
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-minQuantity',
          valueQuantity: {
            value: 42,
            unit: 'kg',
            system: 'http://unitsofmeasure.org',
            code: 'kg'
          }
        },
        {
          url: 'https://smartforms.csiro.au/docs/custom-extension/minQuantityValue-feedback',
          valueString: 'Minimum quantity must be 42 kg'
        }
      ]
    };
    expect(getMinQuantityValueFeedback(qItem)).toBe('Minimum quantity must be 42 kg');
  });

  it('returns null when extension with minQuantityValue-feedback url is not present', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'quantity',
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-minQuantity',
          valueQuantity: {
            value: 42,
            unit: 'kg',
            system: 'http://unitsofmeasure.org',
            code: 'kg'
          }
        }
      ]
    };
    expect(getMinQuantityValueFeedback(qItem)).toBeNull();
  });

  it('returns null when extension array is missing', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'quantity'
    };
    expect(getMinQuantityValueFeedback(qItem)).toBeNull();
  });
});

describe('getMaxQuantityValue', () => {
  it('returns the numeric value when extension with maxQuantity and valid value exists', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'quantity',
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-maxQuantity',
          valueQuantity: {
            value: 100,
            unit: 'kg',
            system: 'http://unitsofmeasure.org',
            code: 'kg'
          }
        }
      ]
    };
    expect(getMaxQuantityValue(qItem)).toBe(100);
  });

  it('returns undefined when extension is present but valueQuantity is missing', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'quantity',
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-maxQuantity'
        }
      ]
    };
    expect(getMaxQuantityValue(qItem)).toBeUndefined();
  });

  it('returns undefined when extension is present but valueQuantity.value is missing', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'quantity',
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-maxQuantity',
          valueQuantity: {
            unit: 'kg',
            system: 'http://unitsofmeasure.org',
            code: 'kg'
          }
        } as Extension
      ]
    };
    expect(getMaxQuantityValue(qItem)).toBeUndefined();
  });

  it('returns undefined when extension array is missing', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'quantity'
    };
    expect(getMaxQuantityValue(qItem)).toBeUndefined();
  });
});

describe('getMaxQuantityValueFeedback', () => {
  it('returns the maxQuantityValue feedback string when extension is present', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'quantity',
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-maxQuantity',
          valueQuantity: {
            value: 100,
            unit: 'kg',
            system: 'http://unitsofmeasure.org',
            code: 'kg'
          }
        },
        {
          url: 'https://smartforms.csiro.au/docs/custom-extension/maxQuantityValue-feedback',
          valueString: 'Maximum quantity must be 100 kg'
        }
      ]
    };
    expect(getMaxQuantityValueFeedback(qItem)).toBe('Maximum quantity must be 100 kg');
  });

  it('returns null when extension with maxQuantityValue-feedback url is not present', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'quantity',
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-maxQuantity',
          valueQuantity: {
            value: 100,
            unit: 'kg',
            system: 'http://unitsofmeasure.org',
            code: 'kg'
          }
        }
      ]
    };
    expect(getMaxQuantityValueFeedback(qItem)).toBeNull();
  });

  it('returns null when extension array is missing', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'quantity'
    };
    expect(getMaxQuantityValueFeedback(qItem)).toBeNull();
  });
});

describe('isItemTextHidden', () => {
  it('should return true when extension exists with valueBoolean true', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'group',
      _text: {
        extension: [
          {
            url: 'https://smartforms.csiro.au/ig/StructureDefinition/QuestionnaireItemTextHidden',
            valueBoolean: true
          }
        ]
      }
    };

    expect(isItemTextHidden(qItem)).toBe(true);
  });

  it('should return false when extension exists with valueBoolean false', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'group',
      _text: {
        extension: [
          {
            url: 'https://smartforms.csiro.au/ig/StructureDefinition/QuestionnaireItemTextHidden',
            valueBoolean: false
          }
        ]
      }
    };

    expect(isItemTextHidden(qItem)).toBe(false);
  });

  it('should return false when extension with different URL exists', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'group',
      _text: {
        extension: [
          {
            url: 'http://example.org/some-other-extension',
            valueBoolean: true
          }
        ]
      }
    };

    expect(isItemTextHidden(qItem)).toBe(false);
  });

  it('returns null when extension array is missing', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'group'
    };
    expect(isItemTextHidden(qItem)).toBe(false);
  });
});
