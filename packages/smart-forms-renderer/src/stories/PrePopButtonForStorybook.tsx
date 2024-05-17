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

// @ts-ignore
import React, { useState } from 'react';
import { populateQuestionnaire } from './populateUtilsForStorybook';
import type { Patient, Practitioner, Questionnaire } from 'fhir/r4';
import type Client from 'fhirclient/lib/Client';
import { useQuestionnaireResponseStore, useQuestionnaireStore } from '../../lib';

interface PrePopButtonProps {
  questionnaire: Questionnaire;
  fhirClient: Client;
  patient: Patient;
  user: Practitioner;
}

function PrePopButtonForStorybook(props: PrePopButtonProps) {
  const { questionnaire, fhirClient, patient, user } = props;

  const [isPopulating, setIsPopulating] = useState(false);

  const updatePopulatedProperties = useQuestionnaireStore.use.updatePopulatedProperties();

  const setUpdatableResponseAsPopulated =
    useQuestionnaireResponseStore.use.setUpdatableResponseAsPopulated();

  async function handlePrepopulate() {
    setIsPopulating(true);

    const { populateSuccess, populateResult } = await populateQuestionnaire(
      questionnaire,
      patient,
      user,
      {
        clientEndpoint: fhirClient.state.serverUrl,
        authToken: null
      }
    );
    console.log(populateSuccess);

    if (!populateSuccess || !populateResult) {
      setIsPopulating(false);
      return;
    }

    const { populated } = populateResult;
    const updatedResponse = updatePopulatedProperties(populated);
    setUpdatableResponseAsPopulated(updatedResponse);
    setIsPopulating(false);
  }

  return (
    <>
      <button
        className="increase-button-hitbox"
        onClick={handlePrepopulate}
        disabled={isPopulating}>
        Pre-populate!
      </button>
      {isPopulating ? <span style={{ marginLeft: '1em' }}>Pre-populating...</span> : null}
    </>
  );
}

export default PrePopButtonForStorybook;
