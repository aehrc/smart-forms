import type { Expression, QuestionnaireItemAnswerOption } from 'fhir/r4';

export interface AnswerOptionsToggleExpression {
  linkId: string;
  options: RestrictedAnswerOption[];
  valueExpression: Expression;
  isEnabled?: boolean;
}

export type RestrictedAnswerOption = Omit<
  QuestionnaireItemAnswerOption,
  | 'initialSelected'
  | '_initialSelected'
  | 'valueDate'
  | '_valueDate'
  | 'valueTime'
  | '_valueTime'
  | 'valueReference'
>;
