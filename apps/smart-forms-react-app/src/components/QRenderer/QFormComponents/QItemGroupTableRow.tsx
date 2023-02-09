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

import React, { useContext, useEffect, useState } from 'react';

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

  const enableWhenContext = useContext(EnableWhenContext);
  const enableWhenChecksContext = useContext(EnableWhenChecksContext);

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

  if (isHidden(qItem, enableWhenContext, enableWhenChecksContext)) return null;
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

export default QItemGroupTableRow;
