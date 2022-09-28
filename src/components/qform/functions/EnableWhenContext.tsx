import * as React from 'react';
import { EnableWhenContextType, EnableWhenItems } from '../../Interfaces';
import { QuestionnaireResponseItemAnswer } from 'fhir/r5';

export const EnableWhenContext = React.createContext<EnableWhenContextType>({
  items: {},
  linkMap: {},
  setItems: () => void 0,
  updateItem: () => void 0
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
    },
    updateItem: (linkId: string, newValue: QuestionnaireResponseItemAnswer) => {
      if (!enableWhenItems[linkId]) return;

      console.log(enableWhenItems[linkId]);
    }
  };

  return (
    <EnableWhenContext.Provider value={enableWhenContext}>{children}</EnableWhenContext.Provider>
  );
}

function createLinkedQuestionsMap(enableWhenItems: EnableWhenItems) {
  const linkedQuestionsMap: Record<string, string[]> = {};
  for (const linkId in enableWhenItems) {
    enableWhenItems[linkId].linked.forEach((linkedItem) => {
      const linkQId = linkedItem.enableWhen.question;
      if (!linkedQuestionsMap[linkQId]) {
        linkedQuestionsMap[linkQId] = [];
      }

      if (!linkedQuestionsMap[linkQId].includes(linkId)) {
        linkedQuestionsMap[linkQId].push(linkId);
      }
    });
  }
  return linkedQuestionsMap;
}

export default EnableWhenProvider;
