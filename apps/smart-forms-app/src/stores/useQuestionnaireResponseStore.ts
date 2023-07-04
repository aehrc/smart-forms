import { create } from 'zustand';
import type { QuestionnaireResponse } from 'fhir/r4';

const emptyResponse: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress'
};

export interface QuestionnaireResponseState {
  sourceResponse: QuestionnaireResponse;
  updatableResponse: QuestionnaireResponse;
  hasChanges: boolean;
  buildSourceResponse: (response: QuestionnaireResponse) => void;
  populateResponse: (response: QuestionnaireResponse) => void;
  updateResponse: (updatedResponse: QuestionnaireResponse) => void;
  saveResponse: (savedResponse: QuestionnaireResponse) => void;
  clearResponse: (clearedResponse: QuestionnaireResponse) => void;
  destroySourceResponse: () => void;
}

const useQuestionnaireResponseStore = create<QuestionnaireResponseState>()((set) => ({
  sourceResponse: emptyResponse,
  updatableResponse: emptyResponse,
  hasChanges: false,

  buildSourceResponse: (questionnaireResponse: QuestionnaireResponse) => {
    set(() => ({
      sourceResponse: questionnaireResponse,
      updatableResponse: questionnaireResponse
    }));
  },
  populateResponse: (populatedResponse: QuestionnaireResponse) => {
    set(() => ({
      updatableResponse: populatedResponse
    }));
  },
  updateResponse: (updatedResponse: QuestionnaireResponse) =>
    set(() => ({
      updatableResponse: updatedResponse,
      hasChanges: true
    })),
  saveResponse: (savedResponse: QuestionnaireResponse) =>
    set(() => ({
      sourceResponse: savedResponse,
      updatableResponse: savedResponse,
      hasChanges: false
    })),
  clearResponse: (clearedResponse: QuestionnaireResponse) =>
    set(() => ({
      updatableResponse: clearedResponse,
      hasChanges: false
    })),
  destroySourceResponse: () =>
    set(() => ({
      sourceResponse: emptyResponse,
      updatableResponse: emptyResponse,
      hasChanges: false
    }))
}));

export default useQuestionnaireResponseStore;
