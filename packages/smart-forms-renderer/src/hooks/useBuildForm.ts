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

import type { ComponentType } from 'react';
import { useLayoutEffect, useState } from 'react';
import { buildForm } from '../utils';
import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import type { RendererStyling } from '../stores/rendererStylingStore';
import { useRendererStylingStore } from '../stores/rendererStylingStore';
import type { QItemOverrideComponentProps, SdcUiOverrideComponentProps } from '../interfaces';

/**
 * React hook wrapping around the buildForm() function to build a form from a questionnaire and an optional QuestionnaireResponse.
 * @see buildForm() for more information.
 *
 * @param questionnaire - Questionnaire to be rendered
 * @param questionnaireResponse - Pre-populated/draft/loaded QuestionnaireResponse to be rendered (optional)
 * @param readOnly - Applies read-only mode to all items in the form view
 * @param terminologyServerUrl - Terminology server url to fetch terminology. If not provided, the default terminology server will be used. (optional)
 * @param additionalVariables - Additional key-value pair of SDC variables + values to be fed into the renderer's FhirPathContext `Record<name, value>` (likely coming from a pre-population module) e.g. `{ 'ObsBodyHeight': <Bundle of height observations> } }`.
 * @param rendererStylingOptions - Renderer styling to be applied to the form. See docs for styling options. (optional)
 * @param qItemOverrideComponents - Key-value pair of React component overrides for Questionnaire Items via linkId `Record<linkId, React component>`
 * @param sdcUiOverrideComponents - Key-value pair of React component overrides for SDC UI Controls https://hl7.org/fhir/extensions/ValueSet-questionnaire-item-control.html `Record<SDC UI code, React component>`
 *
 *
 * @author Sean Fong
 */
function useBuildForm(
  questionnaire: Questionnaire,
  questionnaireResponse?: QuestionnaireResponse,
  readOnly?: boolean,
  terminologyServerUrl?: string,
  additionalVariables?: Record<string, any>,
  rendererStylingOptions?: RendererStyling,
  qItemOverrideComponents?: Record<string, ComponentType<QItemOverrideComponentProps>>,
  sdcUiOverrideComponents?: Record<string, ComponentType<SdcUiOverrideComponentProps>>
) {
  const [isBuilding, setIsBuilding] = useState(true);

  const setRendererStyling = useRendererStylingStore.use.setRendererStyling();

  useLayoutEffect(() => {
    // Set optional renderer styling
    if (rendererStylingOptions) {
      setRendererStyling(rendererStylingOptions);
    }

    buildForm(
      questionnaire,
      questionnaireResponse,
      readOnly,
      terminologyServerUrl,
      additionalVariables,
      qItemOverrideComponents,
      sdcUiOverrideComponents
    )
      .then(() => {
        setIsBuilding(false);
      })
      .catch(() => {
        // Do nothing - leave isBuilding as true to indicate the operation failed
      });
  }, [
    questionnaire,
    questionnaireResponse,
    readOnly,
    terminologyServerUrl,
    additionalVariables,
    rendererStylingOptions,
    qItemOverrideComponents,
    sdcUiOverrideComponents,
    setRendererStyling
  ]);

  return isBuilding;
}

export default useBuildForm;
