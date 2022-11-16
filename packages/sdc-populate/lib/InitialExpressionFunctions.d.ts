import { Expression, Questionnaire, QuestionnaireItem } from 'fhir/r5';
export declare function readInitialExpressions(questionnaire: Questionnaire): Record<string, InitialExpression>;
export declare function getInitialExpression(qItem: QuestionnaireItem): Expression | null;
