import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';

export interface QuestionnaireListItem {
  id: string;
  title: string;
  avatarColor: string;
  publisher: string;
  date: Date | null;
  status: Questionnaire['status'];
}

export interface ResponseListItem {
  id: string;
  title: string;
  avatarColor: string;
  author: string;
  authored: Date | null;
  status: QuestionnaireResponse['status'];
}
