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

import { forwardRef } from 'react';
import type { SxProps, Theme } from '@mui/material';
import { Box, Typography } from '@mui/material';
import { ReactComponent as AppLogo } from '../../data/images/logo.svg';

interface Props {
  sx?: SxProps<Theme>;
}

const Logo = forwardRef((props: Props, ref) => {
  const { sx } = props;

  const logo = (
    <Box
      ref={ref}
      component="div"
      sx={{
        width: 40,
        height: 40,
        display: 'inline-flex',
        ...sx
      }}>
      <AppLogo />
    </Box>
  );

  return (
    <Box display="flex" alignItems="center">
      {logo}
      <Typography variant="h6" sx={{ ml: 1.5, color: 'common.black' }}>
        Smart Forms
      </Typography>
    </Box>
  );
});

Logo.displayName = 'Logo';

export default Logo;
