import {
  Patient,
  Practitioner,
  QuestionnaireItem,
  QuestionnaireItemEnableWhen,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer
} from 'fhir/r5';
import Client from 'fhirclient/lib/Client';

export interface PropsWithQrItemChangeHandler<QuestionnaireResponseItem> {
  onQrItemChange: (qrItem: QuestionnaireResponseItem) => unknown;
}

export interface PropsWithRepeatsAttribute {
  repeats: boolean;
}

export interface PatientData {
  name: string;
  gender: string;
  dateOfBirth: string;
}

export interface UserData {
  name: string;
}

export interface CalculatedExpression {
  expression: string;
  value?: number;
}

export type EnableWhenItems = Record<string, EnableWhenItemProperties>;

export interface EnableWhenItemProperties {
  linked: EnableWhenLinkedItem[];
  enableBehavior?: QuestionnaireItem['enableBehavior'];
}

export interface EnableWhenLinkedItem {
  enableWhen: QuestionnaireItemEnableWhen;
  answer?: QuestionnaireResponseItemAnswer[];
}

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

export interface FirstLaunch {
  status: boolean;
  invalidate: () => unknown;
}
