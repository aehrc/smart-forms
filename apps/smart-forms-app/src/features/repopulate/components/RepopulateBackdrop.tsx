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

import { Backdrop } from '@mui/material';
import PopulationProgressSpinner from '../../../components/Spinners/PopulationProgressSpinner.tsx';
import { alpha } from '@mui/material/styles';
import { grey } from '@mui/material/colors';
import type { RendererSpinner } from '../../renderer/types/rendererSpinner.ts';

interface RepopulateBackdropProps {
  spinner: RendererSpinner;
  onSpinnerChange: (newSpinner: RendererSpinner) => void;
}

function RepopulateBackdrop(props: RepopulateBackdropProps) {
  const { spinner, onSpinnerChange } = props;

  const isRepopulateFetching = spinner.isSpinning && spinner.status === 'repopulate-fetch';

  return (
    <Backdrop
      sx={{
        backgroundColor: alpha(grey[200], 0.33),
        zIndex: (theme) => theme.zIndex.drawer + 10000,
        backdropFilter: 'blur(1.5px)'
      }}
      open={isRepopulateFetching}
      onClick={() =>
        onSpinnerChange({ isSpinning: false, status: 'repopulate-cancel', message: '' })
      }>
      <PopulationProgressSpinner message={spinner.message} />
    </Backdrop>
  );
}

export default RepopulateBackdrop;
