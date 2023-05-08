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

import QItemString from './QItemSimple/QItemString';
import { memo, useCallback, useContext } from 'react';
import QItemBoolean from './QItemSimple/QItemBoolean';
import QItemDate from './QItemSimple/QItemDate';
import QItemText from './QItemSimple/QItemText';
import QItemDisplay from './QItemSimple/QItemDisplay';
import QItemInteger from './QItemSimple/QItemInteger';
import QItemDateTime from './QItemSimple/QItemDateTime';
import QItemDecimal from './QItemSimple/QItemDecimal';
import QItemChoice from './QItemChoice/QItemChoice';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import QItemTime from './QItemSimple/QItemTime';
import QItemOpenChoice from './QItemOpenChoice/QItemOpenChoice';
import { EnableWhenContext } from '../../../../custom-contexts/EnableWhenContext';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithQrItemChangeHandler
} from '../../../../interfaces/Interfaces';
import { Typography } from '@mui/material';

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

  const handleQrItemChange = useCallback(
    (newQrItem: QuestionnaireResponseItem) => {
      if (newQrItem.answer) {
        enableWhenContext.updateItem(qItem.linkId, newQrItem.answer);
      }
      onQrItemChange(newQrItem);
    },
    [enableWhenContext, onQrItemChange, qItem.linkId]
  );

  // Is qItem is a repeat item, disable collapse transition as the base repeat item already has one
  return (
    <RenderQItem
      qItem={qItem}
      qrItem={qrItem}
      isRepeated={isRepeated}
      isTabled={isTabled}
      onQrItemChange={handleQrItemChange}
    />
  );
}

function RenderQItem(props: Props) {
  const { qItem, qrItem, isRepeated, isTabled, onQrItemChange } = props;

  switch (qItem.type) {
    case 'string':
      return (
        <QItemString
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={isRepeated}
          isTabled={isTabled}
          onQrItemChange={onQrItemChange}
        />
      );
    case 'boolean':
      return (
        <QItemBoolean
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={isRepeated}
          onQrItemChange={onQrItemChange}
        />
      );
    case 'time':
      return (
        <QItemTime
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={isRepeated}
          isTabled={isTabled}
          onQrItemChange={onQrItemChange}
        />
      );
    case 'date':
      return (
        <QItemDate
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={isRepeated}
          isTabled={isTabled}
          onQrItemChange={onQrItemChange}
        />
      );
    case 'dateTime':
      return (
        <QItemDateTime
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={isRepeated}
          isTabled={isTabled}
          onQrItemChange={onQrItemChange}
        />
      );
    case 'text':
      return (
        <QItemText
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={isRepeated}
          onQrItemChange={onQrItemChange}
        />
      );
    case 'display':
      return <QItemDisplay qItem={qItem} />;
    case 'integer':
      return (
        <QItemInteger
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={isRepeated}
          isTabled={isTabled}
          onQrItemChange={onQrItemChange}
        />
      );
    case 'decimal':
      return (
        <QItemDecimal
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={isRepeated}
          isTabled={isTabled}
          onQrItemChange={onQrItemChange}
        />
      );
    case 'choice':
      return (
        <QItemChoice
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={isRepeated}
          isTabled={isTabled}
          onQrItemChange={onQrItemChange}
        />
      );
    case 'open-choice':
      return (
        <QItemOpenChoice
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={isRepeated}
          isTabled={isTabled}
          onQrItemChange={onQrItemChange}
        />
      );
    default:
      return (
        <Typography>
          Item type not supported. Only R4 datatypes are supported at the moment.
        </Typography>
      );
  }
}

export default memo(QItemSwitcher);
