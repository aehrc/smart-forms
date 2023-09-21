import { create } from 'zustand';
import type { QuestionnaireResponse } from 'fhir/r4';
import { emptyResponse } from '../utils/emptyResource';
import cloneDeep from 'lodash.clonedeep';
import { diff } from 'json-diff';

export interface UseQuestionnaireResponseStoreType {
  sourceResponse: QuestionnaireResponse;
  updatableResponse: QuestionnaireResponse;
  formChangesHistory: object[];
  buildSourceResponse: (response: QuestionnaireResponse) => void;
  setUpdatableResponseAsPopulated: (populatedResponse: QuestionnaireResponse) => void;
  updateResponse: (updatedResponse: QuestionnaireResponse) => void;
  setUpdatableResponseAsSaved: (savedResponse: QuestionnaireResponse) => void;
  setUpdatableResponseAsEmpty: (clearedResponse: QuestionnaireResponse) => void;
  destroySourceResponse: () => void;
}

const useQuestionnaireResponseStore = create<UseQuestionnaireResponseStoreType>()((set, get) => ({
  sourceResponse: cloneDeep(emptyResponse),
  updatableResponse: cloneDeep(emptyResponse),
  formChangesHistory: [],
  buildSourceResponse: (questionnaireResponse: QuestionnaireResponse) => {
    set(() => ({
      sourceResponse: questionnaireResponse,
      updatableResponse: questionnaireResponse
    }));
  },
  setUpdatableResponseAsPopulated: (populatedResponse: QuestionnaireResponse) => {
    const formChanges = diff(get().updatableResponse, populatedResponse, { full: true });
    set(() => ({
      updatableResponse: populatedResponse,
      formChangesHistory: [...get().formChangesHistory, formChanges]
    }));
  },
  updateResponse: (updatedResponse: QuestionnaireResponse) => {
    const formChanges = diff(get().updatableResponse, updatedResponse, { full: true });
    set(() => ({
      updatableResponse: updatedResponse,
      formChangesHistory: [...get().formChangesHistory, formChanges]
    }));
  },
  setUpdatableResponseAsSaved: (savedResponse: QuestionnaireResponse) =>
    set(() => ({
      sourceResponse: savedResponse,
      updatableResponse: savedResponse,
      formChangesHistory: []
    })),
  setUpdatableResponseAsEmpty: (clearedResponse: QuestionnaireResponse) =>
    set(() => ({
      updatableResponse: clearedResponse,
      formChangesHistory: []
    })),
  destroySourceResponse: () =>
    set(() => ({
      sourceResponse: cloneDeep(emptyResponse),
      updatableResponse: cloneDeep(emptyResponse),
      formChangesHistory: []
    }))
}));

export default useQuestionnaireResponseStore;
