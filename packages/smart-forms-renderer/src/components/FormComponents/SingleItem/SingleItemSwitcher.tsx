/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
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
import ChoiceItemSwitcher from '../ChoiceItems/ChoiceItemSwitcher';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import OpenChoiceItemSwitcher from '../OpenChoiceItems/OpenChoiceItemSwitcher';
import Typography from '@mui/material/Typography';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithParentIsReadOnlyAttribute,
  PropsWithQrItemChangeHandler,
  PropsWithShowMinimalViewAttribute
} from '../../../interfaces/renderProps.interface';
import StringItem from '../StringItem/StringItem';
import BooleanItem from '../BooleanItem/BooleanItem';
import TimeItem from '../TimeItem/TimeItem';
import TextItem from '../TextItem/TextItem';
import DisplayItem from '../DisplayItem/DisplayItem';
import DecimalItem from '../DecimalItem/DecimalItem';
import UrlItem from '../UrlItem/UrlItem';
import CustomDateItem from '../DateTimeItems/CustomDateItem/CustomDateItem';
import { isSpecificItemControl } from '../../../utils';
import SliderItem from '../SliderItem/SliderItem';
import IntegerItem from '../IntegerItem/IntegerItem';
import AttachmentItem from '../AttachmentItem/AttachmentItem';
import CustomDateTimeItem from '../DateTimeItems/CustomDateTimeItem/CustomDateTimeItem';
import QuantityItem from '../QuantityItem/QuantityItem';

interface SingleItemSwitcherProps
  extends PropsWithQrItemChangeHandler,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledAttribute,
    PropsWithShowMinimalViewAttribute,
    PropsWithParentIsReadOnlyAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem | null;
}

function SingleItemSwitcher(props: SingleItemSwitcherProps) {
  const { qItem, qrItem, isRepeated, isTabled, showMinimalView, parentIsReadOnly, onQrItemChange } =
    props;

  switch (qItem.type) {
    case 'display':
      return <DisplayItem qItem={qItem} />;
    case 'boolean':
      return (
        <BooleanItem
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={isRepeated}
          isTabled={isTabled}
          parentIsReadOnly={parentIsReadOnly}
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
          parentIsReadOnly={parentIsReadOnly}
          onQrItemChange={onQrItemChange}
        />
      );
    case 'integer':
      if (isSpecificItemControl(qItem, 'slider')) {
        return (
          <SliderItem
            qItem={qItem}
            qrItem={qrItem}
            isRepeated={isRepeated}
            isTabled={isTabled}
            parentIsReadOnly={parentIsReadOnly}
            onQrItemChange={onQrItemChange}
          />
        );
      }

      return (
        <IntegerItem
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={isRepeated}
          isTabled={isTabled}
          parentIsReadOnly={parentIsReadOnly}
          onQrItemChange={onQrItemChange}
        />
      );
    case 'date':
      return (
        <CustomDateItem
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={isRepeated}
          isTabled={isTabled}
          parentIsReadOnly={parentIsReadOnly}
          onQrItemChange={onQrItemChange}
        />
      );
    case 'dateTime':
      return (
        <CustomDateTimeItem
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={isRepeated}
          isTabled={isTabled}
          parentIsReadOnly={parentIsReadOnly}
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
          parentIsReadOnly={parentIsReadOnly}
          onQrItemChange={onQrItemChange}
        />
      );
    case 'string':
      return (
        <StringItem
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={isRepeated}
          isTabled={isTabled}
          parentIsReadOnly={parentIsReadOnly}
          onQrItemChange={onQrItemChange}
        />
      );
    case 'text':
      return (
        <TextItem
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={isRepeated}
          parentIsReadOnly={parentIsReadOnly}
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
          parentIsReadOnly={parentIsReadOnly}
          onQrItemChange={onQrItemChange}
        />
      );
    case 'choice':
      return (
        <ChoiceItemSwitcher
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={isRepeated}
          isTabled={isTabled}
          showMinimalView={showMinimalView}
          parentIsReadOnly={parentIsReadOnly}
          onQrItemChange={onQrItemChange}
        />
      );
    case 'open-choice':
      return (
        <OpenChoiceItemSwitcher
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={isRepeated}
          isTabled={isTabled}
          showMinimalView={showMinimalView}
          parentIsReadOnly={parentIsReadOnly}
          onQrItemChange={onQrItemChange}
        />
      );
    case 'attachment':
      return (
        <AttachmentItem
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={isRepeated}
          isTabled={isTabled}
          parentIsReadOnly={parentIsReadOnly}
          onQrItemChange={onQrItemChange}
        />
      );
    case 'reference':
      // FIXME reference item uses the same component as string item currently
      return (
        <StringItem
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={isRepeated}
          isTabled={isTabled}
          parentIsReadOnly={parentIsReadOnly}
          onQrItemChange={onQrItemChange}
        />
      );
    case 'quantity':
      // FIXME quantity item uses the same component as decimal item currently
      return (
        <QuantityItem
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={isRepeated}
          isTabled={isTabled}
          parentIsReadOnly={parentIsReadOnly}
          onQrItemChange={onQrItemChange}
        />
      );
    default:
      return (
        <Typography>
          Item type <b>{qItem.type}</b> not supported yet, or something has went wrong. If your
          questionnnaire is not a FHIR R4 resource, there might be issues rendering it.
        </Typography>
      );
  }
}

export default SingleItemSwitcher;
