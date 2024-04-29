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

import BackToQuestionnairesAction from '../RendererActions/BackToQuestionnairesAction.tsx';
import PreviewAction from '../RendererActions/PreviewAction.tsx';
import SaveProgressAction from '../RendererActions/SaveProgressAction.tsx';
import SaveAsFinalAction from '../RendererActions/SaveAsFinalAction.tsx';
import RepopulateAction from '../RendererActions/RepopulateAction.tsx';
import useSmartClient from '../../../../hooks/useSmartClient.ts';
import { useQuestionnaireStore } from '@aehrc/smart-forms-renderer';
import type { SpeedDialActionProps } from '@mui/material';
import type { RendererSpinner } from '../../types/rendererSpinner.ts';

interface RendererEmbeddedStandardActionsProps extends SpeedDialActionProps {
  spinner: RendererSpinner;
  onSpinnerChange: (newSpinner: RendererSpinner) => void;
  onClose: () => void;
}

function RendererEmbeddedStandardActions(props: RendererEmbeddedStandardActionsProps) {
  const { spinner, onSpinnerChange, onClose, ...speedDialActionProps } = props;

  const { smartClient } = useSmartClient();

  const sourceQuestionnaire = useQuestionnaireStore.use.sourceQuestionnaire();

  const showSaveAndRepopulateActions = smartClient && sourceQuestionnaire.item;

  if (showSaveAndRepopulateActions) {
    return (
      <>
        <BackToQuestionnairesAction isSpeedDial={true} {...speedDialActionProps} />
        <PreviewAction isSpeedDial={true} {...speedDialActionProps} />
        <SaveProgressAction isSpeedDial={true} onClose={onClose} {...speedDialActionProps} />
        <SaveAsFinalAction isSpeedDial={true} onClose={onClose} {...speedDialActionProps} />
        <RepopulateAction
          spinner={spinner}
          onSpinnerChange={onSpinnerChange}
          isSpeedDial={true}
          {...speedDialActionProps}
        />
      </>
    );
  }

  return (
    <>
      <BackToQuestionnairesAction isSpeedDial={true} {...speedDialActionProps} />
      <PreviewAction isSpeedDial={true} {...speedDialActionProps} />
    </>
  );
}

export default RendererEmbeddedStandardActions;
