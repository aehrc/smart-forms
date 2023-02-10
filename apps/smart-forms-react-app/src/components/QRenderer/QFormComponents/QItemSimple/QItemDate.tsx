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

import React, { useEffect, useState } from 'react';
import { Grid } from '@mui/material';
import { FullWidthFormComponentBox } from '../../../StyledComponents/Boxes.styles';

import {
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithQrItemChangeHandler
} from '../../../../interfaces/Interfaces';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import { createEmptyQrItem } from '../../../../functions/QrItemFunctions';
import dayjs, { Dayjs } from 'dayjs';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import QItemDisplayInstructions from './QItemDisplayInstructions';
import QItemLabel from '../QItemParts/QItemLabel';
import { StandardTextField } from '../../../StyledComponents/Textfield.styles';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemDate(props: Props) {
  const { qItem, qrItem, isRepeated, isTabled, onQrItemChange } = props;

  const qrDate = qrItem ? qrItem : createEmptyQrItem(qItem);
  const answerValue = qrDate['answer'] ? qrDate['answer'][0].valueDate : null;
  const answerValueDayJs = answerValue ? dayjs(answerValue) : null;

  const [value, setValue] = useState<Dayjs | null>(answerValueDayJs);

  useEffect(() => {
    setValue(answerValueDayJs);
  }, [answerValueDayJs]);

  function handleChange(newValue: Dayjs | null | undefined) {
    if (newValue) {
      setValue(newValue);
      onQrItemChange({
        ...qrDate,
        answer: [{ valueDate: newValue.format('YYYY-MM-DD') }]
      });
    } else {
      onQrItemChange(createEmptyQrItem(qItem));
    }
  }

  const renderQItemDate = isRepeated ? (
    <QItemDatePicker value={value} onDateChange={handleChange} isTabled={isTabled} />
  ) : (
    <FullWidthFormComponentBox data-test="q-item-date-box">
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <QItemLabel qItem={qItem} />
        </Grid>
        <Grid item xs={7}>
          <QItemDatePicker value={value} onDateChange={handleChange} isTabled={isTabled} />
          <QItemDisplayInstructions qItem={qItem} />
        </Grid>
      </Grid>
    </FullWidthFormComponentBox>
  );

  return <>{renderQItemDate}</>;
}

interface QItemDatePickerProps extends PropsWithIsTabledAttribute {
  value: Dayjs | null;
  onDateChange: (newValue: Dayjs | null) => unknown;
}

function QItemDatePicker(props: QItemDatePickerProps) {
  const { value, onDateChange, isTabled } = props;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DesktopDatePicker
        inputFormat="DD/MM/YYYY"
        value={value}
        onChange={onDateChange}
        renderInput={(params) => (
          <StandardTextField
            fullWidth
            isTabled={isTabled}
            {...params}
            data-test="q-item-date-field"
          />
        )}
      />
    </LocalizationProvider>
  );
}

export default QItemDate;
