import create from 'zustand';
import type {
  Coding,
  Questionnaire,
  QuestionnaireResponse,
  QuestionnaireResponseItemAnswer
} from 'fhir/r4';
import type { Variables } from '../providers/questionnaireProvider.interfaces.ts';
import type { LaunchContext } from '../features/prepopulate/types/populate.interface.ts';
import type { CalculatedExpression } from '../features/calculatedExpression/types/calculatedExpression.interface.ts';
import type {
  EnableWhenExpression,
  EnableWhenItems
} from '../features/enableWhen/types/enableWhen.interface.ts';
import type { AnswerExpression } from '../features/answerExpression/types/answerExpression.interface.ts';
import { createQuestionnaireModel } from '../features/preprocess/utils/preprocessQuestionnaire/preprocessQuestionnaire.ts';
import { evaluateUpdatedCalculatedExpressions } from '../utils/calculatedExpressions.ts';
import type { Tabs } from '../features/renderer/types/tab.interface.ts';
import { updateItemAnswer } from '../features/enableWhen/utils/enableWhen.ts';
import { assignPopulatedAnswersToEnableWhen } from '../utils/enableWhen.ts';
import {
  evaluateInitialEnableWhenExpressions,
  evaluateUpdatedEnableWhenExpressions
} from '../utils/enableWhenExpression.ts';

export interface QuestionnaireState {
  questionnaire: Questionnaire;
  tabs: Tabs;
  currentTabIndex: number;
  variables: Variables;
  launchContexts: Record<string, LaunchContext>;
  enableWhenItems: EnableWhenItems;
  enableWhenLinkedQuestions: Record<string, string[]>;
  enableWhenIsActivated: boolean;
  enableWhenExpressions: Record<string, EnableWhenExpression>;
  calculatedExpressions: Record<string, CalculatedExpression>;
  answerExpressions: Record<string, AnswerExpression>;
  processedValueSetCodings: Record<string, Coding[]>;
  cachedValueSetCodings: Record<string, Coding[]>;
  buildQuestionnaire: (questionnaire: Questionnaire) => void;
  switchTab: (newTabIndex: number) => void;
  markTabAsComplete: (tabLinkId: string) => void;
  initialiseEnableWhenAnswers: (populatedResponse: QuestionnaireResponse) => void;
  updateEnableWhenItem: (linkId: string, newAnswer: QuestionnaireResponseItemAnswer[]) => void;
  toggleEnableWhenActivation: (isActivated: boolean) => void;
  initialiseEnableWhenExpressions: (populatedResponse: QuestionnaireResponse) => void;
  updateEnableWhenExpressions: (updatedResponse: QuestionnaireResponse) => void;
  updateCalculatedExpressions: (updatedResponse: QuestionnaireResponse) => void;
  addCodingToCache: (valueSetUrl: string, codings: Coding[]) => void;
}

const useQuestionnaireStore = create<QuestionnaireState>()((set, get) => ({
  questionnaire: {
    resourceType: 'Questionnaire',
    status: 'draft'
  },
  tabs: {},
  currentTabIndex: 0,
  variables: { fhirPathVariables: {}, xFhirQueryVariables: {} },
  launchContexts: {},
  calculatedExpressions: {},
  enableWhenExpressions: {},
  answerExpressions: {},
  enableWhenItems: {},
  enableWhenLinkedQuestions: {},
  enableWhenIsActivated: true,
  processedValueSetCodings: {},
  cachedValueSetCodings: {},
  buildQuestionnaire: async (questionnaire) => {
    const questionnaireModel = await createQuestionnaireModel(questionnaire);

    set({
      questionnaire: questionnaire,
      tabs: questionnaireModel.tabs,
      currentTabIndex: 0,
      variables: questionnaireModel.variables,
      launchContexts: questionnaireModel.launchContexts,
      enableWhenItems: questionnaireModel.enableWhenItems,
      enableWhenExpressions: questionnaireModel.enableWhenExpressions,
      calculatedExpressions: questionnaireModel.calculatedExpressions,
      answerExpressions: questionnaireModel.answerExpressions,
      processedValueSetCodings: questionnaireModel.processedValueSetCodings
    });
  },
  switchTab: (newTabIndex: number) => set(() => ({ currentTabIndex: newTabIndex })),
  markTabAsComplete: (tabLinkId: string) =>
    set((state) => ({
      tabs: {
        ...state.tabs,
        [tabLinkId]: { ...state.tabs[tabLinkId], isComplete: !state.tabs[tabLinkId].isComplete }
      }
    })),
  initialiseEnableWhenAnswers: (populatedResponse: QuestionnaireResponse) => {
    const { initialisedItems, linkedQuestions } = assignPopulatedAnswersToEnableWhen(
      get().enableWhenItems,
      populatedResponse
    );

    set(() => ({
      enableWhenItems: initialisedItems,
      enableWhenLinkedQuestions: linkedQuestions
    }));
  },
  updateEnableWhenItem: (linkId: string, newAnswer: QuestionnaireResponseItemAnswer[]) => {
    const enableWhenLinkedQuestions = get().enableWhenLinkedQuestions;
    const enableWhenItems = get().enableWhenItems;
    if (!enableWhenLinkedQuestions[linkId]) {
      return;
    }

    const itemLinkedQuestions = enableWhenLinkedQuestions[linkId];
    const updatedEnableWhenItems = updateItemAnswer(
      { ...enableWhenItems },
      itemLinkedQuestions,
      linkId,
      newAnswer
    );

    set(() => ({
      enableWhenItems: updatedEnableWhenItems
    }));
  },
  toggleEnableWhenActivation: (isActivated: boolean) =>
    set(() => ({ enableWhenIsActivated: isActivated })),
  initialiseEnableWhenExpressions: (populatedResponse: QuestionnaireResponse) => {
    const initialEnableWhenExpressions = evaluateInitialEnableWhenExpressions({
      initialResponse: populatedResponse,
      enableWhenExpressions: get().enableWhenExpressions,
      variablesFhirPath: get().variables.fhirPathVariables
    });

    set(() => ({ enableWhenExpressions: initialEnableWhenExpressions }));
  },
  updateEnableWhenExpressions: (updatedResponse: QuestionnaireResponse) => {
    const { isUpdated, updatedEnableWhenExpressions } = evaluateUpdatedEnableWhenExpressions({
      updatedResponse: updatedResponse,
      enableWhenExpressions: get().enableWhenExpressions,
      variablesFhirPath: get().variables.fhirPathVariables
    });

    if (isUpdated) {
      set(() => ({ enableWhenExpressions: updatedEnableWhenExpressions }));
    }
  },
  updateCalculatedExpressions: (updatedResponse: QuestionnaireResponse) => {
    const { isUpdated, updatedCalculatedExpressions } = evaluateUpdatedCalculatedExpressions({
      updatedResponse: updatedResponse,
      calculatedExpressions: get().calculatedExpressions,
      variablesFhirPath: get().variables.fhirPathVariables
    });

    if (isUpdated) {
      set(() => ({ calculatedExpressions: updatedCalculatedExpressions }));
    }
  },
  addCodingToCache: (valueSetUrl: string, codings: Coding[]) => {
    set((state) => ({
      cachedValueSetCodings: {
        ...state.cachedValueSetCodings,
        [valueSetUrl]: codings
      }
    }));
  }
}));

export default useQuestionnaireStore;
