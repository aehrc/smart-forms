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

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import { TERMINOLOGY_SERVER_URL } from '../../globals.ts';
import { buildFormWrapper } from '../../utils/manageForm.ts';

interface BaseRendererWrapperProps {
  children: ReactNode;
  questionnaire: Questionnaire;
  questionnaireResponse?: QuestionnaireResponse;
}

function BaseRendererWrapper(props: BaseRendererWrapperProps) {
  const { children, questionnaire, questionnaireResponse } = props;

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    buildFormWrapper(questionnaire, questionnaireResponse, undefined, TERMINOLOGY_SERVER_URL).then(
      () => {
        setLoading(false);
      }
    );
  }, [questionnaire, questionnaireResponse]);

  if (loading) {
    return <div>Loading questionnaire...</div>;
  }

  return <div>{children}</div>;
}

export default BaseRendererWrapper;
