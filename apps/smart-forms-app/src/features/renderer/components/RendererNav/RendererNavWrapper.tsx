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

import { Box } from '@mui/material';
import useResponsive from '../../../../hooks/useResponsive.ts';
import { NAV_WIDTH } from '../../../../components/Header/Header.styles.ts';
import RendererNavDrawer from './RendererNavDrawer.tsx';

interface Props {
  openNav: boolean;
  navCollapsed: boolean;
  onCloseNav: () => void;
  setNavCollapsed: () => void;
}

function RendererNavWrapper(props: Props) {
  const { openNav, onCloseNav, navCollapsed, setNavCollapsed } = props;

  const isDesktop = useResponsive('up', 'lg');

  const navIsShown = isDesktop && !navCollapsed;

  return (
    <>
      <Box
        component="nav"
        sx={{
          flexShrink: { lg: 0 },
          width: { lg: navCollapsed ? 0 : NAV_WIDTH }
        }}>
        <RendererNavDrawer
          openNav={openNav}
          navCollapsed={navCollapsed}
          navIsShown={navIsShown}
          onCloseNav={onCloseNav}
          setNavCollapsed={setNavCollapsed}
        />
      </Box>
    </>
  );
}

export default RendererNavWrapper;
