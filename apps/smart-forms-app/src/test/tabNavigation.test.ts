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

import { findFirstErrorTabIndex } from '../features/renderer/utils/tabNavigation';
import type { QuestionnaireItem } from 'fhir/r4';
import type { Tabs } from '@aehrc/smart-forms-renderer';

// Structure: tab-container (non-tab group) → tab-a, tab-b, tab-c (tabs)
// tab-a contains: field-1, group-nested (which contains field-nested)
// tab-b contains: field-2
// tab-c contains: field-3
const questionnaireItems: QuestionnaireItem[] = [
  {
    linkId: 'tab-container',
    type: 'group',
    item: [
      {
        linkId: 'tab-a',
        type: 'group',
        item: [
          { linkId: 'field-1', type: 'string' },
          {
            linkId: 'group-nested',
            type: 'group',
            item: [{ linkId: 'field-nested', type: 'string' }]
          }
        ]
      },
      {
        linkId: 'tab-b',
        type: 'group',
        item: [{ linkId: 'field-2', type: 'string' }]
      },
      {
        linkId: 'tab-c',
        type: 'group',
        item: [{ linkId: 'field-3', type: 'string' }]
      }
    ]
  }
];

const tabs: Tabs = {
  'tab-a': { tabIndex: 0, isComplete: false, isHidden: false },
  'tab-b': { tabIndex: 1, isComplete: false, isHidden: false },
  'tab-c': { tabIndex: 2, isComplete: false, isHidden: false }
};

const tabsWithHiddenC: Tabs = {
  ...tabs,
  'tab-c': { tabIndex: 2, isComplete: false, isHidden: true }
};

describe('findFirstErrorTabIndex', () => {
  it('should return null when tabs is empty', () => {
    expect(findFirstErrorTabIndex(['field-1'], questionnaireItems, {})).toBeNull();
  });

  it('should return null when invalidLinkIds is empty', () => {
    expect(findFirstErrorTabIndex([], questionnaireItems, tabs)).toBeNull();
  });

  it('should return null when no invalid linkId is found in any tab', () => {
    expect(findFirstErrorTabIndex(['unknown-field'], questionnaireItems, tabs)).toBeNull();
  });

  it('should return null when the linkId matches a non-tab container item', () => {
    expect(findFirstErrorTabIndex(['tab-container'], questionnaireItems, tabs)).toBeNull();
  });

  it('should return the tabIndex when the invalid linkId is the tab item itself', () => {
    expect(findFirstErrorTabIndex(['tab-a'], questionnaireItems, tabs)).toBe(0);
    expect(findFirstErrorTabIndex(['tab-b'], questionnaireItems, tabs)).toBe(1);
  });

  it('should return the tabIndex when the invalid linkId is a direct child of a tab', () => {
    expect(findFirstErrorTabIndex(['field-1'], questionnaireItems, tabs)).toBe(0);
    expect(findFirstErrorTabIndex(['field-2'], questionnaireItems, tabs)).toBe(1);
    expect(findFirstErrorTabIndex(['field-3'], questionnaireItems, tabs)).toBe(2);
  });

  it('should return the tabIndex when the invalid linkId is deeply nested within a tab', () => {
    expect(findFirstErrorTabIndex(['field-nested'], questionnaireItems, tabs)).toBe(0);
  });

  it('should return the lowest tabIndex when invalid items span multiple tabs', () => {
    expect(findFirstErrorTabIndex(['field-2', 'field-1'], questionnaireItems, tabs)).toBe(0);
    expect(findFirstErrorTabIndex(['field-3', 'field-2'], questionnaireItems, tabs)).toBe(1);
  });

  it('should return the tabIndex when multiple invalid items are in the same tab', () => {
    expect(findFirstErrorTabIndex(['field-1', 'field-nested'], questionnaireItems, tabs)).toBe(0);
  });

  // In practice, hidden tabs won't have entries in invalidItems because validateItemRecursive
  // skips hidden items upstream. The isHidden guard here is defensive — it covers the
  // questionnaire-hidden extension case. enableWhen-hidden tabs have tab.isHidden === false
  // but also won't appear in invalidItems for the same reason.
  it('should return null when the matching tab is hidden', () => {
    expect(findFirstErrorTabIndex(['field-3'], questionnaireItems, tabsWithHiddenC)).toBeNull();
  });

  it('should skip hidden tabs and return the next visible tab', () => {
    expect(
      findFirstErrorTabIndex(['field-3', 'field-2'], questionnaireItems, tabsWithHiddenC)
    ).toBe(1);
  });

  it('should return null when all matching tabs are hidden', () => {
    const allHidden: Tabs = {
      'tab-a': { tabIndex: 0, isComplete: false, isHidden: true },
      'tab-b': { tabIndex: 1, isComplete: false, isHidden: true },
      'tab-c': { tabIndex: 2, isComplete: false, isHidden: true }
    };
    expect(
      findFirstErrorTabIndex(['field-1', 'field-2'], questionnaireItems, allHidden)
    ).toBeNull();
  });
});
