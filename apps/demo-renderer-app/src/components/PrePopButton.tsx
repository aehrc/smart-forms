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

import '../styles.css';
import { populateQuestionnaire } from '../utils/populate.ts';
import type { Patient, Practitioner, Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import { useState } from 'react';
import { ISS } from '../utils/apiConstants.ts';

interface PrePopButtonProps {
  questionnaire: Questionnaire;
  patient: Patient | null;
  practitioner: Practitioner | null;
  bearerToken: string | null;
  onQuestionnaireResponseChange: (newQuestionnaireResponse: QuestionnaireResponse | null) => void;
}

function PrePopButton(props: PrePopButtonProps) {
  const { questionnaire, patient, practitioner, bearerToken, onQuestionnaireResponseChange } =
    props;

  const [isPopulating, setIsPopulating] = useState(false);

  async function handlePrepopulate() {
    if (!patient || !practitioner) {
      return;
    }
    setIsPopulating(true);

    const { populateResult } = await populateQuestionnaire(questionnaire, patient, practitioner, {
      clientEndpoint: ISS,
      authToken: bearerToken
    });

    if (populateResult) {
      onQuestionnaireResponseChange(populateResult?.populated);
    }
    setIsPopulating(false);
  }

  if (!patient || !practitioner) {
    return <button disabled>Pre-populate!</button>;
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

export default PrePopButton;
