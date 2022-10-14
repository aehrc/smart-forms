import { Questionnaire } from 'fhir/r5';
import React from 'react';
import { Box, Divider, List, ListItemButton, ListItemText, Typography } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';

interface Props {
  questionnaires: Questionnaire[];
  searchInput: string;
  selectedIndex: number | null;
  qIsSearching: boolean;
  onSelectedIndexChange: (index: number) => unknown;
}

function QuestionnairePickerQList(props: Props) {
  const { questionnaires, searchInput, selectedIndex, qIsSearching, onSelectedIndexChange } = props;

  if (searchInput === '') {
    return (
      <Box sx={{ p: 2.5 }}>
        <Typography variant="subtitle2">
          Enter a questionnaire title in the search bar above to load results.
        </Typography>
      </Box>
    );
  } else if (qIsSearching) {
    return (
      <Box sx={{ p: 2.5 }}>
        <Box display="flex" flexDirection="row">
          <Typography variant="subtitle2">Loading search results</Typography>
          <CircularProgress size={20} sx={{ ml: 1 }} />
        </Box>
      </Box>
    );
  } else if (questionnaires.length === 0) {
    return (
      <Box sx={{ p: 2.5 }}>
        <Typography variant="subtitle2">
          We did not manage to find anything from the search terms - <b>{searchInput}</b>.
        </Typography>
        <Typography variant="subtitle2">Try searching for something else.</Typography>
      </Box>
    );
  } else {
    return (
      <List sx={{ width: '100%', maxHeight: 515, overflow: 'auto', py: 0 }}>
        {questionnaires.map((questionnaire, i) => (
          <React.Fragment key={questionnaire.id}>
            <ListItemButton
              selected={selectedIndex === i}
              sx={{ p: 1.25 }}
              onClick={() => {
                onSelectedIndexChange(i);
              }}>
              <ListItemText
                primary={`${questionnaire.title}`}
                primaryTypographyProps={{ variant: 'subtitle2' }}
                sx={{ px: 1.5 }}
              />
            </ListItemButton>
            <Divider light />
          </React.Fragment>
        ))}
      </List>
    );
  }
}

export default QuestionnairePickerQList;
