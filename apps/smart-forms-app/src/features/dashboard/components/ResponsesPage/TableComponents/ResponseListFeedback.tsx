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

import { useContext } from 'react';
import {
  Box,
  CircularProgress,
  Paper,
  TableBody,
  TableCell,
  TableRow,
  Typography
} from '@mui/material';
import { SourceContext } from '../../../../debug/contexts/SourceContext.tsx';
import { useSnackbar } from 'notistack';

interface Props {
  isEmpty: boolean;
  status: 'loading' | 'error' | 'success';
  searchInput: string;
  error?: unknown;
}
function ResponseListFeedback(props: Props) {
  const { isEmpty, status, searchInput, error } = props;
  const { source } = useContext(SourceContext);

  let feedbackType: FeedbackProps['feedbackType'] | null = null;
  if (status === 'error') {
    feedbackType = 'error';
  } else if (status === 'loading' && source === 'remote') {
    feedbackType = 'loading';
  } else if (isEmpty) {
    feedbackType = 'empty';
  }

  return feedbackType ? (
    <TableBody>
      <TableRow>
        <TableCell align="center" colSpan={6} sx={{ py: 5 }}>
          <Paper
            sx={{
              textAlign: 'center'
            }}>
            <RenderFeedback feedbackType={feedbackType} searchInput={searchInput} error={error} />
          </Paper>
        </TableCell>
      </TableRow>
    </TableBody>
  ) : null;
}

interface FeedbackProps {
  feedbackType: 'error' | 'empty' | 'loading';
  searchInput: string;
  error?: unknown;
}

function RenderFeedback(props: FeedbackProps) {
  const { feedbackType, searchInput, error } = props;

  const { enqueueSnackbar } = useSnackbar();

  if (feedbackType === 'error') {
    console.error(error);
    enqueueSnackbar('An error occurred while fetching responses', {
      variant: 'error',
      preventDuplicate: true
    });
  }

  switch (feedbackType) {
    case 'loading':
      return (
        <>
          <Typography variant="h6" paragraph>
            Loading responses
          </Typography>

          <Box display="flex" flexDirection="row" justifyContent="center" sx={{ m: 5 }}>
            <CircularProgress size={44} />
          </Box>
        </>
      );
    case 'error':
      return (
        <>
          <Typography variant="h6" paragraph>
            Oops, an error occurred
          </Typography>

          <Typography variant="body2">
            Try again later, or try searching for something else?
          </Typography>
        </>
      );
    case 'empty':
      return (
        <>
          <Typography variant="h6" paragraph>
            No responses found
          </Typography>

          {searchInput === '' ? (
            <Typography variant="body2">
              No results found.
              <br /> It doesn&apos;t seem like you have any responses yet.
            </Typography>
          ) : (
            <Typography variant="body2">
              No results found for &nbsp;
              <strong>&quot;{searchInput}&quot;</strong>.
              <br /> Try searching for something else.
            </Typography>
          )}
        </>
      );
  }
}
export default ResponseListFeedback;
