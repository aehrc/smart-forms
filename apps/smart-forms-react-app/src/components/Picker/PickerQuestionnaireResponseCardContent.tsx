import { QuestionnaireResponse } from 'fhir/r5';
import React, { useContext } from 'react';
import { Alert, AlertTitle, ListItemButton, ListItemText, Tooltip } from '@mui/material';
import GradingIcon from '@mui/icons-material/Grading';
import { PrimarySelectableList } from '../StyledComponents/Lists.styles';
import PickerSkeletonList from './PickerSkeletonList';
import dayjs from 'dayjs';
import { LaunchContext } from '../../custom-contexts/LaunchContext';
import PendingIcon from '@mui/icons-material/Pending';
import TaskAltIcon from '@mui/icons-material/TaskAlt';

interface Props {
  questionnaireResponses: QuestionnaireResponse[];
  selectedQuestionnaireIndex: number | null;
  selectedQuestionnaireResponseIndex: number | null;
  questionnaireResponseIsSearching: boolean;
  onQrSelectedIndexChange: (index: number) => unknown;
}

function PickerQuestionnaireResponseCardContent(props: Props) {
  const {
    questionnaireResponses,
    selectedQuestionnaireIndex,
    selectedQuestionnaireResponseIndex,
    questionnaireResponseIsSearching,
    onQrSelectedIndexChange
  } = props;

  const launch = useContext(LaunchContext);

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
    if (selectedQuestionnaireIndex === null) {
      return (
        <Alert severity="info" sx={{ m: 2, p: 2 }}>
          <AlertTitle>No questionnaire selected</AlertTitle>
          Select a questionnaire to view responses.
        </Alert>
      );
    } else {
      return (
        <Alert severity="info" sx={{ m: 2, p: 2 }}>
          <AlertTitle>No responses found</AlertTitle>
          There are currently no responses available.
        </Alert>
      );
    }
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
            <GradingIcon sx={{ mr: 2 }} />
            <ListItemText
              primary={
                questionnaireResponse.item?.[0].text +
                ' - by ' +
                questionnaireResponse.author?.display +
                ' (' +
                dayjs(`${questionnaireResponse.meta?.lastUpdated}`).format('LLL') +
                ')'
              }
              primaryTypographyProps={{ variant: 'subtitle2' }}
            />
            {questionnaireResponse.status === 'completed' ? (
              <Tooltip title="Completed">
                <TaskAltIcon />
              </Tooltip>
            ) : (
              <Tooltip title="In progress">
                <PendingIcon />
              </Tooltip>
            )}
          </ListItemButton>
        ))}
      </PrimarySelectableList>
    );
  }
}

export default PickerQuestionnaireResponseCardContent;
