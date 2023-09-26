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

import { useMemo, useState } from 'react';
import type { SortingState } from '@tanstack/react-table';
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import { useDebounce } from 'usehooks-ts';
import useFetchQuestionnaires from '../../../hooks/useFetchQuestionnaires.ts';
import { createQuestionnaireTableColumns } from '../../../utils/tableColumns.ts';
import QuestionnaireTableView from './QuestionnaireTableView.tsx';
import useSelectedQuestionnaire from '../../../hooks/useSelectedQuestionnaire.ts';

function QuestionnaireTable() {
  const { selectedQuestionnaire, setSelectedQuestionnaire } = useSelectedQuestionnaire();

  // search questionnaires
  const [searchInput, setSearchInput] = useState('');
  const debouncedInput = useDebounce(searchInput, 300);

  const { questionnaires, fetchStatus, fetchError, isInitialLoading, isFetching } =
    useFetchQuestionnaires(searchInput, debouncedInput);

  const columns = useMemo(() => createQuestionnaireTableColumns(), []);

  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data: questionnaires,
    columns: columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting
    }
  });

  function handleRowClick(id: string) {
    const questionnaire = questionnaires.find((questionnaire) => questionnaire.id === id);

    if (questionnaire) {
      if (questionnaire.id === selectedQuestionnaire?.id) {
        setSelectedQuestionnaire(null);
      } else {
        setSelectedQuestionnaire(questionnaire);
      }
    }
  }

  return (
    <QuestionnaireTableView
      table={table}
      searchInput={searchInput}
      debouncedInput={debouncedInput}
      fetchStatus={fetchStatus}
      isInitialLoading={isInitialLoading}
      isFetching={isFetching}
      fetchError={fetchError}
      selectedQuestionnaire={selectedQuestionnaire}
      onSearch={(input) => {
        table.setPageIndex(0);
        setSearchInput(input);
      }}
      onRowClick={handleRowClick}
      onSelectQuestionnaire={setSelectedQuestionnaire}
    />
  );
}

export default QuestionnaireTable;
