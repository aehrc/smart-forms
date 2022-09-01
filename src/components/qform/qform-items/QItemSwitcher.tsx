import { QuestionnaireItem } from '../../questionnaire/QuestionnaireModel';
import { QuestionnaireResponseItem } from '../../questionnaireResponse/QuestionnaireResponseModel';
import { PropsWithQrItemChangeHandler, QItemType } from '../FormModel';
import QItemString from './QItemString';
import React from 'react';
import QItemBoolean from './QItemBoolean';

interface Props extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem> {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemSwitcher(props: Props) {
  const { qItem, qrItem, onQrItemChange } = props;

  switch (qItem.type) {
    case QItemType.String:
      return <QItemString qItem={qItem} qrItem={qrItem} onQrItemChange={onQrItemChange} />;
    default:
      return <QItemBoolean qItem={qItem} qrItem={qrItem} onQrItemChange={onQrItemChange} />;
  }
}

export default QItemSwitcher;
