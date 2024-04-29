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

import { SpeedDial } from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import useSmartClient from '../../../../hooks/useSmartClient.ts';
import type { RendererSpinner } from '../../types/rendererSpinner.ts';
import RendererEmbeddedStandardActions from './RendererEmbeddedStandardActions.tsx';
import RendererEmbeddedLaunchQuestionnaireActions from './RendererEmbeddedLaunchQuestionnaireActions.tsx';
import { useState } from 'react';

interface RendererEmbeddedSpeedDialProps {
  spinner: RendererSpinner;
  onSpinnerChange: (newSpinner: RendererSpinner) => void;
}

function RendererEmbeddedSpeedDial(props: RendererEmbeddedSpeedDialProps) {
  const { spinner, onSpinnerChange } = props;

  const { launchQuestionnaire } = useSmartClient();

  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  if (spinner.isSpinning) {
    return null;
  }

  return (
    <SpeedDial
      ariaLabel="Form operations"
      sx={{
        position: 'fixed',
        bottom: 12,
        right: 8,
        '& .MuiFab-primary': { width: 46, height: 46 }
      }}
      icon={<BuildIcon />}
      open={open}
      onClose={handleClose}
      onOpen={handleOpen}>
      {launchQuestionnaire ? (
        <RendererEmbeddedLaunchQuestionnaireActions
          spinner={spinner}
          onClose={handleClose}
          onSpinnerChange={onSpinnerChange}
        />
      ) : (
        <RendererEmbeddedStandardActions
          spinner={spinner}
          onClose={handleClose}
          onSpinnerChange={onSpinnerChange}
        />
      )}
    </SpeedDial>
  );
}

export default RendererEmbeddedSpeedDial;
