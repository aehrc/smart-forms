/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
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

import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import type { SetStateAction } from 'react';
import { useState } from 'react';
import { CircularProgress, Fade, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import Typography from '@mui/material/Typography';
import { useExtractOperationStore } from '../stores/extractOperationStore.ts';
import { FORMS_SERVER_URL } from '../../../globals.ts';
import Iconify from '../../../components/Iconify/Iconify.tsx';

interface ExtractMenuProps {
  isExtracting: boolean;
  onObservationExtract: () => void;
  onStructureMapExtract: () => void;
}

function ExtractMenu(props: ExtractMenuProps) {
  const { isExtracting, onObservationExtract, onStructureMapExtract } = props;

  const targetStructureMap = useExtractOperationStore.use.targetStructureMap();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: { currentTarget: SetStateAction<HTMLElement | null> }) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const structuredMapExtractEnabled = targetStructureMap !== null;
  const structuredMapToolTipText = structuredMapExtractEnabled
    ? ''
    : `The current questionnaire does not have a target StructureMap for $extract, or the target StructureMap cannot be found on ${FORMS_SERVER_URL}`;

  return (
    <>
      <Button
        id="extract-button"
        aria-controls={open ? 'extract-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        sx={{ my: 0.5 }}
        endIcon={
          isExtracting ? (
            <CircularProgress size={16} color="inherit" sx={{ ml: 0.25 }} />
          ) : (
            <KeyboardArrowDown />
          )
        }
        disabled={isExtracting}
        onClick={handleClick}>
        Extract
      </Button>
      <Menu
        id="extract-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'extract-button'
        }}>
        <MenuItem
          onClick={() => {
            onObservationExtract();
            handleClose();
          }}>
          <ListItemIcon>
            <Iconify icon="ion:binoculars" />
          </ListItemIcon>
          <ListItemText>Observation-based $extract</ListItemText>
        </MenuItem>
        <Tooltip title="Not implemented" placement="right">
          <span>
            <MenuItem disabled={true}>
              <ListItemIcon>
                <Iconify icon="ion:document-text-outline" />
              </ListItemIcon>
              <ListItemText>Definition-based $extract</ListItemText>
            </MenuItem>
          </span>
        </Tooltip>
        <Tooltip title={structuredMapToolTipText} placement="right">
          <span>
            <MenuItem
              disabled={!structuredMapExtractEnabled}
              onClick={() => {
                onStructureMapExtract();
                handleClose();
              }}>
              <ListItemIcon>
                <Iconify icon="tabler:transform" />
              </ListItemIcon>
              <ListItemText>StructureMap-based $extract</ListItemText>
            </MenuItem>
          </span>
        </Tooltip>
      </Menu>

      {isExtracting ? (
        <Fade in={true} timeout={100}>
          <Typography variant="body2" color="text.secondary">
            Performing extraction...
          </Typography>
        </Fade>
      ) : null}
    </>
  );
}

export default ExtractMenu;
