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

import { useEffect, useReducer } from 'react';
import { oauth2 } from 'fhirclient';
import {
  getQuestionnaireReferences,
  readCommonLaunchContexts,
  readQuestionnaireContext,
  responseToQuestionnaireResource
} from '../utils/launch.ts';
import { postQuestionnaireToSMARTHealthIT } from '../../../api/saveQr.ts';
import GoToTestLauncher from '../../../components/Snackbar/GoToTestLauncher.tsx';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { StyledRoot } from './Authorisation.styles.tsx';
import type { AuthActions, AuthState } from '../types/authorisation.interface.ts';
import RenderAuthStatus from './RenderAuthStatus.tsx';
import { assembleIfRequired } from '../../../utils/assemble.ts';
import { useQuestionnaireStore, useTerminologyServerStore } from '@aehrc/smart-forms-renderer';
import useAuthRedirectHook from '../hooks/useAuthRedirectHook.ts';
import useSmartClient from '../../../hooks/useSmartClient.ts';
import CloseSnackbar from '../../../components/Snackbar/CloseSnackbar.tsx';
import { TERMINOLOGY_SERVER_URL } from '../../../globals.ts';
import { useExtractOperationStore } from '../../playground/stores/extractOperationStore.ts';
import { fetchTargetStructureMap } from '../../playground/api/extract.ts';

function authReducer(state: AuthState, action: AuthActions): AuthState {
  switch (action.type) {
    case 'UPDATE_HAS_CLIENT':
      return { ...state, hasClient: action.payload };
    case 'UPDATE_HAS_USER':
      return { ...state, hasUser: action.payload };
    case 'UPDATE_HAS_PATIENT':
      return { ...state, hasPatient: action.payload };
    case 'UPDATE_HAS_QUESTIONNAIRE':
      return { ...state, hasQuestionnaire: action.payload };
    case 'FAIL_AUTH':
      return {
        hasClient: false,
        hasQuestionnaire: false,
        hasPatient: false,
        hasUser: false,
        errorMessage: action.payload
      };
    default:
      return state;
  }
}

const initialAuthState: AuthState = {
  hasClient: null,
  hasUser: null,
  hasPatient: null,
  hasQuestionnaire: null,
  errorMessage: null
};

function Authorisation() {
  const [authState, dispatch] = useReducer(authReducer, initialAuthState);

  const { setSmartClient, setCommonLaunchContexts, setQuestionnaireLaunchContext } =
    useSmartClient();

  const buildSourceQuestionnaire = useQuestionnaireStore.use.buildSourceQuestionnaire();

  const setTerminologyServerUrl = useTerminologyServerStore.use.setUrl();
  const resetTerminologyServerUrl = useTerminologyServerStore.use.resetUrl();

  const setTargetStructureMap = useExtractOperationStore.use.setTargetStructureMap();

  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  useEffect(
    () => {
      oauth2
        .ready()
        .then((client) => {
          // Set SMART client
          setSmartClient(client);
          sessionStorage.setItem('authorised', 'true');
          dispatch({ type: 'UPDATE_HAS_CLIENT', payload: true });

          readCommonLaunchContexts(client).then(({ patient, user, encounter }) => {
            dispatch({ type: 'UPDATE_HAS_PATIENT', payload: !!patient });
            dispatch({ type: 'UPDATE_HAS_USER', payload: !!user });

            setCommonLaunchContexts(patient, user, encounter);

            if (!patient || !user) {
              enqueueSnackbar(
                'Fail to fetch patient or user launch context. Try launching the app again',
                {
                  variant: 'error',
                  action: <CloseSnackbar />
                }
              );
            }
          });

          // Set questionnaire launch context if available
          const questionnaireReferences = getQuestionnaireReferences(client);
          if (questionnaireReferences.length > 0) {
            readQuestionnaireContext(client, questionnaireReferences)
              .then((response) => {
                const questionnaire = responseToQuestionnaireResource(response);

                // return early if no matching questionnaire
                if (!questionnaire) {
                  dispatch({ type: 'UPDATE_HAS_QUESTIONNAIRE', payload: false });
                  return;
                }

                // set questionnaire in provider context
                // perform assembly if required
                assembleIfRequired(questionnaire).then(async (questionnaire) => {
                  if (questionnaire) {
                    // Post questionnaire to client if it is SMART Health IT
                    if (
                      client.state.serverUrl.includes('https://launch.smarthealthit.org/v/r4/fhir')
                    ) {
                      questionnaire.id = questionnaire.id + '-SMARTcopy';
                      postQuestionnaireToSMARTHealthIT(client, questionnaire);
                    }

                    // Set terminology server url
                    if (TERMINOLOGY_SERVER_URL) {
                      setTerminologyServerUrl(TERMINOLOGY_SERVER_URL);
                    } else {
                      resetTerminologyServerUrl();
                    }

                    // Set target StructureMap for $extract operation
                    const targetStructureMap = await fetchTargetStructureMap(questionnaire);
                    if (targetStructureMap) {
                      setTargetStructureMap(targetStructureMap);
                    }

                    await buildSourceQuestionnaire(
                      questionnaire,
                      undefined,
                      undefined,
                      TERMINOLOGY_SERVER_URL
                    );
                    setQuestionnaireLaunchContext(questionnaire);
                    dispatch({ type: 'UPDATE_HAS_QUESTIONNAIRE', payload: true });
                  } else {
                    enqueueSnackbar(
                      'An error occurred while fetching initially specified questionnaire',
                      { variant: 'error', action: <CloseSnackbar /> }
                    );
                    dispatch({ type: 'UPDATE_HAS_QUESTIONNAIRE', payload: false });
                  }
                });
              })
              .catch(() => {
                enqueueSnackbar('An error occurred while fetching Questionnaire launch context', {
                  variant: 'error',
                  action: <CloseSnackbar />
                });
                dispatch({ type: 'UPDATE_HAS_QUESTIONNAIRE', payload: false });
              });
          } else {
            dispatch({ type: 'UPDATE_HAS_QUESTIONNAIRE', payload: false });
          }
        })
        .catch((error: Error) => {
          // Prompt user to launch app if app is unlaunched
          // Otherwise app is launched but failed, display error message
          if (
            error.message.includes("No 'state' parameter found") ||
            error.message.includes('No state found')
          ) {
            if (!window.location.pathname.startsWith('/launch')) {
              enqueueSnackbar('Intending to launch from a CMS? Try it out here!', {
                action: <GoToTestLauncher />,
                autoHideDuration: 7500,
                preventDuplicate: true
              });

              const timeoutId = setTimeout(() => {
                navigate('/dashboard/questionnaires');
              }, 300);

              return () => clearTimeout(timeoutId);
            }
          } else {
            console.error(error);
            dispatch({ type: 'FAIL_AUTH', payload: error.message });
            enqueueSnackbar('An error occurred while launching the app', {
              variant: 'error',
              action: <CloseSnackbar />
            });
          }
        });
    },
    // only authenticate once, leave dependency array empty
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Perform redirect if launch authorisation is successful
  useAuthRedirectHook(authState);

  return (
    <StyledRoot>
      <RenderAuthStatus authState={authState} />
    </StyledRoot>
  );
}

export default Authorisation;
