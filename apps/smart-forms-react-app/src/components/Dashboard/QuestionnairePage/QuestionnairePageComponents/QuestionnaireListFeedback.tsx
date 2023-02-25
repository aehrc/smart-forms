import React, { useContext } from 'react';
import {
  Box,
  CircularProgress,
  Paper,
  TableBody,
  TableCell,
  TableRow,
  Typography
} from '@mui/material';
import { SourceContext } from '../../../../Router';

interface Props {
  isEmpty: boolean;
  status: 'loading' | 'error' | 'success';
  searchInput: string;
  error?: unknown;
}
function QuestionnaireListFeedback(props: Props) {
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

  if (feedbackType === 'error') {
    console.error(error);
  }

  switch (feedbackType) {
    case 'loading':
      return (
        <>
          <Typography variant="h6" paragraph>
            Loading questionnaires
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
            No questionnaires found
          </Typography>

          <Typography variant="body2">
            No results found for &nbsp;
            <strong>&quot;{searchInput}&quot;</strong>.
            <br /> Try searching for something else.
          </Typography>
        </>
      );
  }
}
export default QuestionnaireListFeedback;
