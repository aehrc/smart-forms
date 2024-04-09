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

import { SmartFormsRenderer } from '@aehrc/smart-forms-renderer';
import type { Patient, Practitioner, Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import LaunchContextPicker from './LaunchContextPicker.tsx';
import { useState } from 'react';
import LaunchContextDetails from './LaunchContextDetails.tsx';
import PrePopButton from './PrePopButton.tsx';
import LaunchButton from './LaunchButton.tsx';

interface RendererPageProps {
  questionnaire: Questionnaire;
  bearerToken: string | null;
}

function Renderer(props: RendererPageProps) {
  const { questionnaire, bearerToken } = props;

  const [questionnaireResponse, setQuestionnaireResponse] = useState<QuestionnaireResponse | null>(
    null
  );
  const [patient, setPatient] = useState<Patient | null>(null);
  const [practitioner, setPractitioner] = useState<Practitioner | null>(null);

  return (
    <>
      <div style={{ fontSize: '0.875em' }}>
        Bearer Token: {bearerToken ?? 'null'}
        <LaunchButton />
      </div>
      <hr />
      <LaunchContextPicker
        patient={patient}
        practitioner={practitioner}
        bearerToken={bearerToken}
        onPatientChange={(newPatient) => setPatient(newPatient)}
        onPractitionerChange={(newPractitioner) => setPractitioner(newPractitioner)}
      />
      <LaunchContextDetails patient={patient} practitioner={practitioner} />
      <PrePopButton
        questionnaire={questionnaire}
        patient={patient}
        practitioner={practitioner}
        bearerToken={bearerToken}
        onQuestionnaireResponseChange={(newQuestionnaireResponse) =>
          setQuestionnaireResponse(newQuestionnaireResponse)
        }
      />

      <div className="margin-y">
        <SmartFormsRenderer
          questionnaire={questionnaire}
          questionnaireResponse={questionnaireResponse ?? undefined}
        />
      </div>
    </>
  );
}

export default Renderer;
