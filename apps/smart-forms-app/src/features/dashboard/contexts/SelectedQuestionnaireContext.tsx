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
import { createContext, useState } from 'react';
import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';

export interface SelectedQuestionnaireContextType {
  selectedQuestionnaire: Questionnaire | null;
  existingResponses: QuestionnaireResponse[];
  setSelectedQuestionnaire: (selected: Questionnaire | null) => unknown;
  setExistingResponses: (responses: QuestionnaireResponse[]) => unknown;
}

export const SelectedQuestionnaireContext = createContext<SelectedQuestionnaireContextType>({
  selectedQuestionnaire: null,
  existingResponses: [],
  setSelectedQuestionnaire: () => void 0,
  setExistingResponses: () => void 0
});

function SelectedQuestionnaireContextProvider(props: { children: ReactNode }) {
  const { children } = props;

  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<Questionnaire | null>(null);
  const [existingResponses, setExistingResponses] = useState<QuestionnaireResponse[]>([]);

  const selectedQuestionnaireContext: SelectedQuestionnaireContextType = {
    selectedQuestionnaire,
    existingResponses,
    setSelectedQuestionnaire,
    setExistingResponses
  };
  return (
    <SelectedQuestionnaireContext.Provider value={selectedQuestionnaireContext}>
      {children}
    </SelectedQuestionnaireContext.Provider>
  );
}

export default SelectedQuestionnaireContextProvider;
