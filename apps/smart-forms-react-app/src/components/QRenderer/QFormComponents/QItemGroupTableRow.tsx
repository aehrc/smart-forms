import React, { useEffect, useState } from 'react';

import { PropsWithQrItemChangeHandler } from '../../../interfaces/Interfaces';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import { createQrGroup, updateLinkedItem } from '../../../functions/QrItemFunctions';
import QItemSwitcher from './QItemSwitcher';
import { hideQItem } from '../../../functions/QItemFunctions';
import { getQrItemsIndex, mapQItemsIndex } from '../../../functions/IndexFunctions';
import { TableCell } from '@mui/material';

interface Props extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem> {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemGroupTableRow(props: Props) {
  const { qItem, qrItem, onQrItemChange } = props;

  if (hideQItem(qItem)) return null;

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
    updateLinkedItem(newQrRowItem, qrRow, qItemsIndexMap);
    setRow(qrRow);
    onQrItemChange(qrRow);
  }

  if (!rowItems || !rowQrItems) return null;

  const qrItemsByIndex = getQrItemsIndex(rowItems, rowQrItems);

  return (
    <>
      {rowItems.map((rowItem, index) => {
        const qrItem = qrItemsByIndex[index];

        return (
          <TableCell key={index}>
            <QItemSwitcher
              key={qItem.linkId}
              qItem={rowItem}
              qrItem={qrItem}
              repeats={true}
              onQrItemChange={handleQrRowItemChange}></QItemSwitcher>
          </TableCell>
        );
      })}
    </>
  );
}

export default QItemGroupTableRow;
