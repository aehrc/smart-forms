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

import { Box, List } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import RendererOperationItem from './RendererOperationItem.tsx';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { NavSectionHeading } from '../../../../components/Nav/Nav.styles.ts';

function RendererNavSection() {
  const navigate = useNavigate();
  const { closeSnackbar } = useSnackbar();

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ px: 2.5, pb: 0.75 }}>
        <NavSectionHeading>Pages</NavSectionHeading>
      </Box>
      <List disablePadding sx={{ px: 1 }}>
        <RendererOperationItem
          title="Back to Questionnaires"
          icon={<ArrowBackIcon />}
          onClick={() => {
            closeSnackbar();
            navigate('/dashboard/questionnaires');
          }}
        />
      </List>
    </Box>
  );
}

export default RendererNavSection;
