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

import { Grid, Stack } from '@mui/material';
import { useReducer, useState } from 'react';
import type {
  RendererPropsActions,
  RendererPropsState
} from '../interfaces/standalone.interface.ts';
import { rendererPropsList } from '../utils/standaloneList.ts';
import StandaloneQuestionnairePicker from './StandaloneQuestionnairePicker.tsx';
import StandalonePropsPicker from './StandalonePropsPicker.tsx';
import StandaloneResourceViewer from './StandaloneResourceViewer.tsx';
import { InitialiseFormWrapperForStorybook } from '@aehrc/smart-forms-renderer';

const rendererPropsReducer = (state: RendererPropsState, action: RendererPropsActions) => {
  switch (action.type) {
    case 'SET_QUESTIONNAIRE':
      return {
        ...state,
        id: action.payload.id,
        questionnaire: action.payload.questionnaire,
        response: action.payload.response,
        additionalVars: action.payload.additionalVars,
        terminologyServerUrl: action.payload.terminologyServerUrl,
        readOnly: action.payload.readOnly
      };
    case 'SET_RESPONSE':
      return { ...state, response: action.payload };
    case 'SET_ADDITIONAL_VARS':
      return { ...state, additionalVars: action.payload };
    case 'SET_TERMINOLOGY_SERVER':
      return { ...state, terminologyServerUrl: action.payload };
    case 'SET_READ_ONLY':
      return { ...state, readOnly: action.payload };
    default:
      return state;
  }
};

function Standalone() {
  const [state, dispatch] = useReducer(rendererPropsReducer, {
    id: rendererPropsList[0].id,
    questionnaire: rendererPropsList[0].questionnaire,
    response: rendererPropsList[0].response,
    additionalVars: rendererPropsList[0].additionalVars,
    terminologyServerUrl: rendererPropsList[0].terminologyServerUrl,
    readOnly: rendererPropsList[0].readOnly
  });
  const [resourcesShown, setResourcesShown] = useState(false);

  return (
    <Grid container>
      <Grid item xs={12} xl={resourcesShown ? 8 : 12}>
        <Stack my={3} rowGap={2}>
          <StandaloneQuestionnairePicker
            rendererPropsState={state}
            rendererPropsDispatch={dispatch}
            rendererPropsList={rendererPropsList}
          />
          {rendererPropsList.map((rendererPropsSingle) => {
            if (rendererPropsSingle.id !== state.id) {
              return null;
            }

            return (
              <Stack key={rendererPropsSingle.id} rowGap={1}>
                <StandalonePropsPicker
                  rendererPropsState={state}
                  rendererPropsDispatch={dispatch}
                  rendererPropsSingle={rendererPropsSingle}
                  resourcesShown={resourcesShown}
                  onShowResources={() => setResourcesShown(!resourcesShown)}
                />
                <InitialiseFormWrapperForStorybook
                  questionnaire={state.questionnaire}
                  questionnaireResponse={state.response ?? undefined}
                  additionalVariables={state.additionalVars ?? undefined}
                  terminologyServerUrl={state.terminologyServerUrl ?? undefined}
                  readOnly={state.readOnly}
                />
              </Stack>
            );
          })}
        </Stack>
      </Grid>
      {resourcesShown ? (
        <>
          <Grid item xs={12} xl={4}>
            <StandaloneResourceViewer rendererPropsState={state} />
          </Grid>
        </>
      ) : null}
    </Grid>
  );
}

export default Standalone;
