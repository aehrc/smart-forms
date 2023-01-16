import React, { useEffect } from 'react';
import { FormControl, Grid, TextField } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import {
  PropsWithQrItemChangeHandler,
  PropsWithRepeatsAttribute
} from '../../../../interfaces/Interfaces';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import { createQrItem } from '../../../../functions/QrItemFunctions';
import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import QItemDisplayInstructions from './QItemDisplayInstructions';
import QItemLabel from '../QItemParts/QItemLabel';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithRepeatsAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemDateTime(props: Props) {
  const { qItem, qrItem, repeats, onQrItemChange } = props;

  const qrDateTime = qrItem ? qrItem : createQrItem(qItem);
  const answerValue = qrDateTime['answer'] ? qrDateTime['answer'][0].valueDateTime : null;
  const answerValueDayJs = answerValue ? dayjs(answerValue) : null;

  const [value, setValue] = React.useState<Dayjs | null>(answerValueDayJs);

  useEffect(() => {
    setValue(answerValueDayJs);
  }, [answerValue]);

  function handleChange(newValue: Dayjs | null | undefined) {
    if (newValue) {
      setValue(newValue);
      onQrItemChange({ ...qrDateTime, answer: [{ valueDateTime: newValue.format() }] });
    }
  }

  const renderQItemDateTime = repeats ? (
    <QItemDateTimePicker value={value} onDateTimeChange={handleChange} />
  ) : (
    <FormControl>
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <QItemLabel qItem={qItem} />
        </Grid>
        <Grid item xs={7}>
          <QItemDateTimePicker value={value} onDateTimeChange={handleChange} />
          <QItemDisplayInstructions qItem={qItem} />
        </Grid>
      </Grid>
    </FormControl>
  );

  return <>{renderQItemDateTime}</>;
}

interface QItemDateTimePickerProps {
  value: Dayjs | null;
  onDateTimeChange: (newValue: Dayjs | null) => unknown;
}

function QItemDateTimePicker(props: QItemDateTimePickerProps) {
  const { value, onDateTimeChange } = props;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DateTimePicker
        showToolbar
        value={value}
        onChange={onDateTimeChange}
        renderInput={(params) => <TextField {...params} />}
      />
    </LocalizationProvider>
  );
}

export default QItemDateTime;
