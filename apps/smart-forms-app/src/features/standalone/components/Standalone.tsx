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

import QTestGridJson from '../data/QTestGrid.json';
import RTestGridJson from '../data/RTestGrid.json';
import AddVarsTestGridJson from '../data/AddVariablesTestGrid.json';
import Q715Json from '../data/Q715.json';
import R715Json from '../data/R715.json';
import QCVDRiskJson from '../data/QCVDRisk.json';
import RCVDRiskJson from '../data/RCVDRisk.json';
import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import {
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  MenuItem,
  Select,
  Stack
} from '@mui/material';
import { useReducer } from 'react';
import type {
  RendererPropsActions,
  RendererPropsState
} from '../interfaces/standalone.interface.ts';
import { SmartFormsRenderer } from '@aehrc/smart-forms-renderer';

const rendererPropsReducer = (state: RendererPropsState, action: RendererPropsActions) => {
  switch (action.type) {
    case 'SET_QUESTIONNAIRE':
      return {
        ...state,
        id: action.payload.id,
        questionnaire: action.payload.questionnaire,
        response: action.payload.response,
        additionalVars: action.payload.additionalVars
      };
    case 'SET_RESPONSE':
      return { ...state, response: action.payload };
    case 'SET_ADDITIONAL_VARS':
      return { ...state, additionalVars: action.payload };
    default:
      return state;
  }
};

const rendererPropsList: RendererPropsState[] = [
  {
    id: 'TestGrid',
    questionnaire: QTestGridJson as Questionnaire,
    response: RTestGridJson as QuestionnaireResponse,
    additionalVars: AddVarsTestGridJson
  },
  {
    id: 'AboriginalTorresStraitIslanderHealthCheck',
    questionnaire: Q715Json as Questionnaire,
    response: R715Json as QuestionnaireResponse,
    additionalVars: null
  },
  {
    id: 'CVDRiskCalculator',
    questionnaire: QCVDRiskJson as Questionnaire,
    response: RCVDRiskJson as QuestionnaireResponse,
    additionalVars: null
  }
];

function Standalone() {
  const [state, dispatch] = useReducer(rendererPropsReducer, {
    id: rendererPropsList[0].id,
    questionnaire: rendererPropsList[0].questionnaire,
    response: rendererPropsList[0].response,
    additionalVars: rendererPropsList[0].additionalVars
  });

  return (
    <Container maxWidth="xl">
      <Stack my={3} rowGap={2}>
        <Stack rowGap={1}>
          <FormControl>
            <FormLabel sx={{ mb: 0.5 }}>Select questionnaire (hardcoded at the moment!)</FormLabel>
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
                  {resource.questionnaire.name ?? resource.id}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {rendererPropsList.map((resource) => {
          if (resource.id !== state.id) {
            return null;
          }

          return (
            <Stack key={resource.id} rowGap={1}>
              <FormControl>
                <FormGroup row>
                  <FormControlLabel
                    disabled
                    required
                    control={<Checkbox defaultChecked />}
                    label="Questionnaire"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={state.response !== null}
                        onChange={() => {
                          dispatch({
                            type: 'SET_RESPONSE',
                            payload: state.response ? null : resource.response
                          });
                        }}
                      />
                    }
                    label="Questionnaire response"
                  />
                  {resource.additionalVars ? (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={state.additionalVars !== null}
                          onChange={() => {
                            dispatch({
                              type: 'SET_ADDITIONAL_VARS',
                              payload: state.additionalVars ? null : resource.additionalVars
                            });
                          }}
                        />
                      }
                      label="Additional variables"
                    />
                  ) : null}
                </FormGroup>
              </FormControl>
              <SmartFormsRenderer
                questionnaire={state.questionnaire}
                questionnaireResponse={state.response ?? undefined}
                additionalVariables={state.additionalVars ?? undefined}
              />
            </Stack>
          );
        })}
      </Stack>
    </Container>
  );
}

export default Standalone;
