import React, { useEffect } from 'react';
import { FormControl, Grid, TextField, Typography } from '@mui/material';

import {
  PropsWithQrItemChangeHandler,
  PropsWithRepeatsAttribute
} from '../../../../interfaces/Interfaces';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import { createQrItem } from '../../../../functions/QrItemFunctions';
import dayjs, { Dayjs } from 'dayjs';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithRepeatsAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemDate(props: Props) {
  const { qItem, qrItem, repeats, onQrItemChange } = props;

  const qrDate = qrItem ? qrItem : createQrItem(qItem);
  const answerValue = qrDate['answer'] ? qrDate['answer'][0].valueDate : null;
  const answerValueDayJs = answerValue ? dayjs(answerValue) : null;

  const [value, setValue] = React.useState<Dayjs | null>(answerValueDayJs);

  useEffect(() => {
    setValue(answerValueDayJs);
  }, [answerValue]);

  function handleChange(newValue: Dayjs | null | undefined) {
    if (newValue) {
      setValue(newValue);
      onQrItemChange({ ...qrDate, answer: [{ valueDate: newValue.format() }] });
    }
  }

  const renderQItemDate = repeats ? (
    <QItemDatePicker value={value} onDateChange={handleChange} />
  ) : (
    <FormControl>
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <Typography>{qItem.text}</Typography>
        </Grid>
        <Grid item xs={7}>
          <QItemDatePicker value={value} onDateChange={handleChange} />
        </Grid>
      </Grid>
    </FormControl>
  );

  return <>{renderQItemDate}</>;
}

interface QItemDatePickerProps {
  value: Dayjs | null;
  onDateChange: (newValue: Dayjs | null) => unknown;
}

function QItemDatePicker(props: QItemDatePickerProps) {
  const { value, onDateChange } = props;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DesktopDatePicker
        inputFormat="DD/MM/YYYY"
        value={value}
        onChange={onDateChange}
        renderInput={(params) => <TextField {...params} />}
      />
    </LocalizationProvider>
  );
}

export default QItemDate;
