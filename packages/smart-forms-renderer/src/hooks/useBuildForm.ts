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

import { useLayoutEffect, useState } from 'react';
import { buildForm } from '../utils';
import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';

/**
 * React hook wrapping around the buildForm() function to build a form from a questionnaire and an optional QuestionnaireResponse.
 * @see buildForm() for more information.
 *
 * @param questionnaire - Questionnaire to be rendered
 * @param questionnaireResponse - Pre-populated/draft/loaded QuestionnaireResponse to be rendered (optional)
 * @param readOnly - Applies read-only mode to all items in the form view
 * @param terminologyServerUrl - Terminology server url to fetch terminology. If not provided, the default terminology server will be used. (optional)
 * @param additionalVariables - Additional key-value pair of SDC variables `Record<name, variable extension>` for testing (optional)
 *
 * @author Sean Fong
 */
function useBuildForm(
  questionnaire: Questionnaire,
  questionnaireResponse?: QuestionnaireResponse,
  readOnly?: boolean,
  terminologyServerUrl?: string,
  additionalVariables?: Record<string, object>
) {
  const [isBuilding, setIsBuilding] = useState(true);

  useLayoutEffect(() => {
    buildForm(
      questionnaire,
      questionnaireResponse,
      readOnly,
      terminologyServerUrl,
      additionalVariables
    ).then(() => {
      setIsBuilding(false);
    });
  }, [additionalVariables, questionnaire, questionnaireResponse, readOnly, terminologyServerUrl]);

  return isBuilding;
}

export default useBuildForm;
