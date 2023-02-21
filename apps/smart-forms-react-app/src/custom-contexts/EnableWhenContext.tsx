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
import { EnableWhenItems } from '../interfaces/Interfaces';
import { EnableWhenContextType } from '../interfaces/ContextTypes';
import { QuestionnaireResponseItem, QuestionnaireResponseItemAnswer } from 'fhir/r5';
import {
  createLinkedQuestionsMap,
  readInitialAnswers,
  setInitialAnswers,
  updateItemAnswer
} from '../functions/EnableWhenFunctions';

export const EnableWhenContext = React.createContext<EnableWhenContextType>({
  items: {},
  linkMap: {},
  isActivated: true,
  setItems: () => void 0,
  updateItem: () => void 0,
  toggleActivation: () => void 0
});

function EnableWhenContextProvider(props: { children: React.ReactNode }) {
  const { children } = props;

  const [isActivated, toggleActivation] = useState<boolean>(true);
  const [enableWhenItems, setEnableWhenItems] = useState<EnableWhenItems>({});
  const [linkedQuestionsMap, setLinkedQuestionsMap] = useState<Record<string, string[]>>({});

  const enableWhenContext: EnableWhenContextType = {
    items: enableWhenItems,
    linkMap: linkedQuestionsMap,
    isActivated: isActivated,
    setItems: (items: EnableWhenItems, qrForm: QuestionnaireResponseItem) => {
      const linkedQuestionsMap = createLinkedQuestionsMap(items);
      const initialAnswers = readInitialAnswers(qrForm, linkedQuestionsMap);

      const updatedItems =
        Object.keys(initialAnswers).length > 0
          ? setInitialAnswers(initialAnswers, items, linkedQuestionsMap)
          : items;

      setLinkedQuestionsMap(linkedQuestionsMap);
      setEnableWhenItems(updatedItems);
    },
    updateItem: (linkId: string, newAnswer: QuestionnaireResponseItemAnswer[]) => {
      if (!linkedQuestionsMap[linkId]) return;

      const linkedQuestions = linkedQuestionsMap[linkId];
      const updatedItems = updateItemAnswer(
        { ...enableWhenItems },
        linkedQuestions,
        linkId,
        newAnswer
      );
      setEnableWhenItems(updatedItems);
    },
    toggleActivation: (isToggled) => toggleActivation(isToggled)
  };

  return (
    <EnableWhenContext.Provider value={enableWhenContext}>{children}</EnableWhenContext.Provider>
  );
}

export default EnableWhenContextProvider;
