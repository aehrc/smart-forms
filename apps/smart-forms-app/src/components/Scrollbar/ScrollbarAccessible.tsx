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

import type { ReactNode } from 'react';
import { memo } from 'react';
import { Box } from '@mui/material';
// import { StyledRootScrollbar } from './Scrollbar.styles';
// import SimpleBar from 'simplebar-react';

interface ScrollbarAccessibleProps {
  children: ReactNode;
  //   sx?: SxProps<Theme>;
}

const ScrollbarAccessible = memo(function Scrollbar(props: ScrollbarAccessibleProps) {
  const { children, ...other } = props;

  const userAgent = typeof navigator === 'undefined' ? 'SSR' : navigator.userAgent;

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

  if (isMobile) {
    return (
      <Box sx={{ overflowX: 'auto' }} {...other}>
        {children}
      </Box>
    );
  }

  return (
    <Box sx={{ overflowX: 'auto' }} {...other}>
      {children}
    </Box>
  );
});

export default ScrollbarAccessible;
