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

import React, { useContext } from 'react';
import { FormControlLabel, Switch } from '@mui/material';
import { DebugBarContainerBox } from './DebugBar.styles';
import { LaunchContext } from '../../custom-contexts/LaunchContext';

type Props = {
  questionnaireIsSearching: boolean;
  questionnaireSourceIsLocal: boolean;
  toggleQuestionnaireSource: () => unknown;
};

function PickerDebugBar(props: Props) {
  const { questionnaireIsSearching, questionnaireSourceIsLocal, toggleQuestionnaireSource } = props;

  const launch = useContext(LaunchContext);
  return (
    <DebugBarContainerBox>
      <FormControlLabel
        control={
          <Switch
            disabled={questionnaireIsSearching || launch.fhirClient === null}
            checked={questionnaireSourceIsLocal}
            onChange={() => toggleQuestionnaireSource()}
          />
        }
        label={questionnaireSourceIsLocal ? 'Local' : 'Remote'}
      />
    </DebugBarContainerBox>
  );
}

export default PickerDebugBar;
