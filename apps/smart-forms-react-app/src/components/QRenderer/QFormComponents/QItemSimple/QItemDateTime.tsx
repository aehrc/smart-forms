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
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import {
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithQrItemChangeHandler
} from '../../../../interfaces/Interfaces';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import { createEmptyQrItem } from '../../../../functions/QrItemFunctions';
import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import QItemDisplayInstructions from './QItemDisplayInstructions';
import QItemLabel from '../QItemParts/QItemLabel';
import { StandardTextField } from '../../../StyledComponents/Textfield.styles';
import { FullWidthFormComponentBox } from '../../../StyledComponents/Boxes.styles';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemDateTime(props: Props) {
  const { qItem, qrItem, isRepeated, isTabled, onQrItemChange } = props;

  const qrDateTime = qrItem ? qrItem : createEmptyQrItem(qItem);
  const answerValue = qrDateTime['answer'] ? qrDateTime['answer'][0].valueDateTime : null;
  const answerValueDayJs = answerValue ? dayjs(answerValue) : null;

  const [value, setValue] = useState<Dayjs | null>(answerValueDayJs);

  useEffect(() => {
    setValue(answerValueDayJs);
  }, [answerValue]);

  function handleChange(newValue: Dayjs | null | undefined) {
    if (newValue) {
      setValue(newValue);
      onQrItemChange({
        ...qrDateTime,
        answer: [{ valueDateTime: newValue.format() }]
      });
    }
  }

  const renderQItemDateTime = isRepeated ? (
    <QItemDateTimePicker value={value} onDateTimeChange={handleChange} isTabled={isTabled} />
  ) : (
    <FullWidthFormComponentBox>
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <QItemLabel qItem={qItem} />
        </Grid>
        <Grid item xs={7}>
          <QItemDateTimePicker value={value} onDateTimeChange={handleChange} isTabled={isTabled} />
          <QItemDisplayInstructions qItem={qItem} />
        </Grid>
      </Grid>
    </FullWidthFormComponentBox>
  );

  return <>{renderQItemDateTime}</>;
}

interface QItemDateTimePickerProps extends PropsWithIsTabledAttribute {
  value: Dayjs | null;
  onDateTimeChange: (newValue: Dayjs | null) => unknown;
}

function QItemDateTimePicker(props: QItemDateTimePickerProps) {
  const { value, onDateTimeChange, isTabled } = props;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DateTimePicker
        showToolbar
        value={value}
        onChange={onDateTimeChange}
        renderInput={(params) => <StandardTextField fullWidth isTabled={isTabled} {...params} />}
      />
    </LocalizationProvider>
  );
}

export default QItemDateTime;
