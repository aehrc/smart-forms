import type { QuestionnaireResponseItemAnswer } from 'fhir/r4';

export interface RepeatAnswer {
  id: string;
  answer: QuestionnaireResponseItemAnswer | null;
}
