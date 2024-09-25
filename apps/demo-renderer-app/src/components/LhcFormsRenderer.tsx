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

import { useEffect, useState } from 'react';
import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import { loadLForms } from 'lforms-loader';

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace LForms.Util {
  function addFormToPage(
    questionnaire: Questionnaire,
    formId: string,
    options: object
  ): Promise<void>;
  function setFHIRContext(fhirContext: any, fhirContextVars: any): void;
  function getFormFHIRData(
    resourceType: 'QuestionnaireResponse', //
    fhirVersion: string,
    formId: string,
    options?: object
  ): QuestionnaireResponse;
  function convertFHIRQuestionnaireToLForms(questionnaire: Questionnaire, fhirVersion: string): any;
  function mergeFHIRDataIntoLForms(
    resourceType: 'QuestionnaireResponse',
    response: QuestionnaireResponse | undefined,
    lhcQ: any,
    fhirVersion: string
  ): any;
}

declare global {
  interface Window {
    LForms: any;
  }
}

interface LhcFormsRendererProps {
  questionnaire: Questionnaire;
  questionnaireResponse?: QuestionnaireResponse;
}

function LhcFormsRenderer(props: LhcFormsRendererProps) {
  const { questionnaire, questionnaireResponse } = props;

  const [isRendered, setIsRendered] = useState(false);
  const [errors, setErrors] = useState<string | null>(null);

  useEffect(() => {
    loadLForms('36.1.3').then(() => {
      console.log('LForms loaded');

      // Now render the form to the display
      if (window.LForms) {
        const deepCopyQR = structuredClone(questionnaireResponse);
        // Set the context vars
        LForms.Util.setFHIRContext({}, {});
        const lhcQ = LForms.Util.convertFHIRQuestionnaireToLForms(questionnaire, 'R4');
        const lhcQR = LForms.Util.mergeFHIRDataIntoLForms(
          'QuestionnaireResponse',
          deepCopyQR,
          lhcQ,
          'R4'
        );
        LForms.Util.addFormToPage(lhcQR, 'myFormContainer', {
          prepopulate: false
        })
          .then(() => {
            console.log('Form added to page');
            setIsRendered(true);
          })
          .catch((e) => {
            console.error('Error adding form to page:', e);
            setErrors(e.toString());
            setIsRendered(true);
          });
      }
    });
  }, [questionnaire, questionnaireResponse]);

  return (
    <div>
      {!isRendered ? 'Loading...' : null}
      {errors ? (
        <div>
          <h2>Error loading LHC-Forms:</h2>
          <pre>{errors}</pre>
          <div>
            {
              "If you're getting an error and expressions in; working, I haven't figured out how to use expressions yet."
            }
          </div>
        </div>
      ) : null}
      <div id="myFormContainer" />
    </div>
  );
}

export default LhcFormsRenderer;
