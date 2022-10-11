import { QItemType } from '../../../interfaces/Enums';
import QItemString from './QItemSimple/QItemString';
import React from 'react';
import QItemBoolean from './QItemSimple/QItemBoolean';
import QItemDate from './QItemSimple/QItemDate';
import QItemText from './QItemSimple/QItemText';
import QItemDisplay from './QItemSimple/QItemDisplay';
import QItemInteger from './QItemSimple/QItemInteger';
import QItemDateTime from './QItemSimple/QItemDateTime';
import QItemDecimal from './QItemSimple/QItemDecimal';
import QItemQuantity from './QItemSimple/QItemQuantity';
import QItemChoice from './QItemChoice/QItemChoice';
import { isHidden } from '../../../functions/QItemFunctions';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import QItemTime from './QItemSimple/QItemTime';
import QItemOpenChoice from './QItemOpenChoice/QItemOpenChoice';
import { EnableWhenContext } from '../../../functions/EnableWhenContext';
import { EnableWhenChecksContext } from '../QForm';
import {
  PropsWithQrItemChangeHandler,
  PropsWithRepeatsAttribute
} from '../../../interfaces/Interfaces';

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
  const enableWhenContext = React.useContext(EnableWhenContext);
  const enableWhenChecksContext = React.useContext(EnableWhenChecksContext);

  function handleQrItemChange(newQrItem: QuestionnaireResponseItem) {
    if (newQrItem.answer) {
      enableWhenContext.updateItem(qItem.linkId, newQrItem.answer);
    }
    onQrItemChange(newQrItem);
  }

  if (isHidden(qItem)) return null;

  // only for testing
  if (enableWhenChecksContext) {
    if (!enableWhenContext.checkItemIsEnabled(qItem.linkId)) return null; // preserve this line in final build
  }

  switch (qItem.type) {
    case QItemType.String:
      return (
        <QItemString
          qItem={qItem}
          qrItem={qrItem}
          repeats={repeats}
          onQrItemChange={handleQrItemChange}
        />
      );
    case QItemType.Boolean:
      return (
        <QItemBoolean
          qItem={qItem}
          qrItem={qrItem}
          repeats={repeats}
          onQrItemChange={handleQrItemChange}
        />
      );
    case QItemType.Time:
      return (
        <QItemTime
          qItem={qItem}
          qrItem={qrItem}
          repeats={repeats}
          onQrItemChange={handleQrItemChange}
        />
      );
    case QItemType.Date:
      return (
        <QItemDate
          qItem={qItem}
          qrItem={qrItem}
          repeats={repeats}
          onQrItemChange={handleQrItemChange}
        />
      );
    case QItemType.DateTime:
      return (
        <QItemDateTime
          qItem={qItem}
          qrItem={qrItem}
          repeats={repeats}
          onQrItemChange={handleQrItemChange}
        />
      );
    case QItemType.Text:
      return (
        <QItemText
          qItem={qItem}
          qrItem={qrItem}
          repeats={repeats}
          onQrItemChange={handleQrItemChange}
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
          onQrItemChange={handleQrItemChange}
        />
      );
    case QItemType.Decimal:
      return (
        <QItemDecimal
          qItem={qItem}
          qrItem={qrItem}
          repeats={repeats}
          onQrItemChange={handleQrItemChange}
        />
      );
    case QItemType.Quantity:
      return (
        <QItemQuantity
          qItem={qItem}
          qrItem={qrItem}
          repeats={repeats}
          onQrItemChange={handleQrItemChange}
        />
      );
    case QItemType.Coding:
      return <div>Coding Placeholder</div>;
    default:
      // TODO temporary fix for choice and open-choice types
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (qItem.type === QItemType.Choice) {
        return (
          <QItemChoice
            qItem={qItem}
            qrItem={qrItem}
            repeats={repeats}
            onQrItemChange={handleQrItemChange}
          />
        );
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (qItem.type === QItemType.OpenChoice) {
        return (
          <QItemOpenChoice
            qItem={qItem}
            qrItem={qrItem}
            repeats={repeats}
            onQrItemChange={handleQrItemChange}
          />
        );
      }

      return <div>Default</div>;
  }
}

export default QItemSwitcher;
