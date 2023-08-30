import type { QuestionnaireResponseItemAnswer } from 'fhir/r4';

export interface RepeatAnswer {
  nanoId: string;
  answer: QuestionnaireResponseItemAnswer | null;
}
