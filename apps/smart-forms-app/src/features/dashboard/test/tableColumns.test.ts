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

import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import type { Row } from '@tanstack/react-table';
import {
  createQuestionnaireTableColumns,
  createResponseTableColumns,
  sortDate
} from '../utils/tableColumns';

describe('tableColumns', () => {
  describe('createQuestionnaireTableColumns', () => {
    it('should return correct column definitions for questionnaires', () => {
      const columns = createQuestionnaireTableColumns();

      expect(columns).toHaveLength(4);

      expect(columns[0]).toEqual({
        accessorKey: 'title',
        header: 'Title'
      });

      expect(columns[1]).toEqual({
        accessorKey: 'publisher',
        header: 'Publisher'
      });

      expect(columns[2]).toMatchObject({
        accessorKey: 'date',
        header: 'Date'
      });
      expect(columns[2].sortingFn).toBeDefined();

      expect(columns[3]).toEqual({
        accessorKey: 'status',
        header: 'Status'
      });
    });

    it('should have working date sorting function for questionnaire columns', () => {
      const columns = createQuestionnaireTableColumns();
      const dateColumn = columns[2];

      // Mock Row objects for testing sorting
      const mockRowA = {
        original: { date: '2024-01-01' } as Questionnaire
      } as Row<Questionnaire>;

      const mockRowB = {
        original: { date: '2024-06-01' } as Questionnaire
      } as Row<Questionnaire>;

      // Test that sortingFn works correctly
      expect(dateColumn.sortingFn).toBeDefined();
      if (typeof dateColumn.sortingFn === 'function') {
        const result = dateColumn.sortingFn(mockRowA, mockRowB, '');
        expect(result).toBeLessThan(0); // 2024-01-01 should come before 2024-06-01
      }
    });
  });

  describe('createResponseTableColumns', () => {
    it('should return correct column definitions for responses', () => {
      const columns = createResponseTableColumns();

      expect(columns).toHaveLength(4);

      expect(columns[0]).toEqual({
        accessorKey: 'title',
        header: 'Questionnaire Title'
      });

      expect(columns[1]).toEqual({
        accessorKey: 'author',
        header: 'Author'
      });

      expect(columns[2]).toMatchObject({
        accessorKey: 'authored',
        header: 'Authored On'
      });
      expect(columns[2].sortingFn).toBeDefined();

      expect(columns[3]).toEqual({
        accessorKey: 'status',
        header: 'Status'
      });
    });

    it('should have working authored date sorting function for response columns', () => {
      const columns = createResponseTableColumns();
      const authoredColumn = columns[2];

      // Mock Row objects for testing sorting
      const mockRowA = {
        original: { authored: '2024-01-01T10:00:00Z' } as QuestionnaireResponse
      } as Row<QuestionnaireResponse>;

      const mockRowB = {
        original: { authored: '2024-06-01T10:00:00Z' } as QuestionnaireResponse
      } as Row<QuestionnaireResponse>;

      // Test that sortingFn works correctly
      expect(authoredColumn.sortingFn).toBeDefined();
      if (typeof authoredColumn.sortingFn === 'function') {
        const result = authoredColumn.sortingFn(mockRowA, mockRowB, '');
        expect(result).toBeLessThan(0); // Earlier date should come first
      }
    });
  });

  describe('sortDate', () => {
    it('should return 0 when both dates are undefined', () => {
      const result = sortDate(undefined, undefined);
      expect(result).toBe(0);
    });

    it('should return 1 when first date is undefined', () => {
      const result = sortDate(undefined, '2024-01-01');
      expect(result).toBe(1);
    });

    it('should return -1 when second date is undefined', () => {
      const result = sortDate('2024-01-01', undefined);
      expect(result).toBe(-1);
    });

    it('should sort dates chronologically using string comparison', () => {
      const earlier = '2024-01-01';
      const later = '2024-06-01';

      const result1 = sortDate(earlier, later);
      expect(result1).toBeLessThan(0); // earlier should come before later

      const result2 = sortDate(later, earlier);
      expect(result2).toBeGreaterThan(0); // later should come after earlier
    });

    it('should return 0 for identical dates', () => {
      const date = '2024-01-01T10:00:00Z';
      const result = sortDate(date, date);
      expect(result).toBe(0);
    });

    it('should handle ISO datetime strings correctly', () => {
      const earlier = '2024-01-01T10:00:00Z';
      const later = '2024-01-01T11:00:00Z';

      const result = sortDate(earlier, later);
      expect(result).toBeLessThan(0);
    });

    it('should handle date strings with different formats consistently', () => {
      const date1 = '2024-01-01';
      const date2 = '2024-01-02';
      const date3 = '2024-02-01';

      expect(sortDate(date1, date2)).toBeLessThan(0);
      expect(sortDate(date2, date3)).toBeLessThan(0);
      expect(sortDate(date1, date3)).toBeLessThan(0);
    });

    it('should handle year transitions correctly', () => {
      const date2023 = '2023-12-31';
      const date2024 = '2024-01-01';

      const result = sortDate(date2023, date2024);
      expect(result).toBeLessThan(0);
    });

    it('should handle month transitions correctly', () => {
      const jan = '2024-01-31';
      const feb = '2024-02-01';

      const result = sortDate(jan, feb);
      expect(result).toBeLessThan(0);
    });

    it('should handle empty strings as valid dates', () => {
      const emptyString = '';
      const validDate = '2024-01-01';

      const result1 = sortDate(emptyString, validDate);
      expect(result1).toBeLessThan(0); // Empty string should sort before valid date

      const result2 = sortDate(validDate, emptyString);
      expect(result2).toBeGreaterThan(0); // Valid date should sort after empty string
    });
  });
});
