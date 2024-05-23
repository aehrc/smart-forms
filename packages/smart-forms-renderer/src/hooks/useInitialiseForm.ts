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
import { buildForm } from '../utils';
import type Client from 'fhirclient/lib/Client';
import { useSmartConfigStore } from '../stores';
import { initialiseFhirClient } from '../utils/manageForm';

/**
 * React hook to initialise a form by:
 * - Calling the buildForm() function to build a form from a questionnaire, an optional QuestionnaireResponse and other optional properties.
 * - Setting a FHIRClient object to make further FHIR calls i.e. answerExpressions.
 *
 * @param questionnaire - Questionnaire to be rendered
 * @param questionnaireResponse - Pre-populated/draft/loaded QuestionnaireResponse to be rendered (optional)
 * @param readOnly - Applies read-only mode to all items in the form view
 * @param terminologyServerUrl - Terminology server url to fetch terminology. If not provided, the default terminology server will be used. (optional)
 * @param additionalVariables - Additional key-value pair of SDC variables `Record<name, variable extension>` for testing (optional)
 * @param fhirClient - FHIRClient object to perform further FHIR calls. At the moment it's only used in answerExpressions (optional)
 *
 * @see buildForm() for more information.
 *
 * @author Sean Fong
 */
function useInitialiseForm(
  questionnaire: Questionnaire,
  questionnaireResponse?: QuestionnaireResponse,
  readOnly?: boolean,
  terminologyServerUrl?: string,
  additionalVariables?: Record<string, object>,
  fhirClient?: Client
): boolean {
  const [isFhirClientReady, setIsFhirClientReady] = useState(true);
  const [isBuilding, setIsBuilding] = useState(true);

  const setSmartClient = useSmartConfigStore.use.setClient();
  const setPatient = useSmartConfigStore.use.setPatient();
  const setUser = useSmartConfigStore.use.setUser();
  const setEncounter = useSmartConfigStore.use.setEncounter();

  useLayoutEffect(() => {
    setIsBuilding(true);
    if (fhirClient) {
      setIsFhirClientReady(true);
      initialiseFhirClient(fhirClient).then(() => {
        setIsFhirClientReady(false);
      });
    }

    // Initialise form including Questionnaire and other optionally provided parameters
    // Includes initialisation for enableWhen, enableWhenExpressions, calculatedExpressions, initialExpressions, answerExpressions, cache answerValueSets
    buildForm(
      questionnaire,
      questionnaireResponse,
      readOnly,
      terminologyServerUrl,
      additionalVariables
    ).then(() => {
      setIsBuilding(false);
    });
  }, [
    questionnaire,
    questionnaireResponse,
    additionalVariables,
    terminologyServerUrl,
    fhirClient,
    readOnly,
    setSmartClient,
    setPatient,
    setUser,
    setEncounter
  ]);

  return isFhirClientReady && isBuilding;
}

export default useInitialiseForm;
