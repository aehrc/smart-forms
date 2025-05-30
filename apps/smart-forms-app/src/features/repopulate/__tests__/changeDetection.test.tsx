/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
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

import { describe, it, expect } from 'vitest';
import { detectChanges, groupChangesByRow, generatePreferenceKey } from '../utils/changeDetection';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';

describe('changeDetection utils', () => {
  describe('detectChanges', () => {
    it('should detect simple field changes', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-field',
        type: 'string',
        text: 'Test Field'
      };

      const serverQRItem: QuestionnaireResponseItem = {
        linkId: 'test-field',
        answer: [{ valueString: 'server value' }]
      };

      const userQRItem: QuestionnaireResponseItem = {
        linkId: 'test-field',
        answer: [{ valueString: 'user value' }]
      };

      const changes = detectChanges({
        qItem,
        serverSuggestedQRItem: serverQRItem,
        currentUserFormQRItem: userQRItem
      });

      expect(changes).toHaveLength(1);
      expect(changes[0]).toEqual({
        fieldLabelQItem: qItem,
        qSubItem: qItem,
        serverValue: 'server value',
        userFormValue: 'user value',
        rowIndex: undefined,
        rowLabelForRow: undefined
      });
    });

    it('should detect no changes when values are the same', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-field',
        type: 'string',
        text: 'Test Field'
      };

      const qrItem: QuestionnaireResponseItem = {
        linkId: 'test-field',
        answer: [{ valueString: 'same value' }]
      };

      const changes = detectChanges({
        qItem,
        serverSuggestedQRItem: qrItem,
        currentUserFormQRItem: qrItem
      });

      expect(changes).toHaveLength(0);
    });

    it('should detect changes in repeating items', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'medical-history',
        type: 'group',
        repeats: true,
        text: 'Medical History',
        item: [
          {
            linkId: 'condition',
            type: 'string',
            text: 'Condition'
          },
          {
            linkId: 'date',
            type: 'date',
            text: 'Date'
          }
        ]
      };

      const serverQRItems: QuestionnaireResponseItem[] = [
        {
          linkId: 'medical-history',
          item: [
            { linkId: 'condition', answer: [{ valueString: 'Diabetes' }] },
            { linkId: 'date', answer: [{ valueDate: '2023-01-01' }] }
          ]
        }
      ];

      const userQRItems: QuestionnaireResponseItem[] = [
        {
          linkId: 'medical-history',
          item: [
            { linkId: 'condition', answer: [{ valueString: 'Diabetes' }] },
            { linkId: 'date', answer: [{ valueDate: '2023-02-01' }] }
          ]
        }
      ];

      const changes = detectChanges({
        qItem,
        serverSuggestedQRItems: serverQRItems,
        currentUserFormQRItems: userQRItems
      });

      expect(changes).toHaveLength(1);
      expect(changes[0].qSubItem.linkId).toBe('date');
      expect(changes[0].serverValue).toBe('2023-01-01');
      expect(changes[0].userFormValue).toBe('2023-02-01');
      expect(changes[0].rowIndex).toBe(0);
      expect(changes[0].rowLabelForRow).toBe('Condition: Diabetes');
    });
  });

  describe('groupChangesByRow', () => {
    it('should group changes by row index', () => {
      const changes = [
        {
          fieldLabelQItem: { linkId: 'field1', type: 'string' } as QuestionnaireItem,
          qSubItem: { linkId: 'field1', type: 'string' } as QuestionnaireItem,
          serverValue: 'server1',
          userFormValue: 'user1',
          rowIndex: 0,
          rowLabelForRow: 'Row 1'
        },
        {
          fieldLabelQItem: { linkId: 'field2', type: 'string' } as QuestionnaireItem,
          qSubItem: { linkId: 'field2', type: 'string' } as QuestionnaireItem,
          serverValue: 'server2',
          userFormValue: 'user2',
          rowIndex: 0,
          rowLabelForRow: 'Row 1'
        },
        {
          fieldLabelQItem: { linkId: 'field3', type: 'string' } as QuestionnaireItem,
          qSubItem: { linkId: 'field3', type: 'string' } as QuestionnaireItem,
          serverValue: 'server3',
          userFormValue: 'user3',
          rowIndex: 1,
          rowLabelForRow: 'Row 2'
        }
      ];

      const grouped = groupChangesByRow(changes);

      expect(grouped).toHaveLength(2);
      expect(grouped[0].rowIndex).toBe(0);
      expect(grouped[0].itemsInRow).toHaveLength(2);
      expect(grouped[1].rowIndex).toBe(1);
      expect(grouped[1].itemsInRow).toHaveLength(1);
    });
  });

  describe('generatePreferenceKey', () => {
    it('should generate preference key for simple field', () => {
      const change = {
        fieldLabelQItem: { linkId: 'field1', type: 'string' } as QuestionnaireItem,
        qSubItem: { linkId: 'field1', type: 'string' } as QuestionnaireItem,
        serverValue: 'server',
        userFormValue: 'user'
      };

      const result = generatePreferenceKey('parent', change);

      expect(result.preferenceKeyBase).toBe('parent');
      expect(result.preferenceKeySuffix).toBe('field1');
      expect(result.fullKey).toBe('parent:field1');
    });

    it('should generate preference key for repeating field', () => {
      const change = {
        fieldLabelQItem: { linkId: 'field1', type: 'string' } as QuestionnaireItem,
        qSubItem: { linkId: 'field1', type: 'string' } as QuestionnaireItem,
        serverValue: 'server',
        userFormValue: 'user',
        rowIndex: 2
      };

      const result = generatePreferenceKey('parent', change);

      expect(result.preferenceKeyBase).toBe('parent-row2');
      expect(result.preferenceKeySuffix).toBe('field1');
      expect(result.fullKey).toBe('parent-row2:field1');
    });

    it('should generate preference key for complex field', () => {
      const change = {
        fieldLabelQItem: { linkId: 'weight', type: 'group' } as QuestionnaireItem,
        qSubItem: { linkId: 'value', type: 'decimal' } as QuestionnaireItem,
        serverValue: '70',
        userFormValue: '75'
      };

      const result = generatePreferenceKey('parent', change);

      expect(result.preferenceKeyBase).toBe('parent');
      expect(result.preferenceKeySuffix).toBe('weight:value');
      expect(result.fullKey).toBe('parent:weight:value');
    });
  });
}); 