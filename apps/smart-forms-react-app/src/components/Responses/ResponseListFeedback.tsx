import React from 'react';
import { Paper, TableBody, TableCell, TableRow, Typography } from '@mui/material';

interface Props {
  status: 'loading' | 'error' | 'success';
  error?: unknown;
}
function ResponseListFeedback(props: Props) {
  const { status, error } = props;

  const feedbackType: FeedbackProps['feedbackType'] = status === 'error' ? 'error' : 'empty';

  return (
    <TableBody>
      <TableRow>
        <TableCell align="center" colSpan={6} sx={{ py: 5 }}>
          <Paper
            sx={{
              textAlign: 'center'
            }}>
            <RenderFeedback feedbackType={feedbackType} error={error} />
          </Paper>
        </TableCell>
      </TableRow>
    </TableBody>
  );
}

interface FeedbackProps {
  feedbackType: 'error' | 'empty';
  error?: unknown;
}

function RenderFeedback(props: FeedbackProps) {
  const { feedbackType, error } = props;

  if (feedbackType === 'error') {
    console.error(error);
  }

  switch (feedbackType) {
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
            No results found.
            <br /> It doesn't seem like you have any responses yet.
          </Typography>
        </>
      );
  }
}
export default ResponseListFeedback;
