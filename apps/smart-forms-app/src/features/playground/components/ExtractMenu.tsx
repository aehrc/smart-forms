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
import { useMemo, useState } from 'react';
import { CircularProgress, Fade, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import Typography from '@mui/material/Typography';
import Iconify from '../../../components/Iconify/Iconify.tsx';
import { canBeTemplateExtracted } from '@aehrc/sdc-template-extract';
import { canBeObservationExtracted, useQuestionnaireStore } from '@aehrc/smart-forms-renderer';

interface ExtractMenuProps {
  isExtracting: boolean;
  onObservationExtract: () => void;
  onTemplateExtract: (modifiedOnly: boolean) => void;
}

function ExtractMenu(props: ExtractMenuProps) {
  const { isExtracting, onObservationExtract, onTemplateExtract } = props;

  const sourceQuestionnaire = useQuestionnaireStore.use.sourceQuestionnaire();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Check if questionnaire can be observation-based extracted
  const observationBasedExtractEnabled = useMemo(
    () => canBeObservationExtracted(sourceQuestionnaire),
    [sourceQuestionnaire]
  );
  const observationBasedExtractToolTipText = observationBasedExtractEnabled
    ? ''
    : `The current questionnaire does not contain any "sdc-questionnaire-observationExtract" extensions`;

  // Check if questionnaire can be template-based extracted
  const templateBasedExtractEnabled = useMemo(
    () => canBeTemplateExtracted(sourceQuestionnaire),
    [sourceQuestionnaire]
  );
  const templateBasedExtractToolTipText = templateBasedExtractEnabled
    ? ''
    : `The current questionnaire does not contain any "sdc-questionnaire-templateExtract" extensions`;

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
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{
          list: {
            'aria-labelledby': 'extract-button'
          }
        }}>
        <Tooltip title={observationBasedExtractToolTipText} placement="right">
          <span>
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
          </span>
        </Tooltip>

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

        <Tooltip title={templateBasedExtractToolTipText} placement="right">
          <span>
            <MenuItem
              disabled={!templateBasedExtractEnabled}
              onClick={() => {
                onTemplateExtract(false);
                handleClose();
              }}>
              <ListItemIcon>
                <Iconify icon="mdi:file-document" />
              </ListItemIcon>
              <ListItemText>Template-based $extract [{TEMPLATE_EXTRACT_VERSION}]</ListItemText>
            </MenuItem>
          </span>
        </Tooltip>
        <Tooltip title={templateBasedExtractToolTipText} placement="right">
          <span>
            <MenuItem
              disabled={!templateBasedExtractEnabled}
              onClick={() => {
                onTemplateExtract(true);
                handleClose();
              }}>
              <ListItemIcon>
                <Iconify icon="mdi:file-document-edit" />
              </ListItemIcon>
              <ListItemText>
                Template-based $extract (modified only) [{TEMPLATE_EXTRACT_VERSION}]
              </ListItemText>
            </MenuItem>
          </span>
        </Tooltip>

        <Tooltip
          title="As of 1 July 2025, our demo StructuredMap-based $extract engine is no longer available. Please visit https://dev.fhirpath-lab.com/Questionnaire/tester for a wider range of $extract options."
          placement="right">
          <span>
            <MenuItem disabled={true}>
              <ListItemIcon>
                <Iconify icon="tabler:transform" />
              </ListItemIcon>
              <ListItemText>
                <span style={{ textDecoration: 'line-through' }}>StructureMap-based $extract</span>
              </ListItemText>
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
