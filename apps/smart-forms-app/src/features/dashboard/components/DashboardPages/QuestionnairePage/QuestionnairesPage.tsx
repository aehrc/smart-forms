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

import { useContext, useMemo, useState } from 'react';
import { Card, Container, Fade } from '@mui/material';
import type { Questionnaire } from 'fhir/r4';
import useDebounce from '../../../../renderer/hooks/useDebounce.ts';
import { SelectedQuestionnaireContext } from '../../../contexts/SelectedQuestionnaireContext.tsx';
import { Helmet } from 'react-helmet';
import DashboardHeading from '../DashboardHeading.tsx';
import useFetchQuestionnaires from '../../../hooks/useFetchQuestionnaires.ts';
import { createQuestionnaireTableColumns } from '../../../utils/tableColumns.ts';
import type { SortingState } from '@tanstack/react-table';
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import QuestionnaireTable from './QuestionnaireTable.tsx';

function QuestionnairesPage() {
  const { selectedQuestionnaire, setSelectedQuestionnaire } = useContext(
    SelectedQuestionnaireContext
  );

  // search questionnaires
  const [searchInput, setSearchInput] = useState('');
  const debouncedInput = useDebounce(searchInput, 300);

  const {
    remoteQuestionnaires,
    questionnaireListItems,
    fetchStatus,
    fetchError,
    isInitialLoading,
    isFetching
  } = useFetchQuestionnaires(searchInput, debouncedInput);

  const columns = useMemo(() => createQuestionnaireTableColumns(), []);

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: 'date',
      desc: true
    }
  ]);

  const table = useReactTable({
    data: questionnaireListItems,
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
    const selectedItem = questionnaireListItems.find((item) => item.id === id);

    if (selectedItem) {
      if (selectedItem.id === selectedQuestionnaire?.listItem.id) {
        setSelectedQuestionnaire(null);
      } else {
        const resource = remoteQuestionnaires?.entry?.find(
          (entry) => entry.resource?.id === id
        )?.resource;

        if (resource) {
          setSelectedQuestionnaire({
            listItem: selectedItem,
            resource: resource as Questionnaire
          });
        } else {
          setSelectedQuestionnaire(null);
        }
      }
    }
  }

  return (
    <>
      <Helmet>
        <title>Questionnaires</title>
      </Helmet>
      <Fade in={true}>
        <Container data-test="dashboard-questionnaires-container">
          <DashboardHeading>Questionnaires</DashboardHeading>

          <Card>
            <QuestionnaireTable
              table={table}
              searchInput={searchInput}
              debouncedInput={debouncedInput}
              fetchStatus={fetchStatus}
              isInitialLoading={isInitialLoading}
              isFetching={isFetching}
              fetchError={fetchError}
              onSearch={(input) => {
                table.setPageIndex(0);
                setSearchInput(input);
              }}
              onRowClick={handleRowClick}
            />
          </Card>
        </Container>
      </Fade>
    </>
  );
}

export default QuestionnairesPage;
