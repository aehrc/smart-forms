export interface PropsWithQrItemChangeHandler<QuestionnaireResponseItem> {
  onQrItemChange: (qrItem: QuestionnaireResponseItem) => unknown;
}

export enum QItemType {
  Group = 'group',
  String = 'string',
  Boolean = 'boolean',
  Date = 'date',
  DateTime = 'datetime',
  Text = 'text',
  Display = 'display',
  Integer = 'integer',
  Decimal = 'decimal',
  Quantity = 'quantity',
  Choice = 'choice',
  OpenChoice = 'open-choice'
}
