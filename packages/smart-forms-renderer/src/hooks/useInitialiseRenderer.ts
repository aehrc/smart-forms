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

import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import { useLayoutEffect, useState } from 'react';
import { createQuestionnaireResponse } from '../utils/qrItem';
import useQuestionnaireStore from '../stores/useQuestionnaireStore';
import useQuestionnaireResponseStore from '../stores/useQuestionnaireResponseStore';
import type Client from 'fhirclient/lib/Client';
import useSmartConfigStore from '../stores/useSmartConfigStore';
import { readEncounter, readPatient, readUser } from '../api/smartClient';

function useInitialiseRenderer(
  questionnaire: Questionnaire,
  questionnaireResponse?: QuestionnaireResponse,
  additionalVariables?: Record<string, object>,
  fhirClient?: Client
): boolean {
  const buildSourceQuestionnaire = useQuestionnaireStore((state) => state.buildSourceQuestionnaire);
  const updatePopulatedProperties = useQuestionnaireStore(
    (state) => state.updatePopulatedProperties
  );
  const buildSourceResponse = useQuestionnaireResponseStore((state) => state.buildSourceResponse);
  const setUpdatableResponseAsPopulated = useQuestionnaireResponseStore(
    (state) => state.setUpdatableResponseAsPopulated
  );

  const setSmartClient = useSmartConfigStore((state) => state.setClient);
  const setPatient = useSmartConfigStore((state) => state.setPatient);
  const setUser = useSmartConfigStore((state) => state.setUser);
  const setEncounter = useSmartConfigStore((state) => state.setEncounter);

  const [loading, setLoading] = useState(true);

  useLayoutEffect(() => {
    setLoading(true);
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

    buildSourceQuestionnaire(questionnaire, questionnaireResponse, additionalVariables).then(() => {
      buildSourceResponse(createQuestionnaireResponse(questionnaire));

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
    setEncounter
  ]);

  return loading;
}

export default useInitialiseRenderer;
