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

import { useSnackbar } from 'notistack';
import { Stack, TableBody, TableCell, TableRow } from '@mui/material';
import ResponseFeedbackMessage from '../../../dashboard/components/DashboardPages/ResponsesPage/TableComponents/ResponseFeedbackMessage.tsx';

interface ExistingResponsesListFeedbackProps {
  isEmpty: boolean;
  isFetching: boolean;
  fetchError?: unknown;
}

function ExistingResponsesTableFeedback(props: ExistingResponsesListFeedbackProps) {
  const { isEmpty, isFetching, fetchError } = props;

  const { enqueueSnackbar } = useSnackbar();

  let feedbackType: 'error' | 'empty' | 'loading' | null = null;
  if (fetchError) {
    feedbackType = 'error';
  } else if (isFetching) {
    feedbackType = 'loading';
  } else if (isEmpty) {
    feedbackType = 'empty';
  }

  if (feedbackType === 'error') {
    console.error(fetchError);
    enqueueSnackbar('An error occurred while fetching responses', {
      variant: 'error',
      preventDuplicate: true
    });
  }

  return feedbackType ? (
    <TableBody>
      <TableRow>
        <TableCell align="center" colSpan={6}>
          <Stack rowGap={3} my={5}>
            <ResponseFeedbackMessage feedbackType={feedbackType} searchedQuestionnaire={null} />
          </Stack>
        </TableCell>
      </TableRow>
    </TableBody>
  ) : null;
}

export default ExistingResponsesTableFeedback;
