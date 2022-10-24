import * as React from 'react';
import { QuestionnaireActiveContextType } from '../interfaces/ContextTypes';

export const QuestionnaireActiveContext = React.createContext<QuestionnaireActiveContextType>({
  questionnaireActive: false,
  setQuestionnaireActive: () => void 0
});

function QuestionnaireActiveContextProvider(props: { children: any }) {
  const { children } = props;
  const [questionnaireActive, setQuestionnaireActive] = React.useState<boolean>(false);

  const questionnaireActiveContext: QuestionnaireActiveContextType = {
    questionnaireActive: questionnaireActive,
    setQuestionnaireActive: setQuestionnaireActive
  };
  return (
    <QuestionnaireActiveContext.Provider value={questionnaireActiveContext}>
      {children}
    </QuestionnaireActiveContext.Provider>
  );
}

export default QuestionnaireActiveContextProvider;
