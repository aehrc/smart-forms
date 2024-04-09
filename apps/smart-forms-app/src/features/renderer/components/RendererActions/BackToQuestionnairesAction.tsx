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

import type { SpeedDialActionProps } from '@mui/material';
import { SpeedDialAction } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import RendererOperationItem from '../RendererNav/RendererOperationItem.tsx';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface BackToQuestionnairesActionProps extends SpeedDialActionProps {
  isSpeedDial?: boolean;
}

function BackToQuestionnairesAction(props: BackToQuestionnairesActionProps) {
  const { isSpeedDial, ...speedDialActionProps } = props;

  const { closeSnackbar } = useSnackbar();

  const navigate = useNavigate();

  function handleBackToQuestionnaires() {
    closeSnackbar();
    navigate('/dashboard/questionnaires');
  }

  if (isSpeedDial) {
    return (
      <SpeedDialAction
        icon={<ArrowBackIcon />}
        tooltipTitle="Back to Questionnaires"
        tooltipOpen
        onClick={handleBackToQuestionnaires}
        {...speedDialActionProps}
      />
    );
  }

  return (
    <RendererOperationItem
      title="Back to Questionnaires"
      icon={<ArrowBackIcon />}
      onClick={handleBackToQuestionnaires}
    />
  );
}

export default BackToQuestionnairesAction;
