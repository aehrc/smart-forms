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

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Typography
} from '@mui/material';
import { useContext, useEffect, useReducer, useState } from 'react';
import { oauth2 } from 'fhirclient';
import {
  getEncounter,
  getPatient,
  getQuestionnaireContext,
  getQuestionnaireReference,
  getUser
} from '../../functions/LaunchFunctions';
import { assembleIfRequired } from '../../functions/LoadServerResourceFunctions';
import { postQuestionnaireToSMARTHealthIT } from '../../functions/SaveQrFunctions';
import GoToTestLauncher from '../SnackbarActions/GoToTestLauncher';
import { LaunchContext } from '../../custom-contexts/LaunchContext';
import { QuestionnaireProviderContext } from '../../App';
import { useSnackbar } from 'notistack';
import { SourceContext } from '../../custom-contexts/SourceContext';
import { useNavigate } from 'react-router-dom';
import ProgressSpinner from '../Misc/ProgressSpinner';
import { StyledRoot } from './Authorisation.styles';
import ErrorIcon from '@mui/icons-material/Error';
import Iconify from '../Misc/Iconify';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface AuthState {
  hasClient: boolean | null;
  hasUser: boolean | null;
  hasPatient: boolean | null;
  hasQuestionnaire: boolean | null;
  errorMessage: string | null;
}

type AuthActions =
  | { type: 'UPDATE_HAS_CLIENT'; payload: boolean }
  | { type: 'UPDATE_HAS_USER'; payload: boolean }
  | { type: 'UPDATE_HAS_PATIENT'; payload: boolean }
  | { type: 'UPDATE_HAS_QUESTIONNAIRE'; payload: boolean }
  | { type: 'FAIL_AUTH'; payload: string };

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
  const { setFhirClient, setPatient, setUser, setEncounter } = useContext(LaunchContext);
  const { setSource } = useContext(SourceContext);
  const questionnaireProvider = useContext(QuestionnaireProviderContext);

  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  useEffect(
    () => {
      oauth2
        .ready()
        .then((client) => {
          setFhirClient(client);
          setSource('remote');
          sessionStorage.setItem('authorised', 'true');
          dispatch({ type: 'UPDATE_HAS_CLIENT', payload: true });

          getPatient(client)
            .then((patient) => {
              setPatient(patient);
              dispatch({ type: 'UPDATE_HAS_PATIENT', payload: true });
            })
            .catch((error) => {
              console.error(error);
              dispatch({ type: 'UPDATE_HAS_PATIENT', payload: false });
              enqueueSnackbar('Fail to fetch patient. Try launching the app again', {
                variant: 'error'
              });
            });

          getUser(client)
            .then((user) => {
              setUser(user);
              dispatch({ type: 'UPDATE_HAS_USER', payload: true });
            })
            .catch((error) => {
              console.error(error);
              dispatch({ type: 'UPDATE_HAS_USER', payload: false });
              enqueueSnackbar('Fail to fetch user. Try launching the app again', {
                variant: 'error'
              });
            });

          getEncounter(client)
            .then((encounter) => {
              setEncounter(encounter);
            })
            .catch((error) => {
              console.error(error);
            });

          const questionnaireReference = getQuestionnaireReference(client);

          if (questionnaireReference) {
            getQuestionnaireContext(questionnaireReference)
              .then((resource) => {
                const questionnaire = resource.resourceType === 'Questionnaire' ? resource : null;

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
                    if (client.state.serverUrl.includes('/v/r4/fhir')) {
                      questionnaire.id = questionnaire.id + '-SMARTcopy';
                      postQuestionnaireToSMARTHealthIT(client, questionnaire);
                    }

                    await questionnaireProvider.setQuestionnaire(questionnaire);
                    dispatch({ type: 'UPDATE_HAS_QUESTIONNAIRE', payload: true });
                  } else {
                    enqueueSnackbar(
                      'An error occurred while fetching initially specified questionnaire',
                      { variant: 'error' }
                    );
                    dispatch({ type: 'UPDATE_HAS_QUESTIONNAIRE', payload: false });
                  }
                });
              })
              .catch(() => {
                enqueueSnackbar('An error occurred while fetching Questionnaire launch context', {
                  variant: 'error'
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

              const timeout = setTimeout(() => {
                navigate('/dashboard/questionnaires');
              }, 300);

              return () => clearTimeout(timeout);
            }
          } else {
            console.error(error);
            dispatch({ type: 'FAIL_AUTH', payload: error.message });
            enqueueSnackbar('An error occurred while launching the app', { variant: 'error' });
          }
        });
    },
    // only authenticate once, leave dependency array empty
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Perform redirect if launch authorisation is successful
  useEffect(() => {
    if (
      state.hasClient &&
      state.hasUser &&
      state.hasPatient &&
      typeof state.hasQuestionnaire === 'boolean'
    ) {
      if (state.hasQuestionnaire) {
        navigate('/renderer');
      } else {
        navigate('/dashboard/questionnaires');
      }
    }
  }, [navigate, state]);

  function RenderAuthStatus() {
    const [isExpanded, setIsExpanded] = useState(false);

    if (state.hasClient === false || state.hasUser === false || state.hasPatient === false) {
      return (
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <ErrorIcon color="error" sx={{ fontSize: 80 }} />
          <Box textAlign="center">
            <Typography variant="subtitle1">Launch failed.</Typography>
          </Box>

          {state.errorMessage ? (
            <Accordion expanded={isExpanded} onChange={(_, expanded) => setIsExpanded(expanded)}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight={600}>Error details:</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>{state.errorMessage}</Typography>
              </AccordionDetails>
            </Accordion>
          ) : null}

          <Box display="flex" flexDirection="row-reverse" width="100%">
            <Button
              variant="contained"
              endIcon={<Iconify icon="material-symbols:arrow-forward" />}
              data-test="button-create-response"
              onClick={() => {
                navigate('/dashboard/questionnaires');
              }}>
              Proceed to app anyway
            </Button>
          </Box>
        </Box>
      );
    }

    return <ProgressSpinner message={'Getting ready'} />;
  }

  return (
    <StyledRoot>
      <RenderAuthStatus />
    </StyledRoot>
  );
}

export default Authorisation;
