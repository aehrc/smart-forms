import create from 'zustand';
import type { Coding, Questionnaire } from 'fhir/r4';
import type { Tabs } from '../features/renderer/types/tab.interface.ts';
import type { Variables } from '../providers/questionnaireProvider.interfaces.ts';
import type { LaunchContext } from '../features/prepopulate/types/populate.interface.ts';
import type { CalculatedExpression } from '../features/calculatedExpression/types/calculatedExpression.interface.ts';
import type {
  EnableWhenExpression,
  EnableWhenItemProperties
} from '../features/enableWhen/types/enableWhen.interface.ts';
import type { AnswerExpression } from '../features/answerExpression/types/answerExpression.interface.ts';
import { createQuestionnaireModel } from '../features/preprocess/utils/preprocessQuestionnaire/preprocessQuestionnaire.ts';

export interface QuestionnaireState {
  questionnaire: Questionnaire;
  tabs: Tabs;
  variables: Variables;
  launchContexts: Record<string, LaunchContext>;
  calculatedExpressions: Record<string, CalculatedExpression>;
  enableWhenExpressions: Record<string, EnableWhenExpression>;
  answerExpressions: Record<string, AnswerExpression>;
  enableWhenItems: Record<string, EnableWhenItemProperties>;
  processedValueSetCodings: Record<string, Coding[]>;
  buildQuestionnaire: (questionnaire: Questionnaire) => void;
}

const useQuestionnaireStore = create<QuestionnaireState>()((set) => ({
  questionnaire: {
    resourceType: 'Questionnaire',
    status: 'draft'
  },
  tabs: {},
  variables: { fhirPathVariables: {}, xFhirQueryVariables: {} },
  launchContexts: {},
  calculatedExpressions: {},
  enableWhenExpressions: {},
  answerExpressions: {},
  enableWhenItems: {},
  processedValueSetCodings: {},
  buildQuestionnaire: async (questionnaire) => {
    const questionnaireModel = await createQuestionnaireModel(questionnaire);

    set({
      questionnaire: questionnaire,
      tabs: questionnaireModel.tabs,
      variables: questionnaireModel.variables,
      launchContexts: questionnaireModel.launchContexts,
      enableWhenItems: questionnaireModel.enableWhenItems,
      enableWhenExpressions: questionnaireModel.enableWhenExpressions,
      calculatedExpressions: questionnaireModel.calculatedExpressions,
      answerExpressions: questionnaireModel.answerExpressions,
      processedValueSetCodings: questionnaireModel.processedValueSetCodings
    });
  }
}));

export default useQuestionnaireStore;
