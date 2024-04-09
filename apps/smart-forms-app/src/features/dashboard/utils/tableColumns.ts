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

import type { ColumnDef } from '@tanstack/react-table';
import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';

export function createQuestionnaireTableColumns(): ColumnDef<Questionnaire>[] {
  return [
    {
      accessorKey: 'title',
      header: 'Title'
    },
    {
      accessorKey: 'publisher',
      header: 'Publisher'
    },
    {
      accessorKey: 'date',
      header: 'Date',
      sortingFn: (a, b) => sortDate(a.original.date, b.original.date)
    },
    {
      accessorKey: 'status',
      header: 'Status'
    }
  ];
}

export function createResponseTableColumns(): ColumnDef<QuestionnaireResponse>[] {
  return [
    {
      accessorKey: 'title',
      header: 'Questionnaire Title'
    },
    {
      accessorKey: 'author',
      header: 'Author'
    },
    {
      accessorKey: 'authored',
      header: 'Authored On',
      sortingFn: (a, b) => sortDate(a.original.authored, b.original.authored)
    },
    {
      accessorKey: 'status',
      header: 'Status'
    }
  ];
}

function sortDate(dateStringA: string | undefined, dateStringB: string | undefined): number {
  if (dateStringA === undefined && dateStringB === undefined) {
    return 0;
  }

  if (dateStringA === undefined) {
    return 1;
  }

  if (dateStringB === undefined) {
    return -1;
  }

  return dateStringA.localeCompare(dateStringB);
}
