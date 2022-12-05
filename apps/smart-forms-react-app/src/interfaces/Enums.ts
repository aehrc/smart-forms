export enum QItemType {
  Group = 'group',
  String = 'string',
  Boolean = 'boolean',
  Date = 'date',
  Time = 'time',
  DateTime = 'dateTime',
  Text = 'text',
  Display = 'display',
  Integer = 'integer',
  Decimal = 'decimal',
  Quantity = 'quantity',
  Coding = 'coding',
  Choice = 'choice',
  OpenChoice = 'open-choice'
}

export enum QItemChoiceControl {
  Radio = 'radio',
  Select = 'select',
  Autocomplete = 'autocomplete',
  Checkbox = 'check-box'
}

export enum QItemOpenChoiceControl {
  Select = 'select',
  Autocomplete = 'autocomplete',
  Checkbox = 'check-box'
}

export enum QItemChoiceOrientation {
  Horizontal = 'horizontal',
  Vertical = 'vertical'
}

export enum PageType {
  ResponsePreview = 'responsePreview',
  Renderer = 'renderer',
  Picker = 'picker'
}

export enum CheckBoxOptionType {
  AnswerOption = 'answerOption',
  AnswerValueSet = 'answerValueSet'
}

export enum QuestionnaireSource {
  Local = 'local',
  Remote = 'remote'
}

export enum QrSortParam {
  QuestionnaireName = 'questionnaireName',
  AuthorName = 'authorName',
  LastUpdated = 'lastUpdated',
  Status = 'status'
}
