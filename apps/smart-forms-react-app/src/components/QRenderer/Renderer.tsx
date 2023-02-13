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

import React, { useContext, useState } from 'react';
import ProgressSpinner from '../ProgressSpinner';
import { createQuestionnaireResponse } from '../../functions/QrItemFunctions';
import EnableWhenContextProvider from '../../custom-contexts/EnableWhenContext';
import { LaunchContext } from '../../custom-contexts/LaunchContext';
import { QuestionnaireProviderContext, QuestionnaireResponseProviderContext } from '../../App';
import RendererBody from './RendererBody';
import { populateQuestionnaire } from '../../functions/populate-functions/PrepopulateFunctions';

function Renderer() {
  const questionnaireProvider = useContext(QuestionnaireProviderContext);
  const questionnaireResponseProvider = useContext(QuestionnaireResponseProviderContext);
  const launch = useContext(LaunchContext);

  const questionnaire = questionnaireProvider.questionnaire;
  const questionnaireResponse = questionnaireResponseProvider.questionnaireResponse;

  // Fill questionnaireResponse with questionnaire details if questionnaireResponse is in a clean state
  if (questionnaire.item && !questionnaireResponse.item) {
    questionnaireResponseProvider.setQuestionnaireResponse(
      createQuestionnaireResponse(questionnaire.id, questionnaire.item[0])
    );
  }

  const client = launch.fhirClient;
  const patient = launch.patient;
  const user = launch.user;
  const spinnerInitialState =
    client && patient && user && !questionnaireResponse.id
      ? {
          isLoading: true,
          message: 'Populating questionnaire form'
        }
      : { isLoading: false, message: '' };

  const [spinner, setSpinner] = useState(spinnerInitialState);

  // Perform pre-population if all the following requirements are fufilled:
  // 1. App is connected to a CMS
  // 2. Pre-pop queries exist in the form of contained resources or extensions
  // 3. QuestionnaireResponse does not have answer items
  // 4. QuestionnaireResponse is not from a saved draft response
  const qrFormItem = questionnaireResponse.item?.[0].item;
  if (
    client &&
    patient &&
    user &&
    spinner.isLoading &&
    (questionnaire.contained || questionnaire.extension) &&
    (!qrFormItem || qrFormItem.length === 0) &&
    !questionnaireResponse.id
  ) {
    // obtain questionnaireResponse for pre-population
    populateQuestionnaire(
      client,
      questionnaire,
      patient,
      user,
      (qResponse) => {
        questionnaireResponseProvider.setQuestionnaireResponse(qResponse);
        setSpinner({ ...spinner, isLoading: false });
      },
      () => {
        setSpinner({ ...spinner, isLoading: false });
        console.warn('Population failed');
        // TODO popup questionnaire fail to populate
      }
    );
  }

  const RenderPage = () => {
    if (spinner.isLoading) {
      return <ProgressSpinner message={spinner.message} />;
    } else {
      return (
        <EnableWhenContextProvider>
          <RendererBody />
        </EnableWhenContextProvider>
      );
    }
  };

  return <RenderPage />;
}

export default Renderer;
