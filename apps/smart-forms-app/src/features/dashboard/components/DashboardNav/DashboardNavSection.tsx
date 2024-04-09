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

import { List } from '@mui/material';
import { memo } from 'react';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import DashboardNavItem from './DashboardNavItem.tsx';
import {
  NavSectionHeading,
  NavSectionHeadingWrapper,
  NavSectionWrapper
} from '../../../../components/Nav/Nav.styles.ts';
import { useLocation } from 'react-router-dom';
import useSmartClient from '../../../../hooks/useSmartClient.ts';

interface DashboardNavSectionProps {
  onCloseNav: () => void;
}

const DashboardNavSection = memo(function DashboardNavSection(props: DashboardNavSectionProps) {
  const { onCloseNav } = props;

  const { smartClient } = useSmartClient();
  const { pathname } = useLocation();

  if (pathname === '/dashboard/existing') {
    return null;
  }

  return (
    <NavSectionWrapper>
      <NavSectionHeadingWrapper>
        <NavSectionHeading>Pages</NavSectionHeading>
      </NavSectionHeadingWrapper>
      <List disablePadding sx={{ px: 1 }}>
        <DashboardNavItem
          title={'Questionnaires'}
          path={'/dashboard/questionnaires'}
          icon={<AssignmentIcon />}
          onCloseNav={onCloseNav}
        />
        <DashboardNavItem
          title={'Responses'}
          path={'/dashboard/responses'}
          icon={<AssignmentTurnedInIcon />}
          disabled={!smartClient}
          onCloseNav={onCloseNav}
        />
      </List>
    </NavSectionWrapper>
  );
});

export default DashboardNavSection;
