import { create } from 'zustand';
import type {
  Coding,
  Questionnaire,
  QuestionnaireResponse,
  QuestionnaireResponseItemAnswer
} from 'fhir/r4';
import type { Variables } from '../providers/questionnaireProvider.interfaces.ts';
import type { LaunchContext } from '../features/prepopulate/types/populate.interface.ts';
import type { CalculatedExpression } from '../features/calculatedExpression/types/calculatedExpression.interface.ts';
import type { EnableWhenExpression, EnableWhenItems } from '../types/enableWhen.interface.ts';
import type { AnswerExpression } from '../types/answerExpression.interface.ts';
import { createQuestionnaireModel } from '../features/preprocess/utils/preprocessQuestionnaire/preprocessQuestionnaire.ts';
import { evaluateUpdatedCalculatedExpressions } from '../utils/calculatedExpressions.ts';
import type { Tabs } from '../features/renderer/types/tab.interface.ts';
import { updateItemAnswer } from '../utils/enableWhen.ts';
import {
  evaluateInitialEnableWhenExpressions,
  evaluateUpdatedEnableWhenExpressions
} from '../utils/enableWhenExpression.ts';
import { initialiseFormFromResponse } from '../utils/initaliseForm.ts';

const emptyQuestionnaire: Questionnaire = {
  resourceType: 'Questionnaire',
  status: 'draft'
};

export const emptyResponse: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress'
};

export interface QuestionnaireState {
  sourceQuestionnaire: Questionnaire;
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
  buildSourceQuestionnaire: (
    questionnaire: Questionnaire,
    questionnaireResponse?: QuestionnaireResponse
  ) => Promise<void>;
  destroySourceQuestionnaire: () => void;
  switchTab: (newTabIndex: number) => void;
  markTabAsComplete: (tabLinkId: string) => void;
  updateEnableWhenItem: (linkId: string, newAnswer: QuestionnaireResponseItemAnswer[]) => void;
  toggleEnableWhenActivation: (isActivated: boolean) => void;
  initialiseEnableWhenExpressions: (populatedResponse: QuestionnaireResponse) => void;
  updateEnableWhenExpressions: (updatedResponse: QuestionnaireResponse) => void;
  updateCalculatedExpressions: (updatedResponse: QuestionnaireResponse) => void;
  addCodingToCache: (valueSetUrl: string, codings: Coding[]) => void;
  updatePopulatedProperties: (populatedResponse: QuestionnaireResponse) => void;
}

const useQuestionnaireStore = create<QuestionnaireState>()((set, get) => ({
  sourceQuestionnaire: emptyQuestionnaire,
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
  buildSourceQuestionnaire: async (questionnaire, questionnaireResponse = emptyResponse) => {
    const questionnaireModel = await createQuestionnaireModel(questionnaire);

    const {
      initialEnableWhenItems,
      initialEnableWhenLinkedQuestions,
      initialEnableWhenExpressions,
      firstVisibleTab
    } = initialiseFormFromResponse({
      questionnaireResponse,
      enableWhenItems: questionnaireModel.enableWhenItems,
      enableWhenExpressions: questionnaireModel.enableWhenExpressions,
      variablesFhirPath: questionnaireModel.variables.fhirPathVariables,
      tabs: questionnaireModel.tabs
    });

    set({
      sourceQuestionnaire: questionnaire,
      tabs: questionnaireModel.tabs,
      currentTabIndex: firstVisibleTab,
      variables: questionnaireModel.variables,
      launchContexts: questionnaireModel.launchContexts,
      enableWhenItems: initialEnableWhenItems,
      enableWhenLinkedQuestions: initialEnableWhenLinkedQuestions,
      enableWhenExpressions: initialEnableWhenExpressions,
      calculatedExpressions: questionnaireModel.calculatedExpressions,
      answerExpressions: questionnaireModel.answerExpressions,
      processedValueSetCodings: questionnaireModel.processedValueSetCodings
    });
  },
  destroySourceQuestionnaire: () =>
    set({
      sourceQuestionnaire: emptyQuestionnaire,
      tabs: {},
      currentTabIndex: 0,
      variables: { fhirPathVariables: {}, xFhirQueryVariables: {} },
      launchContexts: {},
      enableWhenItems: {},
      enableWhenLinkedQuestions: {},
      enableWhenExpressions: {},
      calculatedExpressions: {},
      answerExpressions: {},
      processedValueSetCodings: {}
    }),
  switchTab: (newTabIndex: number) => set(() => ({ currentTabIndex: newTabIndex })),
  markTabAsComplete: (tabLinkId: string) => {
    const tabs = get().tabs;
    set(() => ({
      tabs: {
        ...tabs,
        [tabLinkId]: { ...tabs[tabLinkId], isComplete: !tabs[tabLinkId].isComplete }
      }
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
  addCodingToCache: (valueSetUrl: string, codings: Coding[]) =>
    set(() => ({
      cachedValueSetCodings: {
        ...get().cachedValueSetCodings,
        [valueSetUrl]: codings
      }
    })),
  updatePopulatedProperties: (populatedResponse: QuestionnaireResponse) => {
    const {
      initialEnableWhenItems,
      initialEnableWhenLinkedQuestions,
      initialEnableWhenExpressions,
      firstVisibleTab
    } = initialiseFormFromResponse({
      questionnaireResponse: populatedResponse,
      enableWhenItems: get().enableWhenItems,
      enableWhenExpressions: get().enableWhenExpressions,
      variablesFhirPath: get().variables.fhirPathVariables,
      tabs: get().tabs
    });

    set(() => ({
      enableWhenItems: initialEnableWhenItems,
      enableWhenLinkedQuestions: initialEnableWhenLinkedQuestions,
      enableWhenExpressions: initialEnableWhenExpressions,
      currentTabIndex: firstVisibleTab
    }));
  }
}));

export default useQuestionnaireStore;
