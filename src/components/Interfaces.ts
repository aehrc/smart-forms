import {
  QuestionnaireItem,
  QuestionnaireItemEnableWhen,
  QuestionnaireResponseItemAnswer
} from 'fhir/r5';

export interface PatientData {
  patientName: string;
  gender: string;
  dateOfBirth: string;
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
  value?: QuestionnaireResponseItemAnswer;
}

export type EnableWhenContextType = {
  items: Record<string, EnableWhenItemProperties>;
  linkMap: Record<string, string[]>;
  setItems: (enableWhenItems: EnableWhenItems) => unknown;
  updateItem: (linkId: string, newValue: QuestionnaireResponseItemAnswer) => unknown;
};
