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
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import {
  NavSectionHeading,
  NavSectionHeadingWrapper,
  NavSectionWrapper
} from '../../../components/Nav/Nav.styles.ts';
import ViewerOperationItem from './ViewerOperationItem.tsx';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function ViewerNavSection() {
  const navigate = useNavigate();
  const { closeSnackbar } = useSnackbar();

  return (
    <NavSectionWrapper>
      <NavSectionHeadingWrapper>
        <NavSectionHeading>Pages</NavSectionHeading>
      </NavSectionHeadingWrapper>
      <List disablePadding sx={{ px: 1 }}>
        <ViewerOperationItem
          title={'Back to Responses'}
          icon={<ArrowBackIcon />}
          onClick={() => {
            closeSnackbar();
            navigate('/dashboard/responses');
          }}
        />
      </List>
    </NavSectionWrapper>
  );
}

export default ViewerNavSection;
