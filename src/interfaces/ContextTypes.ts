import {
  Patient,
  Practitioner,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer
} from 'fhir/r5';
import Client from 'fhirclient/lib/Client';
import { EnableWhenItemProperties, EnableWhenItems } from './Interfaces';

export type EnableWhenContextType = {
  items: Record<string, EnableWhenItemProperties>;
  linkMap: Record<string, string[]>;
  setItems: (
    enableWhenItems: EnableWhenItems,
    questionnaireResponseForm: QuestionnaireResponseItem
  ) => unknown;
  updateItem: (linkId: string, newAnswer: QuestionnaireResponseItemAnswer[]) => unknown;
  checkItemIsEnabled: (linkId: string) => boolean;
};

export type LaunchContextType = {
  fhirClient: Client | null;
  patient: Patient | null;
  user: Practitioner | null;
  setFhirClient: (client: Client) => unknown;
  setPatient: (patient: Patient) => unknown;
  setUser: (user: Practitioner) => unknown;
};

export type QuestionnaireActiveContextType = {
  questionnaireActive: boolean;
  setQuestionnaireActive: (questionnaireActive: boolean) => unknown;
};

export type PreviewModeContextType = {
  previewMode: boolean;
  setPreviewMode: (previewMode: boolean) => unknown;
};
