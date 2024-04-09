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
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  ToggleButton,
  Tooltip
} from '@mui/material';
import type {
  RendererPropsActions,
  RendererPropsState
} from '../interfaces/standalone.interface.ts';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';

interface StandalonePropsPickerProps {
  rendererPropsState: RendererPropsState;
  rendererPropsDispatch: Dispatch<RendererPropsActions>;
  rendererPropsSingle: RendererPropsState;
  resourcesShown: boolean;
  onShowResources: () => void;
}

function StandalonePropsPicker(props: StandalonePropsPickerProps) {
  const {
    rendererPropsState: state,
    rendererPropsDispatch: dispatch,
    rendererPropsSingle,
    resourcesShown,
    onShowResources
  } = props;

  return (
    <Box display="flex" justifyContent="space-between" mx={2}>
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
                    payload: state.response ? null : rendererPropsSingle.response
                  });
                }}
              />
            }
            label="Questionnaire response"
          />
          {rendererPropsSingle.additionalVars ? (
            <FormControlLabel
              control={
                <Checkbox
                  checked={state.additionalVars !== null}
                  onChange={() => {
                    dispatch({
                      type: 'SET_ADDITIONAL_VARS',
                      payload: state.additionalVars ? null : rendererPropsSingle.additionalVars
                    });
                  }}
                />
              }
              label="Additional variables"
            />
          ) : null}

          {rendererPropsSingle.terminologyServerUrl ? (
            <FormControlLabel
              control={
                <Checkbox
                  checked={state.terminologyServerUrl !== null}
                  onChange={() => {
                    dispatch({
                      type: 'SET_TERMINOLOGY_SERVER',
                      payload: state.terminologyServerUrl
                        ? null
                        : rendererPropsSingle.terminologyServerUrl
                    });
                  }}
                />
              }
              label="Terminology server url"
            />
          ) : null}
        </FormGroup>
      </FormControl>
      <Box display="flex" alignItems="center" columnGap={1}>
        <Tooltip title="Show resource definitions">
          <span>
            <ToggleButton
              value="check"
              size="small"
              selected={resourcesShown}
              onChange={() => {
                onShowResources();
              }}>
              <MenuOpenIcon />
            </ToggleButton>
          </span>
        </Tooltip>
      </Box>
    </Box>
  );
}

export default StandalonePropsPicker;
