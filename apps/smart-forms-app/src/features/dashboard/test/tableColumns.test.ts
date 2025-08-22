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
  createQuestionnaireTableColumns,
  createResponseTableColumns,
  sortDate
} from '../utils/tableColumns.ts';
import type { ColumnDef } from '@tanstack/react-table';
import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';

describe('createQuestionnaireTableColumns', () => {
  const columns: ColumnDef<Questionnaire>[] = createQuestionnaireTableColumns();

  it('returns the expected column definitions', () => {
    const accessorKeys = columns
      .filter((col): col is { accessorKey: string } => 'accessorKey' in col)
      .map((col) => col.accessorKey);
    expect(accessorKeys).toEqual(['title', 'publisher', 'date', 'status']);

    const headers = columns.map((col) => col.header);
    expect(headers).toEqual(['Title', 'Publisher', 'Date', 'Status']);
  });

  it('includes a custom sortingFn for the date column', () => {
    const dateColumn = columns.find(
      (col): col is ColumnDef<Questionnaire> & { accessorKey: string } =>
        'accessorKey' in col && col.accessorKey === 'date'
    );

    expect(typeof dateColumn?.sortingFn).toBe('function');
  });
});

describe('createResponseTableColumns', () => {
  const columns = createResponseTableColumns();
  it('returns the expected column definitions', () => {
    const accessorKeys = columns
      .filter((col): col is { accessorKey: string } => 'accessorKey' in col)
      .map((col) => col.accessorKey);
    expect(accessorKeys).toEqual(['title', 'author', 'authored', 'status']);

    const headers = columns.map((col) => col.header);
    expect(headers).toEqual(['Questionnaire Title', 'Author', 'Authored On', 'Status']);
  });

  it('includes a custom sortingFn for the authored column', () => {
    const authoredColumn = columns.find(
      (col): col is ColumnDef<QuestionnaireResponse> & { accessorKey: string } =>
        'accessorKey' in col && col.accessorKey === 'authored'
    );

    expect(typeof authoredColumn?.sortingFn).toBe('function');
  });
});

describe('sortDate', () => {
  it('returns 0 when both dates are undefined', () => {
    expect(sortDate(undefined, undefined)).toBe(0);
  });

  it('returns 1 when first date is undefined and second is defined', () => {
    expect(sortDate(undefined, '2024-01-01')).toBe(1);
  });

  it('returns -1 when first date is defined and second is undefined', () => {
    expect(sortDate('2024-01-01', undefined)).toBe(-1);
  });

  it('correctly compares two defined dates', () => {
    expect(sortDate('2024-01-01', '2023-01-01')).toBeGreaterThan(0);
    expect(sortDate('2023-01-01', '2024-01-01')).toBeLessThan(0);
    expect(sortDate('2024-01-01', '2024-01-01')).toBe(0);
  });
});
