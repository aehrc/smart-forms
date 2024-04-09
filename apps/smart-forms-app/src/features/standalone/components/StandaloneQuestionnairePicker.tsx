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

import type { Dispatch } from 'react';
import { FormControl, FormLabel, MenuItem, Select, Stack } from '@mui/material';
import type {
  RendererPropsActions,
  RendererPropsState
} from '../interfaces/standalone.interface.ts';

interface StandaloneQuestionnairePickerProps {
  rendererPropsState: RendererPropsState;
  rendererPropsDispatch: Dispatch<RendererPropsActions>;
  rendererPropsList: RendererPropsState[];
}

function StandaloneQuestionnairePicker(props: StandaloneQuestionnairePickerProps) {
  const { rendererPropsState: state, rendererPropsDispatch: dispatch, rendererPropsList } = props;

  return (
    <Stack rowGap={1} mx={2}>
      <FormControl>
        <FormLabel sx={{ mb: 0.5 }}>
          Select questionnaire (Everything here is hardcoded at the moment!)
        </FormLabel>
        <Select
          value={state.id}
          onChange={(e) => {
            const id = e.target.value;
            const rendererProps = rendererPropsList.find((resource) => resource.id === id);

            if (rendererProps) {
              dispatch({
                type: 'SET_QUESTIONNAIRE',
                payload: rendererProps
              });
            }
          }}>
          {rendererPropsList.map((resource) => (
            <MenuItem key={resource.id} value={resource.id}>
              {resource.questionnaire.title ?? resource.id}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
}

export default StandaloneQuestionnairePicker;
