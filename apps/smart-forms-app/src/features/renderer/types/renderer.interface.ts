import type { QuestionnaireResponse } from 'fhir/r4';

export interface Renderer {
  response: QuestionnaireResponse;
  hasChanges: boolean;
}
