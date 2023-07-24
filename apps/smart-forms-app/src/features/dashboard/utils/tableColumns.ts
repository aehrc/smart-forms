/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
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
import type { QuestionnaireListItem, ResponseListItem } from '../types/list.interface.ts';

export function createQuestionnaireTableColumns(): ColumnDef<QuestionnaireListItem>[] {
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
      header: 'Date'
    },
    {
      accessorKey: 'status',
      header: 'Status'
    }
  ];
}

export function createResponseTableColumns(): ColumnDef<ResponseListItem>[] {
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
      header: 'Authored On'
    },
    {
      accessorKey: 'status',
      header: 'Status'
    }
  ];
}
