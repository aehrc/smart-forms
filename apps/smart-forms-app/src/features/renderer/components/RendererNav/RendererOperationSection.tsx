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

import { Box, List, ListItemText, Typography } from '@mui/material';
import type { OperationItem } from '../../../../types/Nav.interface.ts';
import { NavListItemButton, StyledNavItemIcon } from '../../../../components/Nav/Nav.styles.ts';
import { useQuestionnaireStore } from '@aehrc/smart-forms-renderer';
import useSmartClient from '../../../../hooks/useSmartClient.ts';
import type { RendererSpinner } from '../../types/rendererSpinner.ts';
import RepopulateOperation from './Repopulate/RepopulateOperation.tsx';
import SaveProgressAction from '../RendererSpeedDial/SaveProgressAction.tsx';
import SaveAsFinalAction from '../RendererSpeedDial/SaveAsFinalAction.tsx';
import PreviewAction from '../RendererSpeedDial/PreviewAction.tsx';

interface RendererOperationSectionProps {
  spinner: RendererSpinner;
  onSpinnerChange: (newSpinner: RendererSpinner) => void;
}

function RendererOperationSection(props: RendererOperationSectionProps) {
  const { spinner, onSpinnerChange } = props;

  const { smartClient } = useSmartClient();

  const sourceQuestionnaire = useQuestionnaireStore((state) => state.sourceQuestionnaire);

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ px: 2.5, pb: 0.75 }}>
        <Typography variant="overline">Operations</Typography>
      </Box>
      <List disablePadding sx={{ px: 1 }}>
        <PreviewAction />
        {smartClient && sourceQuestionnaire.item ? (
          <>
            <SaveProgressAction />
            <SaveAsFinalAction />
            <RepopulateOperation spinner={spinner} onSpinnerChange={onSpinnerChange} />
          </>
        ) : null}
      </List>
    </Box>
  );
}

export function RendererOperationItem(props: OperationItem) {
  const { title, icon, disabled, onClick } = props;

  return (
    <NavListItemButton
      disableGutters
      onClick={onClick}
      disabled={disabled}
      data-test="list-button-renderer-operation">
      <StyledNavItemIcon>{icon}</StyledNavItemIcon>

      <ListItemText disableTypography primary={title} />
    </NavListItemButton>
  );
}

export default RendererOperationSection;
