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

import React, { useState } from 'react';
import type { SelectedQuestionnaire } from '../interfaces/Interfaces';
import type { QuestionnaireResponse } from 'fhir/r4';

export interface SelectedQuestionnaireContextType {
  selectedQuestionnaire: SelectedQuestionnaire | null;
  existingResponses: QuestionnaireResponse[];
  setSelectedQuestionnaire: (selected: SelectedQuestionnaire | null) => unknown;
  setExistingResponses: (responses: QuestionnaireResponse[]) => unknown;
  clearSelectedQuestionnaire: () => unknown;
}

export const SelectedQuestionnaireContext = React.createContext<SelectedQuestionnaireContextType>({
  selectedQuestionnaire: null,
  existingResponses: [],
  setSelectedQuestionnaire: () => void 0,
  setExistingResponses: () => void 0,
  clearSelectedQuestionnaire: () => void 0
});

function SelectedQuestionnaireContextProvider(props: { children: React.ReactNode }) {
  const { children } = props;

  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<SelectedQuestionnaire | null>(
    null
  );
  const [existingResponses, setExistingResponses] = useState<QuestionnaireResponse[]>([]);

  const selectedQuestionnaireContext: SelectedQuestionnaireContextType = {
    selectedQuestionnaire,
    existingResponses,
    setSelectedQuestionnaire,
    setExistingResponses,
    clearSelectedQuestionnaire: () => {
      setSelectedQuestionnaire(null);
      setExistingResponses([]);
    }
  };
  return (
    <SelectedQuestionnaireContext.Provider value={selectedQuestionnaireContext}>
      {children}
    </SelectedQuestionnaireContext.Provider>
  );
}

export default SelectedQuestionnaireContextProvider;
