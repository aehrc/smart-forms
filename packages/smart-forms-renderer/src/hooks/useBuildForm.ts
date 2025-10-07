/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
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
import { useRendererStylingStore } from '../stores/rendererStylingStore';
import type { BuildFormParams } from '../utils/manageForm';

/**
 * React hook wrapping around {@link buildForm} to build a form from a Questionnaire and an optional filled QuestionnaireResponse.
 * If a QuestionnaireResponse is not provided, an empty QuestionnaireResponse is set as the initial QuestionnaireResponse.
 *
 * The build process also supports:
 * - Applying readOnly mode to all items in the form view
 * - Providing a default terminology server URL (fallbacks to a public Ontoserver instance if not provided)
 * - Passing additional SDC variables into the FhirPathContext (e.g. for pre-population purposes)
 * - Adjusting renderer styling and behaviour via `rendererStylingStore`
 * - Overriding QuestionnaireItem rendering via `qItemOverrideComponents`
 * - Overriding SDC UI controls via `sdcUiOverrideComponents`
 *
 * @param params - {@link BuildFormParams} containing the configuration for building the form
 * @returns Hook result for form building lifecycle
 *
 * @author Sean Fong
 */
function useBuildForm(params: BuildFormParams) {
  const {
    questionnaire,
    questionnaireResponse,
    readOnly,
    terminologyServerUrl,
    additionalVariables,
    rendererConfigOptions,
    qItemOverrideComponents,
    sdcUiOverrideComponents
  } = params;

  const [isBuilding, setIsBuilding] = useState(true);

  const setRendererStyling = useRendererStylingStore.use.setRendererStyling();

  useLayoutEffect(() => {
    buildForm({
      questionnaire,
      questionnaireResponse,
      readOnly,
      terminologyServerUrl,
      additionalVariables,
      rendererConfigOptions,
      qItemOverrideComponents,
      sdcUiOverrideComponents
    })
      .then(() => {
        setIsBuilding(false);
      })
      .catch((e) => {
        setIsBuilding(false);
        console.error('buildForm(): Failed to build form', e);
      });
  }, [
    questionnaire,
    questionnaireResponse,
    readOnly,
    terminologyServerUrl,
    additionalVariables,
    rendererConfigOptions,
    qItemOverrideComponents,
    sdcUiOverrideComponents,
    setRendererStyling
  ]);

  return isBuilding;
}

export default useBuildForm;
