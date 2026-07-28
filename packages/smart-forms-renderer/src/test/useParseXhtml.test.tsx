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

import {
  convertKebabToCamelCase,
  getStylesFromClass,
  getTextDisplayFlyover
} from '../hooks/useParseXhtml';
import type { QuestionnaireItem } from 'fhir/r4';
import React from 'react';

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

  it('returns empty string if there is no flyover childItem', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'group'
    };

    expect(getTextDisplayFlyover(qItem)).toBe('');
  });
});

describe('convertKebabToCamelCase', () => {
  it('should convert kebab-case to camelCase', () => {
    expect(convertKebabToCamelCase('background-color')).toBe('backgroundColor');
    expect(convertKebabToCamelCase(' font-size ')).toBe('fontSize');
    expect(convertKebabToCamelCase('margin-top')).toBe('marginTop');
  });
});
describe('getStylesFromClass', () => {
  beforeEach(() => {
    // Remove any previously injected styles
    document.head.innerHTML = '';

    // Inject a real <style> element into the document
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      .test-class { color: red; font-size: 14px; }
      .other-class { margin: 10px; }
    `;
    document.head.appendChild(styleEl);
  });

  it('returns null for empty or null class name', () => {
    expect(getStylesFromClass('')).toBeNull();
    expect(getStylesFromClass(null as any)).toBeNull();
  });

  it('extracts styles from the injected stylesheet', () => {
    const styles = getStylesFromClass('test-class');
    expect(styles).toEqual({ color: 'red', fontSize: '14px' });
  });

  it('returns null if class not found', () => {
    const styles = getStylesFromClass('non-existent-class');
    expect(styles).toBeNull();
  });
});
