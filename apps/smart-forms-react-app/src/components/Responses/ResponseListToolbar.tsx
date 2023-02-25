import { IconButton, Tooltip, Typography } from '@mui/material';
import Iconify from '../Misc/Iconify';
import { StyledRoot } from '../Questionnaires/QuestionnaireListToolbar.styles';
import { ResponseListItem } from '../../interfaces/Interfaces';
import dayjs from 'dayjs';
import { useContext } from 'react';
import { SelectedQuestionnaireContext } from '../../custom-contexts/SelectedQuestionnaireContext';
import { LaunchContext } from '../../custom-contexts/LaunchContext';
import { constructName } from '../../functions/LaunchContextFunctions';

interface Props {
  selected: ResponseListItem | undefined;
  clearSelection: () => void;
}

function ResponseListToolbar(props: Props) {
  const { selected, clearSelection } = props;

  const { selectedQuestionnaire, existingResponses, clearSelectedQuestionnaire } = useContext(
    SelectedQuestionnaireContext
  );
  const { patient } = useContext(LaunchContext);

  const selectedQuestionnaireTitle =
    selectedQuestionnaire?.listItem.title ?? 'selected questionnaire';

  return (
    <StyledRoot
      sx={{
        ...(selected
          ? {
              color: 'primary.main',
              bgcolor: 'pale.primary'
            }
          : selectedQuestionnaire && existingResponses.length > 0
          ? {
              color: 'secondary.main',
              bgcolor: 'pale.secondary'
            }
          : null)
      }}>
      {selected ? (
        <Typography component="div" variant="subtitle1">
          {selected.title} — {dayjs(selected.authored).format('LL')} selected
        </Typography>
      ) : selectedQuestionnaire && existingResponses.length > 0 ? (
        <Typography variant="subtitle1">
          Displaying responses from <b>{selectedQuestionnaireTitle}</b> questionnaire
        </Typography>
      ) : (
        <Typography variant="subtitle1">
          Showing all responses for <b>{constructName(patient?.name)}</b>
        </Typography>
      )}

      {selected ? (
        <Tooltip title="Clear">
          <IconButton onClick={clearSelection}>
            <Iconify icon="ic:baseline-clear" />
          </IconButton>
        </Tooltip>
      ) : selectedQuestionnaire && existingResponses.length > 0 ? (
        <Tooltip title="Remove questionnaire filter">
          <IconButton onClick={() => clearSelectedQuestionnaire()}>
            <Iconify icon="material-symbols:filter-alt-off-outline" />
          </IconButton>
        </Tooltip>
      ) : null}
    </StyledRoot>
  );
}

export default ResponseListToolbar;
