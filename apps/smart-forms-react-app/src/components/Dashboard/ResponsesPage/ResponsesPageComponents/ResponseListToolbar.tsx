import { IconButton, InputAdornment, Tooltip, Typography, useTheme } from '@mui/material';
import Iconify from '../../../Misc/Iconify';
import {
  StyledRoot,
  StyledSearch
} from '../../QuestionnairePage/QuestionnairePageComponents/QuestionnaireListToolbar.styles';
import type { ResponseListItem } from '../../../../interfaces/Interfaces';
import dayjs from 'dayjs';
import type { ChangeEvent } from 'react';
import React, { useContext } from 'react';
import { SelectedQuestionnaireContext } from '../../../../custom-contexts/SelectedQuestionnaireContext';
import { LaunchContext } from '../../../../custom-contexts/LaunchContext';
import { constructName } from '../../../../functions/LaunchContextFunctions';

interface Props {
  selected: ResponseListItem | undefined;
  searchInput: string;
  clearSelection: () => void;
  onSearch: (searchInput: string) => void;
}

function ResponseListToolbar(props: Props) {
  const { selected, searchInput, clearSelection, onSearch } = props;

  const { selectedQuestionnaire, existingResponses, clearSelectedQuestionnaire } = useContext(
    SelectedQuestionnaireContext
  );
  const { patient } = useContext(LaunchContext);
  const theme = useTheme();

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
        <StyledSearch
          value={searchInput}
          onChange={(event: ChangeEvent<HTMLInputElement>) => onSearch(event.target.value)}
          placeholder="Search responses..."
          startAdornment={
            <InputAdornment position="start">
              <Iconify
                icon="eva:search-fill"
                sx={{ color: 'text.disabled', width: 20, height: 20 }}
              />
            </InputAdornment>
          }
          sx={{
            '&.Mui-focused': {
              width: '50%',
              boxShadow: theme.customShadows.z4
            }
          }}
        />
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
      ) : (
        <Typography variant="subtitle1">
          Showing responses for <b>{constructName(patient?.name)}</b>
        </Typography>
      )}
    </StyledRoot>
  );
}

export default ResponseListToolbar;
