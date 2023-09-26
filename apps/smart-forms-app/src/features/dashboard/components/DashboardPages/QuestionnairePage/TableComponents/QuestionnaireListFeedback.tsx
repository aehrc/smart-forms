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

import { Stack, TableBody, TableCell, TableRow } from '@mui/material';
import QuestionnaireFeedbackMessage from './QuestionnaireFeedbackMessage.tsx';
import { useSnackbar } from 'notistack';

interface Props {
  isEmpty: boolean;
  isInitialLoading: boolean;
  status: 'loading' | 'error' | 'success';
  searchInput: string;
  error?: unknown;
}
function QuestionnaireListFeedback(props: Props) {
  const { isEmpty, isInitialLoading, status, searchInput, error } = props;

  const { enqueueSnackbar } = useSnackbar();

  let feedbackType: 'error' | 'empty' | 'loading' | null = null;
  if (status === 'error') {
    feedbackType = 'error';
  } else if (isInitialLoading) {
    feedbackType = 'loading';
  } else if (isEmpty) {
    feedbackType = 'empty';
  }

  if (feedbackType === 'error') {
    console.error(error);
    enqueueSnackbar('An error occurred while fetching questionnaires', {
      variant: 'error',
      preventDuplicate: true
    });
  }

  return feedbackType ? (
    <TableBody>
      <TableRow>
        <TableCell align="center" colSpan={6}>
          <Stack rowGap={3} my={5}>
            <QuestionnaireFeedbackMessage feedbackType={feedbackType} searchInput={searchInput} />
          </Stack>
        </TableCell>
      </TableRow>
    </TableBody>
  ) : null;
}

export default QuestionnaireListFeedback;
