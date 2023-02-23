import React from 'react';
import { Paper, TableBody, TableCell, TableRow, Typography } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

interface Props {
  status: 'loading' | 'error' | 'success';
  searchInput: string;
}
function QuestionnaireListFeedback(props: Props) {
  const { status, searchInput } = props;

  let feedbackType: 'loading' | 'error' | 'empty' = 'empty';
  feedbackType = status !== 'success' ? status : feedbackType;

  return (
    <TableBody>
      <TableRow>
        <TableCell align="center" colSpan={6} sx={{ py: 5 }}>
          <Paper
            sx={{
              textAlign: 'center'
            }}>
            <RenderFeedback feedbackType={feedbackType} searchInput={searchInput} />
          </Paper>
        </TableCell>
      </TableRow>
    </TableBody>
  );
}

interface FeedbackProps {
  feedbackType: 'loading' | 'error' | 'empty';
  searchInput: string;
}

function RenderFeedback(props: FeedbackProps) {
  const { feedbackType, searchInput } = props;

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
