/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
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

import { type ReactNode } from 'react';
import { Box } from '@mui/material';

interface ActionBarForStorybookProps {
  children: ReactNode;
}

function ActionBarForStorybook(props: ActionBarForStorybookProps) {
  const { children } = props;

  return (
    <Box
      display="flex"
      mb={3}
      alignItems="center"
      columnGap={2}
      border={1}
      px={1.5}
      py={0.5}
      borderRadius={4}
      borderColor="grey.300"
      bgcolor="grey.50">
      {children}
    </Box>
  );
}

export default ActionBarForStorybook;
