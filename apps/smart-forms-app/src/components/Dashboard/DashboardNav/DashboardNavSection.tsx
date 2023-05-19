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
import { memo, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { StyledNavItemIcon } from '../../StyledComponents/NavSection.styles';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import { SmartAppLaunchContext } from '../../../custom-contexts/SmartAppLaunchContext.tsx';

interface NavButton {
  title: string;
  path: string;
  icon: JSX.Element;
  disabled?: boolean;
}

function DashboardNavSection() {
  const { fhirClient } = useContext(SmartAppLaunchContext);

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ px: 2.5, pb: 0.75 }}>
        <Typography variant="overline">Pages</Typography>
      </Box>
      <List disablePadding sx={{ px: 1 }}>
        <NavItem
          title={'Questionnaires'}
          path={'/dashboard/questionnaires'}
          icon={<AssignmentIcon />}
        />
        <NavItem
          title={'Responses'}
          path={'/dashboard/responses'}
          icon={<AssignmentTurnedInIcon />}
          disabled={!fhirClient}
        />
      </List>
    </Box>
  );
}

function NavItem(props: NavButton) {
  const { title, path, icon, disabled } = props;
  const theme = useTheme();

  return (
    <ListItemButton
      component={NavLink}
      to={path}
      disableGutters
      disabled={disabled}
      data-test="list-button-dashboard-nav-page"
      sx={{
        ...theme.typography.subtitle2,
        height: 48,
        textTransform: 'capitalize',
        color: theme.palette.text.secondary,
        borderRadius: Number(theme.shape.borderRadius) * 0.2,

        '&.active': {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.action.selected,
          fontWeight: theme.typography.fontWeightBold,
          '& .MuiListItemIcon-root': {
            color: theme.palette.primary.dark
          }
        }
      }}>
      <StyledNavItemIcon>{icon}</StyledNavItemIcon>

      <ListItemText disableTypography primary={title} />
    </ListItemButton>
  );
}

export default memo(DashboardNavSection);
