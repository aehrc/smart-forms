import { Questionnaire } from 'fhir/r5';
import React from 'react';
import { Alert, AlertTitle, ListItemButton, ListItemText } from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import { PrimarySelectableList } from '../StyledComponents/Lists.styles';
import PickerSkeletonList from './PickerSkeletonList';

interface Props {
  searchInput: string;
  questionnaires: Questionnaire[];
  selectedQuestionnaireIndex: number | null;
  questionnaireIsSearching: boolean;
  questionnaireSourceIsLocal: boolean;
  onQSelectedIndexChange: (index: number) => unknown;
}

function PickerQuestionnaireCardContent(props: Props) {
  const {
    searchInput,
    questionnaires,
    selectedQuestionnaireIndex,
    questionnaireIsSearching,
    questionnaireSourceIsLocal,
    onQSelectedIndexChange
  } = props;

  if (questionnaireIsSearching) {
    return <PickerSkeletonList />;
  } else if (questionnaires.length === 0) {
    if (searchInput === '') {
      return (
        <Alert severity="info" sx={{ m: 2, p: 2 }}>
          Enter a questionnaire title in the search bar above to load results.
        </Alert>
      );
    } else {
      return (
        <Alert severity="info" sx={{ m: 2, p: 2 }}>
          <AlertTitle>No questionnaires found</AlertTitle>
          <div>
            {`We didn't manage to find anything from the search terms - `}
            <b>{searchInput}</b>.
          </div>
          <div>Try searching for something else.</div>
        </Alert>
      );
    }
  } else {
    return (
      <>
        {searchInput === '' && !questionnaireSourceIsLocal ? (
          <Alert severity="info" sx={{ m: 2, mb: 0, p: 2 }}>
            Looking for something else? Refine your search in the search bar above.
          </Alert>
        ) : null}
        <PrimarySelectableList>
          {questionnaires.map((questionnaire, i) => (
            <ListItemButton
              key={questionnaire.id}
              selected={selectedQuestionnaireIndex === i}
              sx={{ py: 1.25, px: 2.5 }}
              onClick={() => {
                onQSelectedIndexChange(i);
              }}>
              <ArticleIcon sx={{ mr: 2 }} />
              <ListItemText
                primary={`${questionnaire.title}`}
                primaryTypographyProps={{ variant: 'subtitle2' }}
              />
            </ListItemButton>
          ))}
        </PrimarySelectableList>
      </>
    );
  }
}

export default PickerQuestionnaireCardContent;
