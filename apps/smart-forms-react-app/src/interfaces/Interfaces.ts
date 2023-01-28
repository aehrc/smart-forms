import {
  QuestionnaireItem,
  QuestionnaireItemEnableWhen,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer
} from 'fhir/r5';

export interface PropsWithQrItemChangeHandler<QuestionnaireResponseItem> {
  onQrItemChange: (qrItem: QuestionnaireResponseItem) => unknown;
}

export interface PropsWithQrRepeatGroupChangeHandler {
  onQrRepeatGroupChange: (qrRepeatGroup: QrRepeatGroup) => unknown;
}

export interface PropsWithIsRepeatedAttribute {
  isRepeated: boolean;
}

// export interface PropsWithIsTabledAttribute {
//   isTabled: boolean;
// }

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

export interface AuthFailDialog {
  dialogOpen: boolean | null;
  errorMessage: string;
}

export interface QrRepeatGroup {
  linkId: string;
  qrItems: QuestionnaireResponseItem[];
}
