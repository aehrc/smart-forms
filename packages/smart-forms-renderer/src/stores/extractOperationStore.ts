import { createStore } from 'zustand/vanilla';
import type { QuestionnaireResponse } from 'fhir/r4';
import { createSelectors } from './selector';

export interface ExtractOperationStoreType {
  extractionResult: QuestionnaireResponse | null;
  extractionError: string | null;
  debugInfo: any | null;
  isExtractionStarted: boolean;
  setExtractionResult: (result: QuestionnaireResponse | null) => void;
  setExtractionError: (error: string | null) => void;
  setDebugInfo: (info: any | null) => void;
  startExtraction: () => void;
  clearExtraction: () => void;
}

export const extractOperationStore = createStore<ExtractOperationStoreType>()((set) => ({
  extractionResult: null,
  extractionError: null,
  debugInfo: null,
  isExtractionStarted: false,
  setExtractionResult: (result) => set({ extractionResult: result, extractionError: null }),
  setExtractionError: (error) => set({ extractionError: error, extractionResult: null }),
  setDebugInfo: (info) => set({ debugInfo: info }),
  startExtraction: () => set({ isExtractionStarted: true }),
  clearExtraction: () => set({ 
    extractionResult: null, 
    extractionError: null, 
    debugInfo: null,
    isExtractionStarted: false 
  }),
}));

export const useExtractOperationStore = createSelectors(extractOperationStore); 