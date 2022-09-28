import * as React from 'react';
import { EnableWhenContextType, EnableWhenItems } from '../../Interfaces';
import { QuestionnaireResponseItemAnswer } from 'fhir/r5';
import { createLinkedQuestionsMap, isEnabledAnswerTypeSwitcher } from './EnableWhenFunctions';

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
    setItems: (enableWhenItems: EnableWhenItems) => {
      setLinkedQuestionsMap(createLinkedQuestionsMap(enableWhenItems));
      setEnableWhenItems(enableWhenItems);
      // TODO assign answers to these items on initialize
    },
    updateItem: (linkId: string, newAnswer: QuestionnaireResponseItemAnswer[]) => {
      if (!linkedQuestionsMap[linkId]) return;

      const linkedQuestions = linkedQuestionsMap[linkId];
      const updatedEnableWhenItems = { ...enableWhenItems };

      linkedQuestions.forEach((question) => {
        updatedEnableWhenItems[question].linked.forEach((linkedItem) => {
          if (linkedItem.enableWhen.question === linkId) {
            linkedItem.answer = newAnswer ?? undefined;
          }
        });
      });
      setEnableWhenItems({ ...updatedEnableWhenItems });
    },
    checkItemIsEnabled: (linkId: string) => {
      let isEnabled = false;
      if (enableWhenItems[linkId]) {
        enableWhenItems[linkId].linked.forEach((linkedItem) => {
          if (linkedItem.answer && linkedItem.answer.length > 0) {
            isEnabled = isEnabledAnswerTypeSwitcher(linkedItem.enableWhen, linkedItem.answer);
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
