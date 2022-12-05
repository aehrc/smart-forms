import { QuestionnaireResponse } from 'fhir/r5';
import React, { useContext } from 'react';
import { AlertTitle, ListItemButton, ListItemText, Tooltip } from '@mui/material';
import { PrimarySelectableList } from '../StyledComponents/Lists.styles';
import PickerSkeletonList from './PickerSkeletonList';
import dayjs from 'dayjs';
import { LaunchContext } from '../../custom-contexts/LaunchContext';
import PendingIcon from '@mui/icons-material/Pending';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import { PickerAlert } from '../StyledComponents/Alert.styles';

interface Props {
  questionnaireResponses: QuestionnaireResponse[];
  selectedQuestionnaireIndex: number | null;
  selectedQuestionnaireResponseIndex: number | null;
  questionnaireResponseIsSearching: boolean;
  questionnaireSourceIsLocal: boolean;
  onQrSelectedIndexChange: (index: number) => unknown;
}

function PickerQuestionnaireResponseCardContent(props: Props) {
  const {
    questionnaireResponses,
    selectedQuestionnaireIndex,
    selectedQuestionnaireResponseIndex,
    questionnaireResponseIsSearching,
    questionnaireSourceIsLocal,
    onQrSelectedIndexChange
  } = props;

  const launch = useContext(LaunchContext);

  if (!launch.fhirClient) {
    return (
      <PickerAlert severity="error">
        <AlertTitle>CMS not connected</AlertTitle>
        Application not launched from CMS, unable to fetch responses.
      </PickerAlert>
    );
  } else if (questionnaireSourceIsLocal) {
    return (
      <PickerAlert severity="error">
        <AlertTitle>Questionnaire source set to local</AlertTitle>
        Questionnaires loaded from local source instead of CMS, unable to fetch responses.
      </PickerAlert>
    );
  } else if (questionnaireResponseIsSearching) {
    return <PickerSkeletonList />;
  } else if (questionnaireResponses.length === 0) {
    if (selectedQuestionnaireIndex === null) {
      return (
        <PickerAlert severity="info">
          <AlertTitle>No questionnaire selected</AlertTitle>
          Select a questionnaire to view responses.
        </PickerAlert>
      );
    } else {
      return (
        <PickerAlert severity="info">
          <AlertTitle>No responses found</AlertTitle>
          There are currently no responses available.
        </PickerAlert>
      );
    }
  } else {
    return (
      <PrimarySelectableList>
        {questionnaireResponses.map((questionnaireResponse, i) => (
          <ListItemButton
            key={questionnaireResponse.id}
            selected={selectedQuestionnaireResponseIndex === i}
            sx={{ py: 1, px: 2.5 }}
            onClick={() => {
              onQrSelectedIndexChange(i);
            }}>
            {questionnaireResponse.status === 'completed' ? (
              <Tooltip title="Completed" sx={{ mr: 2 }}>
                <TaskAltIcon />
              </Tooltip>
            ) : (
              <Tooltip title="In progress" sx={{ mr: 2 }}>
                <PendingIcon />
              </Tooltip>
            )}
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
          </ListItemButton>
        ))}
      </PrimarySelectableList>
    );
  }
}

export default PickerQuestionnaireResponseCardContent;
