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

import { Drawer } from '@mui/material';
import { NAV_WIDTH } from '../../../../components/Header/Header.styles.ts';
import RendererNav from './RendererNav.tsx';
import useSmartClient from '../../../../hooks/useSmartClient.ts';
import type { RendererSpinner } from '../../types/rendererSpinner.ts';

interface RendererNavShownProps {
  mobileNavOpen: boolean;
  desktopNavCollapsed: boolean;
  desktopNavIsShown: boolean;
  onCloseMobileNav: () => void;
  onCollapseDesktopNav: () => void;
  spinner: RendererSpinner;
  onSpinnerChange: (newSpinner: RendererSpinner) => void;
}

function RendererNavDrawer(props: RendererNavShownProps) {
  const {
    mobileNavOpen,
    desktopNavIsShown,
    onCloseMobileNav,
    onCollapseDesktopNav,
    spinner,
    onSpinnerChange
  } = props;

  const { smartClient } = useSmartClient();

  const isNotLaunched = !smartClient;

  if (desktopNavIsShown) {
    return (
      <Drawer
        open
        variant="permanent"
        PaperProps={{
          sx: {
            width: NAV_WIDTH,
            bgcolor: 'background.default',
            borderRightStyle: 'dashed'
          }
        }}>
        <RendererNav
          isNotLaunched={isNotLaunched}
          navIsShown={desktopNavIsShown}
          onCollapseNav={onCollapseDesktopNav}
          spinner={spinner}
          onSpinnerChange={onSpinnerChange}
        />
      </Drawer>
    );
  }

  return (
    <Drawer
      open={mobileNavOpen}
      onClose={onCloseMobileNav}
      ModalProps={{
        keepMounted: true
      }}
      PaperProps={{
        sx: { width: NAV_WIDTH }
      }}>
      <RendererNav
        isNotLaunched={isNotLaunched}
        navIsShown={desktopNavIsShown}
        onCollapseNav={onCollapseDesktopNav}
        spinner={spinner}
        onSpinnerChange={onSpinnerChange}
      />
    </Drawer>
  );
}

export default RendererNavDrawer;
