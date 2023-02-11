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

import { QItemType } from '../../../interfaces/Enums';
import QItemString from './QItemSimple/QItemString';
import React, { memo, useCallback, useContext } from 'react';
import QItemBoolean from './QItemSimple/QItemBoolean';
import QItemDate from './QItemSimple/QItemDate';
import QItemText from './QItemSimple/QItemText';
import QItemDisplay from './QItemSimple/QItemDisplay';
import QItemInteger from './QItemSimple/QItemInteger';
import QItemDateTime from './QItemSimple/QItemDateTime';
import QItemDecimal from './QItemSimple/QItemDecimal';
import QItemQuantity from './QItemSimple/QItemQuantity';
import QItemChoice from './QItemChoice/QItemChoice';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import QItemTime from './QItemSimple/QItemTime';
import QItemOpenChoice from './QItemOpenChoice/QItemOpenChoice';
import { EnableWhenContext } from '../../../custom-contexts/EnableWhenContext';
import {
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithQrItemChangeHandler
} from '../../../interfaces/Interfaces';
import { isHidden } from '../../../functions/QItemFunctions';
import { EnableWhenChecksContext } from '../Form';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

/**
 * Performs switching for non-group item components based on their item types.
 *
 * @author Sean Fong
 */
function QItemSwitcher(props: Props) {
  const { qItem, qrItem, isRepeated, isTabled, onQrItemChange } = props;
  const enableWhenContext = useContext(EnableWhenContext);
  const enableWhenChecksContext = useContext(EnableWhenChecksContext);

  const handleQrItemChange = useCallback((newQrItem: QuestionnaireResponseItem) => {
    if (newQrItem.answer) {
      enableWhenContext.updateItem(qItem.linkId, newQrItem.answer);
    }
    onQrItemChange(newQrItem);
  }, []);

  if (isHidden(qItem, enableWhenContext, enableWhenChecksContext)) return null;

  switch (qItem.type) {
    case QItemType.String:
      return (
        <QItemString
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={isRepeated}
          isTabled={isTabled}
          onQrItemChange={handleQrItemChange}
        />
      );
    case QItemType.Boolean:
      return (
        <QItemBoolean
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={isRepeated}
          onQrItemChange={handleQrItemChange}
        />
      );
    case QItemType.Time:
      return (
        <QItemTime
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={isRepeated}
          isTabled={isTabled}
          onQrItemChange={handleQrItemChange}
        />
      );
    case QItemType.Date:
      return (
        <QItemDate
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={isRepeated}
          isTabled={isTabled}
          onQrItemChange={handleQrItemChange}
        />
      );
    case QItemType.DateTime:
      return (
        <QItemDateTime
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={isRepeated}
          isTabled={isTabled}
          onQrItemChange={handleQrItemChange}
        />
      );
    case QItemType.Text:
      return (
        <QItemText
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={isRepeated}
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
          isRepeated={isRepeated}
          isTabled={isTabled}
          onQrItemChange={handleQrItemChange}
        />
      );
    case QItemType.Decimal:
      return (
        <QItemDecimal
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={isRepeated}
          isTabled={isTabled}
          onQrItemChange={handleQrItemChange}
        />
      );
    case QItemType.Quantity:
      return (
        <QItemQuantity
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={isRepeated}
          isTabled={isTabled}
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
            isRepeated={isRepeated}
            isTabled={isTabled}
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
            isRepeated={isRepeated}
            isTabled={isTabled}
            onQrItemChange={handleQrItemChange}
          />
        );
      }

      return <div>Default</div>;
  }
}

export default memo(QItemSwitcher);
