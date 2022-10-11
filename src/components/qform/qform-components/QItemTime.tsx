import * as React from 'react';
import dayjs, { Dayjs } from 'dayjs';
import TextField from '@mui/material/TextField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { FormControl, Grid, Typography } from '@mui/material';
import { PropsWithQrItemChangeHandler, PropsWithRepeatsAttribute } from '../FormModel';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import { useEffect } from 'react';
import { createQrItem } from '../functions/QrItemFunctions';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithRepeatsAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemTime(props: Props) {
  const { qItem, qrItem, repeats, onQrItemChange } = props;

  const qrTime = qrItem ? qrItem : createQrItem(qItem);
  const answerValue = qrTime['answer'] ? qrTime['answer'][0].valueTime : null;
  const answerValueDayJs = answerValue ? dayjs(answerValue) : null;

  const [value, setValue] = React.useState<Dayjs | null>(answerValueDayJs);

  useEffect(() => {
    setValue(answerValueDayJs);
  }, [answerValue]);

  function handleChange(newValue: Dayjs | null | undefined) {
    if (newValue) {
      setValue(newValue);
      onQrItemChange({ ...qrTime, answer: [{ valueTime: newValue.format() }] });
    }
  }

  const renderQItemTime = repeats ? (
    <QItemTimePicker value={value} onTimeChange={handleChange} />
  ) : (
    <FormControl>
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <Typography>{qItem.text}</Typography>
        </Grid>
        <Grid item xs={7}>
          <QItemTimePicker value={value} onTimeChange={handleChange} />
        </Grid>
      </Grid>
    </FormControl>
  );
  return <>{renderQItemTime}</>;
}

interface QItemTimePickerProps {
  value: Dayjs | null;
  onTimeChange: (newValue: Dayjs | null) => unknown;
}

function QItemTimePicker(props: QItemTimePickerProps) {
  const { value, onTimeChange } = props;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <TimePicker
        showToolbar
        value={value}
        onChange={onTimeChange}
        renderInput={(params) => <TextField {...params} />}
      />
    </LocalizationProvider>
  );
}

export default QItemTime;
