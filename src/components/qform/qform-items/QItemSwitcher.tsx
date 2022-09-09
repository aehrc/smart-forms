import { QuestionnaireItem } from '../../questionnaire/QuestionnaireModel';
import { QuestionnaireResponseItem } from '../../questionnaireResponse/QuestionnaireResponseModel';
import { PropsWithQrItemChangeHandler, PropsWithRepeatsAttribute, QItemType } from '../FormModel';
import QItemString from './QItemString';
import React from 'react';
import QItemBoolean from './QItemBoolean';
import QItemDate from './QItemDate';
import QItemText from './QItemText';
import QItemDisplay from './QItemDisplay';
import QItemInteger from './QItemInteger';
import QItemDateTime from './QItemDateTime';
import QItemDecimal from './QItemDecimal';
import QItemQuantity from './QItemQuantity';
import QItemChoice from './QItemChoice';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithRepeatsAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

/**
 * Performs switching for non-group item components based on their item types.
 *
 * @author Sean Fong
 */
function QItemSwitcher(props: Props) {
  const { qItem, qrItem, repeats, onQrItemChange } = props;

  switch (qItem.type) {
    case QItemType.String:
      return (
        <QItemString
          qItem={qItem}
          qrItem={qrItem}
          repeats={repeats}
          onQrItemChange={onQrItemChange}
        />
      );
    case QItemType.Boolean:
      return (
        <QItemBoolean
          qItem={qItem}
          qrItem={qrItem}
          repeats={repeats}
          onQrItemChange={onQrItemChange}
        />
      );
    case QItemType.Date:
      return (
        <QItemDate
          qItem={qItem}
          qrItem={qrItem}
          repeats={repeats}
          onQrItemChange={onQrItemChange}
        />
      );
    case QItemType.DateTime:
      return (
        <QItemDateTime
          qItem={qItem}
          qrItem={qrItem}
          repeats={repeats}
          onQrItemChange={onQrItemChange}
        />
      );
    case QItemType.Text:
      return (
        <QItemText
          qItem={qItem}
          qrItem={qrItem}
          repeats={repeats}
          onQrItemChange={onQrItemChange}
        />
      );
    case QItemType.Display:
      return <QItemDisplay qItem={qItem} />;
    case QItemType.Integer:
      return (
        <QItemInteger
          qItem={qItem}
          qrItem={qrItem}
          repeats={repeats}
          onQrItemChange={onQrItemChange}
        />
      );
    case QItemType.Decimal:
      return (
        <QItemDecimal
          qItem={qItem}
          qrItem={qrItem}
          repeats={repeats}
          onQrItemChange={onQrItemChange}
        />
      );
    case QItemType.Quantity:
      return (
        <QItemQuantity
          qItem={qItem}
          qrItem={qrItem}
          repeats={repeats}
          onQrItemChange={onQrItemChange}
        />
      );
    case QItemType.Choice:
      return (
        <QItemChoice
          qItem={qItem}
          qrItem={qrItem}
          repeats={repeats}
          onQrItemChange={onQrItemChange}
        />
      );
    // case QItemType.OpenChoice:
    //   return <QItemOpenChoice qItem={qItem} qrItem={qrItem} onQrItemChange={onQrItemChange} />;
    default:
      return <div>Default</div>;
  }
}

export default QItemSwitcher;
