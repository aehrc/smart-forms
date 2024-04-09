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

import { Box } from '@mui/material';
import useResponsive from '../../../../hooks/useResponsive.ts';
import { NAV_WIDTH } from '../../../../components/Header/Header.styles.ts';
import RendererNavDrawer from './RendererNavDrawer.tsx';
import type { RendererSpinner } from '../../types/rendererSpinner.ts';

interface Props {
  mobileNavOpen: boolean;
  desktopNavCollapsed: boolean;
  onCloseMobileNav: () => void;
  onCollapseDesktopNav: () => void;
  spinner: RendererSpinner;
  onSpinnerChange: (newSpinner: RendererSpinner) => void;
}

function RendererNavWrapper(props: Props) {
  const {
    mobileNavOpen,
    desktopNavCollapsed,
    onCloseMobileNav,
    onCollapseDesktopNav,
    spinner,
    onSpinnerChange
  } = props;

  const isDesktop = useResponsive('up', 'lg');

  const desktopNavIsShown = isDesktop && !desktopNavCollapsed;

  return (
    <>
      <Box
        component="nav"
        sx={{
          flexShrink: { lg: 0 },
          width: { lg: desktopNavCollapsed ? 0 : NAV_WIDTH }
        }}>
        <RendererNavDrawer
          mobileNavOpen={mobileNavOpen}
          desktopNavCollapsed={desktopNavCollapsed}
          desktopNavIsShown={desktopNavIsShown}
          onCloseMobileNav={onCloseMobileNav}
          onCollapseDesktopNav={onCollapseDesktopNav}
          spinner={spinner}
          onSpinnerChange={onSpinnerChange}
        />
      </Box>
    </>
  );
}

export default RendererNavWrapper;
