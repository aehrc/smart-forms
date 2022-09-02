import { QuestionnaireItem } from '../../questionnaire/QuestionnaireModel';
import { QuestionnaireResponseItem } from '../../questionnaireResponse/QuestionnaireResponseModel';
import { PropsWithQrItemChangeHandler, QItemType } from '../FormModel';
import QItemString from './QItemString';
import React from 'react';
import QItemBoolean from './QItemBoolean';
import QItemDate from './QItemDate';

interface Props extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem> {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

/**
 * Performs switching for non-group item components based on their item types.
 *
 * @author Sean Fong
 */
function QItemSwitcher(props: Props) {
  const { qItem, qrItem, onQrItemChange } = props;

  switch (qItem.type) {
    case QItemType.String:
      return (
        <QItemString
          qItem={qItem}
          qrItem={qrItem}
          onQrItemChange={(newQrItem) => onQrItemChange(newQrItem)}
        />
      );
    case QItemType.Boolean:
      return <QItemBoolean qItem={qItem} qrItem={qrItem} onQrItemChange={onQrItemChange} />;
    case QItemType.Date:
      return <QItemDate qItem={qItem} qrItem={qrItem} onQrItemChange={onQrItemChange} />;
    default:
      return <div>Default</div>;
  }
}

export default QItemSwitcher;
