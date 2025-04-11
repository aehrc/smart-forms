import { create } from 'zustand';
import type { Resource } from 'fhir/r4';

interface TemplateExtractState {
  isExtracting: boolean;
  extractedResources: Resource[];
  error: string | null;
  setExtracting: (isExtracting: boolean) => void;
  setExtractedResources: (resources: Resource[]) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useTemplateExtractStore = create<TemplateExtractState>((set) => ({
  isExtracting: false,
  extractedResources: [],
  error: null,
  setExtracting: (isExtracting) => set({ isExtracting }),
  setExtractedResources: (resources) => set({ extractedResources: resources }),
  setError: (error) => set({ error }),
  reset: () => set({ isExtracting: false, extractedResources: [], error: null })
})); 