import * as React from 'react';
import { EnableWhenContextType, EnableWhenItems } from '../interfaces/Interfaces';
import { QuestionnaireResponseItem, QuestionnaireResponseItemAnswer } from 'fhir/r5';
import {
  createLinkedQuestionsMap,
  isEnabledAnswerTypeSwitcher,
  readInitialAnswers,
  setInitialAnswers,
  updateItemAnswer
} from '../functions/EnableWhenFunctions';

export const EnableWhenContext = React.createContext<EnableWhenContextType>({
  items: {},
  linkMap: {},
  setItems: () => void 0,
  updateItem: () => void 0,
  checkItemIsEnabled: () => true
});

function EnableWhenProvider(props: { children: any }) {
  const { children } = props;
  const [enableWhenItems, setEnableWhenItems] = React.useState<EnableWhenItems>({});
  const [linkedQuestionsMap, setLinkedQuestionsMap] = React.useState<Record<string, string[]>>({});

  const enableWhenContext: EnableWhenContextType = {
    items: enableWhenItems,
    linkMap: linkedQuestionsMap,
    setItems: (items: EnableWhenItems, qrForm: QuestionnaireResponseItem) => {
      const linkedQuestionsMap = createLinkedQuestionsMap(items);
      const initialAnswers = readInitialAnswers(qrForm, linkedQuestionsMap);

      const updatedItems = initialAnswers
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
    checkItemIsEnabled: (linkId: string) => {
      let isEnabled = false;
      if (enableWhenItems[linkId]) {
        enableWhenItems[linkId].linked.forEach((linkedItem) => {
          if (linkedItem.answer && linkedItem.answer.length > 0) {
            linkedItem.answer.forEach((answer) => {
              isEnabled = isEnabledAnswerTypeSwitcher(linkedItem.enableWhen, answer);

              if (isEnabled) return true;
            });
            return isEnabled;
          }
        });
        return isEnabled;
      }
      // always enable component when linkId not in enableWhenItems
      return true;
    }
  };

  return (
    <EnableWhenContext.Provider value={enableWhenContext}>{children}</EnableWhenContext.Provider>
  );
}

export default EnableWhenProvider;
