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

import { memo, useCallback } from 'react';
import QItemChoice from './QItemChoice/QItemChoice.tsx';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import QItemOpenChoice from './QItemOpenChoice/QItemOpenChoice.tsx';
import { Typography } from '@mui/material';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithQrItemChangeHandler
} from '../../../types/renderProps.interface.ts';
import StringItem from './StringItem/StringItem.tsx';
import BooleanItem from './BooleanItem/BooleanItem.tsx';
import TimeItem from './TimeItem/TimeItem.tsx';
import DateTimeItem from './DateTimeItem/DateTimeItem.tsx';
import DateItem from './DateItem/DateItem.tsx';
import TextItem from './TextItem/TextItem.tsx';
import DisplayItem from './DisplayItem/DisplayItem.tsx';
import IntegerItem from './IntegerItem/IntegerItem.tsx';
import DecimalItem from './DecimalItem/DecimalItem.tsx';
import useQuestionnaireStore from '../../../../../stores/useQuestionnaireStore.ts';

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
const QItemSwitcher = memo(function QItemSwitcher(props: Props) {
  const { qItem, qrItem, isRepeated, isTabled, onQrItemChange } = props;

  const updateEnableWhenItem = useQuestionnaireStore((state) => state.updateEnableWhenItem);

  const handleQrItemChange = useCallback(
    (newQrItem: QuestionnaireResponseItem) => {
      if (newQrItem.answer) {
        updateEnableWhenItem(qItem.linkId, newQrItem.answer);
      }
      onQrItemChange(newQrItem);
    },
    [updateEnableWhenItem, onQrItemChange, qItem.linkId]
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
});

function RenderQItem(props: Props) {
  const { qItem, qrItem, isRepeated, isTabled, onQrItemChange } = props;

  switch (qItem.type) {
    case 'string':
      return (
        <StringItem
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={isRepeated}
          isTabled={isTabled}
          onQrItemChange={onQrItemChange}
        />
      );
    case 'boolean':
      return (
        <BooleanItem
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={isRepeated}
          onQrItemChange={onQrItemChange}
        />
      );
    case 'time':
      return (
        <TimeItem
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={isRepeated}
          isTabled={isTabled}
          onQrItemChange={onQrItemChange}
        />
      );
    case 'date':
      return (
        <DateItem
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={isRepeated}
          isTabled={isTabled}
          onQrItemChange={onQrItemChange}
        />
      );
    case 'dateTime':
      return (
        <DateTimeItem
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={isRepeated}
          isTabled={isTabled}
          onQrItemChange={onQrItemChange}
        />
      );
    case 'text':
      return (
        <TextItem
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={isRepeated}
          onQrItemChange={onQrItemChange}
        />
      );
    case 'display':
      return <DisplayItem qItem={qItem} />;
    case 'integer':
      return (
        <IntegerItem
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={isRepeated}
          isTabled={isTabled}
          onQrItemChange={onQrItemChange}
        />
      );
    case 'decimal':
      return (
        <DecimalItem
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
          Item type not supported yet. Only R4 datatypes are supported at the moment.
        </Typography>
      );
  }
}

export default QItemSwitcher;
