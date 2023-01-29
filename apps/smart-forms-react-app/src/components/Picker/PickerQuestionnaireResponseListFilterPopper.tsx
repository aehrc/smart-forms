import React from 'react';
import PopupState, { bindPopover, bindTrigger } from 'material-ui-popup-state';
import { Box, IconButton, List, ListItemButton, Popover, Tooltip, Typography } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import ListItemText from '@mui/material/ListItemText';
import { QrSortParam } from '../../interfaces/Enums';

interface Props {
  onQrSortByParamChange: (sortByParam: string) => unknown;
}

function PickerQuestionnaireResponseListFilterPopper(props: Props) {
  const { onQrSortByParamChange } = props;

  return (
    <>
      <PopupState variant="popover" popupId="sort-questionnaire-response-popover">
        {(popupState) => (
          <div>
            <Tooltip title="Filter responses">
              <IconButton size={'small'} sx={{ mr: 0.5 }} {...bindTrigger(popupState)}>
                <FilterListIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Popover
              {...bindPopover(popupState)}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center'
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'center'
              }}>
              <Box>
                <List disablePadding dense>
                  <ListItemButton
                    onClick={() => onQrSortByParamChange(QrSortParam.QuestionnaireName)}>
                    <ListItemText
                      primary={<Typography fontSize={12}>Questionnaire Name</Typography>}
                    />
                  </ListItemButton>
                  <ListItemButton onClick={() => onQrSortByParamChange(QrSortParam.AuthorName)}>
                    <ListItemText primary={<Typography fontSize={12}>Provider Name</Typography>} />
                  </ListItemButton>
                  <ListItemButton onClick={() => onQrSortByParamChange(QrSortParam.LastUpdated)}>
                    <ListItemText primary={<Typography fontSize={12}>Date Modified</Typography>} />
                  </ListItemButton>
                  <ListItemButton onClick={() => onQrSortByParamChange(QrSortParam.Status)}>
                    <ListItemText primary={<Typography fontSize={12}>Status</Typography>} />
                  </ListItemButton>
                </List>
              </Box>
            </Popover>
          </div>
        )}
      </PopupState>
    </>
  );
}

export default PickerQuestionnaireResponseListFilterPopper;
