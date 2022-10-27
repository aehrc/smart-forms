import { QuestionnaireResponse } from 'fhir/r5';
import React from 'react';
import { Alert, AlertTitle, ListItemButton, ListItemText } from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import { PrimarySelectableList } from '../StyledComponents/Lists.styles';
import PickerSkeletonList from './PickerSkeletonList';
import dayjs from 'dayjs';
import { LaunchContextType } from '../../interfaces/ContextTypes';

interface Props {
  launch: LaunchContextType;
  questionnaireResponses: QuestionnaireResponse[];
  selectedQuestionnaireResponseIndex: number | null;
  questionnaireResponseIsSearching: boolean;
  onQrSelectedIndexChange: (index: number) => unknown;
}

function PickerQuestionnaireResponseCardContent(props: Props) {
  const {
    launch,
    questionnaireResponses,
    selectedQuestionnaireResponseIndex,
    questionnaireResponseIsSearching,
    onQrSelectedIndexChange
  } = props;

  if (!launch.fhirClient) {
    return (
      <Alert severity="error" sx={{ m: 2, p: 2 }}>
        <AlertTitle>CMS not connected</AlertTitle>
        Application not launched from CMS, unable to fetch responses.
      </Alert>
    );
  } else if (questionnaireResponseIsSearching) {
    return <PickerSkeletonList />;
  } else if (questionnaireResponses.length === 0) {
    return (
      <Alert severity="info" sx={{ m: 2, p: 2 }}>
        <AlertTitle>No responses found</AlertTitle>
        There are currently no responses available for this questionnaire.
      </Alert>
    );
  } else {
    return (
      <PrimarySelectableList>
        {questionnaireResponses.map((questionnaireResponse, i) => (
          <ListItemButton
            key={questionnaireResponse.id}
            selected={selectedQuestionnaireResponseIndex === i}
            sx={{ py: 1.25, px: 2.5 }}
            onClick={() => {
              onQrSelectedIndexChange(i);
            }}>
            <ArticleIcon sx={{ mr: 2 }} />
            <ListItemText
              primary={dayjs(`${questionnaireResponse.meta?.lastUpdated}`).format('LLL')}
              primaryTypographyProps={{ variant: 'subtitle2' }}
            />
          </ListItemButton>
        ))}
      </PrimarySelectableList>
    );
  }
}

export default PickerQuestionnaireResponseCardContent;
