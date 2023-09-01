import { create } from 'zustand';
import type { QuestionnaireResponse } from 'fhir/r4';
import { emptyResponse } from '../utils/emptyResource';
import cloneDeep from 'lodash.clonedeep';

export interface UseQuestionnaireResponseStoreType {
  sourceResponse: QuestionnaireResponse;
  updatableResponse: QuestionnaireResponse;
  hasChanges: boolean;
  buildSourceResponse: (response: QuestionnaireResponse) => void;
  setUpdatableResponseAsPopulated: (populatedResponse: QuestionnaireResponse) => void;
  updateResponse: (updatedResponse: QuestionnaireResponse) => void;
  setUpdatableResponseAsSaved: (savedResponse: QuestionnaireResponse) => void;
  setUpdatableResponseAsEmpty: (clearedResponse: QuestionnaireResponse) => void;
  destroySourceResponse: () => void;
}

const useQuestionnaireResponseStore = create<UseQuestionnaireResponseStoreType>()((set) => ({
  sourceResponse: cloneDeep(emptyResponse),
  updatableResponse: cloneDeep(emptyResponse),
  hasChanges: false,
  buildSourceResponse: (questionnaireResponse: QuestionnaireResponse) => {
    set(() => ({
      sourceResponse: questionnaireResponse,
      updatableResponse: questionnaireResponse
    }));
  },
  setUpdatableResponseAsPopulated: (populatedResponse: QuestionnaireResponse) => {
    set(() => ({
      updatableResponse: populatedResponse,
      hasChanges: false
    }));
  },
  updateResponse: (updatedResponse: QuestionnaireResponse) =>
    set(() => ({
      updatableResponse: updatedResponse,
      hasChanges: true
    })),
  setUpdatableResponseAsSaved: (savedResponse: QuestionnaireResponse) =>
    set(() => ({
      sourceResponse: savedResponse,
      updatableResponse: savedResponse,
      hasChanges: false
    })),
  setUpdatableResponseAsEmpty: (clearedResponse: QuestionnaireResponse) =>
    set(() => ({
      updatableResponse: clearedResponse,
      hasChanges: false
    })),
  destroySourceResponse: () =>
    set(() => ({
      sourceResponse: cloneDeep(emptyResponse),
      updatableResponse: cloneDeep(emptyResponse),
      hasChanges: false
    }))
}));

export default useQuestionnaireResponseStore;
