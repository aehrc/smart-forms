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

import { SpeedDial } from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import useSmartClient from '../../../hooks/useSmartClient.ts';
import ViewExistingResponsesAction from './RendererSpeedDial/ViewExistingResponsesAction.tsx';
import BackToQuestionnairesAction from './RendererSpeedDial/BackToQuestionnairesAction.tsx';
import PreviewAction from './RendererSpeedDial/PreviewAction.tsx';
import SaveProgressAction from './RendererSpeedDial/SaveProgressAction.tsx';
import SaveAsFinalAction from './RendererSpeedDial/SaveAsFinalAction.tsx';
import { useQuestionnaireStore } from '@aehrc/smart-forms-renderer';
import RepopulateAction from './RendererNav/Repopulate/RepopulateAction.tsx';
import { RendererSpinner } from '../types/rendererSpinner.ts';

interface RendererEmbeddedSpeedDialProps {
  spinner: RendererSpinner;
  onSpinnerChange: (newSpinner: RendererSpinner) => void;
}

function RendererEmbeddedSpeedDial(props: RendererEmbeddedSpeedDialProps) {
  const { spinner, onSpinnerChange } = props;

  const { smartClient, launchQuestionnaire } = useSmartClient();

  const sourceQuestionnaire = useQuestionnaireStore((state) => state.sourceQuestionnaire);

  const showSaveAndRepopulateActions = smartClient && sourceQuestionnaire.item;

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
      icon={<BuildIcon />}>
      {launchQuestionnaire ? (
        <ViewExistingResponsesAction isSpeedDial={true} />
      ) : (
        <BackToQuestionnairesAction isSpeedDial={true} />
      )}
      <PreviewAction isSpeedDial={true} />

      {showSaveAndRepopulateActions ? <SaveProgressAction isSpeedDial={true} /> : null}
      {showSaveAndRepopulateActions ? <SaveAsFinalAction isSpeedDial={true} /> : null}
      {showSaveAndRepopulateActions ? (
        <RepopulateAction spinner={spinner} onSpinnerChange={onSpinnerChange} isSpeedDial={true} />
      ) : null}
    </SpeedDial>
  );
}

export default RendererEmbeddedSpeedDial;
