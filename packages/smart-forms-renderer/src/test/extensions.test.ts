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

import type { QuestionnaireItem } from 'fhir/r4';
import { isGroupAddItemButtonHidden } from '../utils/extensions';

describe('isGroupAddItemButtonHidden', () => {
  it('should return false when extension is not present', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'test-group',
      type: 'group',
      repeats: true,
      text: 'Test Group'
    };

    expect(isGroupAddItemButtonHidden(qItem)).toBe(false);
  });

  it('should return false when extension is present but different URL', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'test-group',
      type: 'group',
      repeats: true,
      text: 'Test Group',
      extension: [
        {
          url: 'http://other-extension-url',
          valueBoolean: true
        }
      ]
    };

    expect(isGroupAddItemButtonHidden(qItem)).toBe(false);
  });

  it('should return true when GroupHideAddItemButton extension is present and true', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'test-group',
      type: 'group',
      repeats: true,
      text: 'Test Group',
      extension: [
        {
          url: 'https://smartforms.csiro.au/ig/StructureDefinition/GroupHideAddItemButton',
          valueBoolean: true
        }
      ]
    };

    expect(isGroupAddItemButtonHidden(qItem)).toBe(true);
  });

  it('should return false when GroupHideAddItemButton extension is present but false', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'test-group',
      type: 'group',
      repeats: true,
      text: 'Test Group',
      extension: [
        {
          url: 'https://smartforms.csiro.au/ig/StructureDefinition/GroupHideAddItemButton',
          valueBoolean: false
        }
      ]
    };

    expect(isGroupAddItemButtonHidden(qItem)).toBe(false);
  });

  it('should return false when GroupHideAddItemButton extension is present but valueBoolean is undefined', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'test-group',
      type: 'group',
      repeats: true,
      text: 'Test Group',
      extension: [
        {
          url: 'https://smartforms.csiro.au/ig/StructureDefinition/GroupHideAddItemButton'
        }
      ]
    };

    expect(isGroupAddItemButtonHidden(qItem)).toBe(false);
  });

  it('should handle multiple extensions and find the correct one', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'test-group',
      type: 'group',
      repeats: true,
      text: 'Test Group',
      extension: [
        {
          url: 'http://other-extension-url',
          valueString: 'some value'
        },
        {
          url: 'https://smartforms.csiro.au/ig/StructureDefinition/GroupHideAddItemButton',
          valueBoolean: true
        },
        {
          url: 'http://another-extension-url',
          valueInteger: 42
        }
      ]
    };

    expect(isGroupAddItemButtonHidden(qItem)).toBe(true);
  });
});
