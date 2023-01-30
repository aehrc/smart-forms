/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
