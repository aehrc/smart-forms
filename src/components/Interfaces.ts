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

export interface EnableWhenProperties {
  linked: EnableWhenLinkedItem[];
  enableBehavior?: QuestionnaireItem['enableBehavior'];
}

export interface EnableWhenLinkedItem {
  enableWhen: QuestionnaireItemEnableWhen;
  value?: QuestionnaireResponseItemAnswer;
}
