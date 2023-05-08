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

import { Box, List, ListItemButton, ListItemText, Typography, useTheme } from '@mui/material';
import { useContext } from 'react';
import { StyledNavItemIcon } from '../../StyledComponents/NavSection.styles';
import RendererSaveAsDraft from './RendererSaveAsDraft';
import RendererSaveAsFinal from './RendererSaveAsFinal';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useLocation, useNavigate } from 'react-router-dom';
import { LaunchContext } from '../../../custom-contexts/LaunchContext';
import { QuestionnaireProviderContext } from '../../../App';

export interface NavButton {
  title: string;
  icon: JSX.Element;
  disabled?: boolean;
  onClick: () => unknown;
}

function RendererOperationSection() {
  const { fhirClient } = useContext(LaunchContext);
  const questionnaireProvider = useContext(QuestionnaireProviderContext);

  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ px: 2.5, pb: 0.75 }}>
        <Typography variant="overline">Operations</Typography>
      </Box>
      <List disablePadding sx={{ px: 1 }}>
        {location.pathname === '/renderer/preview' ? (
          <OperationItem
            title={'Editor'}
            icon={<EditIcon />}
            onClick={() => {
              navigate('/renderer');
            }}
          />
        ) : (
          <OperationItem
            title={'Preview'}
            icon={<VisibilityIcon />}
            onClick={() => {
              navigate('/renderer/preview');
            }}
          />
        )}
        {fhirClient && questionnaireProvider.questionnaire.item ? (
          <>
            <RendererSaveAsDraft />
            <RendererSaveAsFinal />
          </>
        ) : null}
      </List>
    </Box>
  );
}

export function OperationItem(props: NavButton) {
  const { title, icon, disabled, onClick } = props;
  const theme = useTheme();

  return (
    <ListItemButton
      disableGutters
      onClick={onClick}
      disabled={disabled}
      data-test="list-button-renderer-operation"
      sx={{
        ...theme.typography.subtitle2,
        height: 48,
        textTransform: 'capitalize',
        color: theme.palette.text.secondary,
        borderRadius: Number(theme.shape.borderRadius) * 0.2
      }}>
      <StyledNavItemIcon>{icon}</StyledNavItemIcon>

      <ListItemText disableTypography primary={title} />
    </ListItemButton>
  );
}

export default RendererOperationSection;
