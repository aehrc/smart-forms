import type { QuestionnaireResponseItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';

export type ComputedQRItemUpdates = Record<string, QuestionnaireResponseItem | null>;

export type ComputedNewAnswers = Record<string, QuestionnaireResponseItemAnswer | null>;
