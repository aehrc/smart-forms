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

import { createContext, useRef, useState } from 'react';
import { Main, StyledRoot } from '../../components/Layout/Layout.styles.ts';
import { Outlet } from 'react-router-dom';
import BackToTopButton from '../backToTop/components/BackToTopButton.tsx';
import ViewerNav from './ViewerNav/ViewerNav.tsx';

import type { PrintComponentRefContextType } from '../../types/printComponentRefContext.type.ts';
import GenericHeader from '../../components/Header/GenericHeader.tsx';
import RendererDebugFooter from '../renderer/components/RendererDebugFooter/RendererDebugFooter.tsx';
import useDebugMode from '../../hooks/useDebugMode.ts';

export const PrintComponentRefContext = createContext<PrintComponentRefContextType>({
  componentRef: null
});

function ViewerLayout() {
  const [open, setOpen] = useState(false);

  const componentRef = useRef<HTMLDivElement>(null); // ✅ Store the ref directly

  const { debugModeEnabled } = useDebugMode();

  return (
    <PrintComponentRefContext.Provider value={{ componentRef }}>
      <StyledRoot>
        <GenericHeader onOpenNav={() => setOpen(true)} />
        <ViewerNav openNav={open} onCloseNav={() => setOpen(false)} />

        <Main>
          <Outlet />

          {/* Debug footer */}
          {debugModeEnabled ? <RendererDebugFooter /> : null}
        </Main>
        <BackToTopButton />
      </StyledRoot>
    </PrintComponentRefContext.Provider>
  );
}

export default ViewerLayout;
