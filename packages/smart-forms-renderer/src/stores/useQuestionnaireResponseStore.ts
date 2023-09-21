import { create } from 'zustand';
import type { QuestionnaireResponse } from 'fhir/r4';
import { emptyResponse } from '../utils/emptyResource';
import cloneDeep from 'lodash.clonedeep';
import type { Diff } from 'deep-diff';
import { diff } from 'deep-diff';

export interface UseQuestionnaireResponseStoreType {
  sourceResponse: QuestionnaireResponse;
  updatableResponse: QuestionnaireResponse;
  formChangesHistory: (Diff<QuestionnaireResponse, QuestionnaireResponse>[] | null)[];
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
    const formChanges = diff(get().updatableResponse, populatedResponse) ?? null;
    set(() => ({
      updatableResponse: populatedResponse,
      formChangesHistory: [...get().formChangesHistory, formChanges]
    }));
  },
  updateResponse: (updatedResponse: QuestionnaireResponse) => {
    const formChanges = diff(get().updatableResponse, updatedResponse) ?? null;
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
