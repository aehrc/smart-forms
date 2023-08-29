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

import React from 'react';
import QItemChoice from '../QItemChoice/QItemChoice';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import QItemOpenChoice from '../QItemOpenChoice/QItemOpenChoice';
import { Typography } from '@mui/material';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithQrItemChangeHandler
} from '../../../interfaces/renderProps.interface';
import StringItem from '../StringItem/StringItem';
import BooleanItem from '../BooleanItem/BooleanItem';
import TimeItem from '../TimeItem/TimeItem';
import DateTimeItem from '../DateTimeItem/DateTimeItem';
import DateItem from '../DateItem/DateItem';
import TextItem from '../TextItem/TextItem';
import DisplayItem from '../DisplayItem/DisplayItem';
import IntegerItem from '../IntegerItem/IntegerItem';
import DecimalItem from '../DecimalItem/DecimalItem';
import UrlItem from '../UrlItem/UrlItem';

interface SingleItemSwitcherProps
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function SingleItemSwitcher(props: SingleItemSwitcherProps) {
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
          isTabled={isTabled}
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
    case 'url':
      return (
        <UrlItem
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

export default SingleItemSwitcher;
