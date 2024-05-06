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

import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import { useLayoutEffect, useState } from 'react';
import { initialiseQuestionnaireResponse } from '../utils';
import type Client from 'fhirclient/lib/Client';
import { readEncounter, readPatient, readUser } from '../api/smartClient';
import {
  useQuestionnaireResponseStore,
  useQuestionnaireStore,
  useSmartConfigStore,
  useTerminologyServerStore
} from '../stores';

function useInitialiseRenderer(
  questionnaire: Questionnaire,
  questionnaireResponse?: QuestionnaireResponse,
  additionalVariables?: Record<string, object>,
  terminologyServerUrl?: string,
  fhirClient?: Client,
  readOnly?: boolean
): boolean {
  const buildSourceQuestionnaire = useQuestionnaireStore.use.buildSourceQuestionnaire();
  const updatePopulatedProperties = useQuestionnaireStore.use.updatePopulatedProperties();
  const buildSourceResponse = useQuestionnaireResponseStore.use.buildSourceResponse();
  const setUpdatableResponseAsPopulated =
    useQuestionnaireResponseStore.use.setUpdatableResponseAsPopulated();

  const setTerminologyServerUrl = useTerminologyServerStore.use.setUrl();
  const resetTerminologyServerUrl = useTerminologyServerStore.use.resetUrl();
  const setSmartClient = useSmartConfigStore.use.setClient();
  const setPatient = useSmartConfigStore.use.setPatient();
  const setUser = useSmartConfigStore.use.setUser();
  const setEncounter = useSmartConfigStore.use.setEncounter();

  const [loading, setLoading] = useState(true);

  useLayoutEffect(() => {
    setLoading(true);
    // set fhirClient if provided
    if (fhirClient) {
      setSmartClient(fhirClient);
      readPatient(fhirClient).then((patient) => {
        setPatient(patient);
      });
      readUser(fhirClient).then((user) => {
        setUser(user);
      });
      readEncounter(fhirClient).then((encounter) => {
        setEncounter(encounter);
      });
    }

    // set terminology server url if provided, otherwise reset it back to ontoserver
    if (terminologyServerUrl) {
      setTerminologyServerUrl(terminologyServerUrl);
    } else {
      resetTerminologyServerUrl();
    }

    // initialise form including enableWhen, enableWhenExpressions, calculatedExpressions, initialExpressions, answerExpressions, cache answerValueSets
    buildSourceQuestionnaire(
      questionnaire,
      questionnaireResponse,
      additionalVariables,
      terminologyServerUrl,
      readOnly
    ).then(() => {
      buildSourceResponse(initialiseQuestionnaireResponse(questionnaire));

      if (questionnaireResponse) {
        const updatedResponse = updatePopulatedProperties(questionnaireResponse);
        setUpdatableResponseAsPopulated(updatedResponse);
      }
      setLoading(false);
    });
  }, [
    questionnaire,
    questionnaireResponse,
    buildSourceQuestionnaire,
    buildSourceResponse,
    setUpdatableResponseAsPopulated,
    updatePopulatedProperties,
    additionalVariables,
    fhirClient,
    setSmartClient,
    setPatient,
    setUser,
    setEncounter,
    terminologyServerUrl,
    setTerminologyServerUrl,
    resetTerminologyServerUrl,
    readOnly
  ]);

  return loading;
}

export default useInitialiseRenderer;
