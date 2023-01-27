import React, { useEffect, useState } from 'react';

import { PropsWithQrItemChangeHandler } from '../../../interfaces/Interfaces';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import { createQrGroup, updateLinkedItem } from '../../../functions/QrItemFunctions';
import QItemSwitcher from './QItemSwitcher';
import { isHidden } from '../../../functions/QItemFunctions';
import { getQrItemsIndex, mapQItemsIndex } from '../../../functions/IndexFunctions';
import { EnableWhenContext } from '../../../custom-contexts/EnableWhenContext';
import { EnableWhenChecksContext } from '../Form';
import { FirstTableCell, StandardTableCell } from '../../StyledComponents/Table.styles';

interface Props extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem> {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemGroupTableRow(props: Props) {
  const { qItem, qrItem, onQrItemChange } = props;

  const enableWhenContext = React.useContext(EnableWhenContext);
  const enableWhenChecksContext = React.useContext(EnableWhenChecksContext);

  if (isHidden(qItem, enableWhenContext, enableWhenChecksContext)) return null;

  const qItemsIndexMap = mapQItemsIndex(qItem);

  const rowItems = qItem.item;
  const qrRowFromProps = qrItem && qrItem.item ? qrItem : createQrGroup(qItem);
  const rowQrItems = qrRowFromProps.item;

  const [row, setRow] = useState(qrRowFromProps);

  useEffect(() => {
    setRow(qrRowFromProps);
  }, [qrItem]);

  function handleQrRowItemChange(newQrRowItem: QuestionnaireResponseItem) {
    const qrRow: QuestionnaireResponseItem = { ...row };
    updateLinkedItem(newQrRowItem, null, qrRow, qItemsIndexMap);
    setRow(qrRow);
    onQrItemChange(qrRow);
  }

  if (!rowItems || !rowQrItems) return null;

  const qrItemsByIndex = getQrItemsIndex(rowItems, rowQrItems, qItemsIndexMap);

  return (
    <>
      {rowItems.map((rowItem, index) => {
        const qrItem = qrItemsByIndex[index];

        if (!Array.isArray(qrItem)) {
          if (index === 0) {
            return (
              <FirstTableCell key={index}>
                <QItemSwitcher
                  key={qItem.linkId}
                  qItem={rowItem}
                  qrItem={qrItem}
                  repeats={true}
                  onQrItemChange={handleQrRowItemChange}></QItemSwitcher>
              </FirstTableCell>
            );
          } else {
            return (
              <StandardTableCell key={index} numOfColumns={rowItems.length}>
                <QItemSwitcher
                  key={qItem.linkId}
                  qItem={rowItem}
                  qrItem={qrItem}
                  repeats={true}
                  onQrItemChange={handleQrRowItemChange}></QItemSwitcher>
              </StandardTableCell>
            );
          }
        }
      })}
    </>
  );
}

export default QItemGroupTableRow;
