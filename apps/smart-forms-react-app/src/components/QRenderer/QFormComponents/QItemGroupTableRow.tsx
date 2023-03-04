/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { memo, useEffect, useState } from 'react';

import type { PropsWithQrItemChangeHandler } from '../../../interfaces/Interfaces';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import { createQrGroup, updateLinkedItem } from '../../../functions/QrItemFunctions';
import QItemSwitcher from './QItemSwitcher';
import { getQrItemsIndex } from '../../../functions/IndexFunctions';
import { FirstTableCell, StandardTableCell } from '../../StyledComponents/Table.styles';

interface Props extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem> {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
  qItemsIndexMap: Record<string, number>;
}

function QItemGroupTableRow(props: Props) {
  const { qItem, qrItem, qItemsIndexMap, onQrItemChange } = props;

  const rowItems = qItem.item;
  const qrRowFromProps = qrItem && qrItem.item ? qrItem : createQrGroup(qItem);
  const rowQrItems = qrRowFromProps.item;

  const [row, setRow] = useState(qrRowFromProps);

  useEffect(() => {
    setRow(qrRowFromProps);
  }, [qrItem]);

  if (!rowItems || !rowQrItems) return null;

  function handleQrRowItemChange(newQrRowItem: QuestionnaireResponseItem) {
    const qrRow: QuestionnaireResponseItem = { ...row };
    updateLinkedItem(newQrRowItem, null, qrRow, qItemsIndexMap);
    setRow(qrRow);
    onQrItemChange(qrRow);
  }

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
                  isRepeated={true}
                  isTabled={true}
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
                  isRepeated={true}
                  isTabled={true}
                  onQrItemChange={handleQrRowItemChange}></QItemSwitcher>
              </StandardTableCell>
            );
          }
        } else {
          return null;
        }
      })}
    </>
  );
}

export default memo(QItemGroupTableRow);
