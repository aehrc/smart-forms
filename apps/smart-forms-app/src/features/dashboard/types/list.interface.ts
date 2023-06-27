import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';

export interface QuestionnaireListItem {
  id: string;
  title: string;
  avatarColor: string;
  publisher: string;
  date: string;
  status: Questionnaire['status'];
}

export interface ResponseListItem {
  id: string;
  title: string;
  avatarColor: string;
  author: string;
  authored: string;
  status: QuestionnaireResponse['status'];
}

export type ListItem = QuestionnaireListItem | ResponseListItem;
export type ListItemWithIndex = [number, QuestionnaireListItem | ResponseListItem];

export interface SelectedQuestionnaire {
  listItem: QuestionnaireListItem;
  resource: Questionnaire;
}

export interface SelectedResponse {
  listItem: ResponseListItem;
  resource: QuestionnaireResponse;
}
