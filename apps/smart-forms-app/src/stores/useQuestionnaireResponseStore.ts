import create from 'zustand';
import type { QuestionnaireResponse } from 'fhir/r4';

const emptyResponse: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress'
};

export interface QuestionnaireResponseState {
  sourceResponse: QuestionnaireResponse;
  updatableResponse: QuestionnaireResponse;
  hasChanges: boolean;
  updateResponse: (responseToUpdate: QuestionnaireResponse) => void;
  saveResponse: (responseToSave: QuestionnaireResponse) => void;
}

const useQuestionnaireResponseStore = create<QuestionnaireResponseState>()((set) => ({
  sourceResponse: emptyResponse,
  updatableResponse: emptyResponse,
  hasChanges: false,
  updateResponse: (responseToUpdate: QuestionnaireResponse) => {
    set(() => ({
      updatableResponse: responseToUpdate,
      hasChanges: true
    }));
  },
  saveResponse: (responseToSave: QuestionnaireResponse) => {
    set(() => ({
      sourceResponse: responseToSave,
      updatableResponse: responseToSave,
      hasChanges: false
    }));
  }
}));

export default useQuestionnaireResponseStore;
