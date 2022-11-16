import { Questionnaire, QuestionnaireResponse, QuestionnaireResponseItem } from 'fhir/r5';
export declare function constructResponse(questionnaire: Questionnaire, initialExpressions: Record<string, InitialExpression>): QuestionnaireResponse;
export declare function readQuestionnaire(questionnaire: Questionnaire, qrForm: QuestionnaireResponseItem, initialExpressions: Record<string, InitialExpression>): QuestionnaireResponseItem;
