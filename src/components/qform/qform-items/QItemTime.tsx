import * as React from 'react';
import dayjs, { Dayjs } from 'dayjs';
import TextField from '@mui/material/TextField';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { Container, FormControl, Grid, Typography } from '@mui/material';
import { PropsWithQrItemChangeHandler, PropsWithRepeatsAttribute } from '../FormModel';
import { QuestionnaireResponseService } from '../../questionnaireResponse/QuestionnaireResponseService';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import { useEffect } from 'react';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithRepeatsAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemTime(props: Props) {
  const { qItem, qrItem, repeats, onQrItemChange } = props;

  let qrTime = qrItem ? qrItem : QuestionnaireResponseService.createQrItem(qItem);
  const answerValue = qrTime['answer'] ? qrTime['answer'][0].valueTime : null;
  const answerValueDayJs: Dayjs | null = answerValue ? dayjs(answerValue) : null;

  const [value, setValue] = React.useState<Dayjs | null>(answerValueDayJs);

  useEffect(() => {
    setValue(answerValueDayJs);
  }, [answerValue]);

  function handleChange(newValue: Dayjs | null | undefined) {
    if (newValue) {
      setValue(newValue);
      qrTime = { ...qrTime, answer: [{ valueTime: newValue.format() }] };
      onQrItemChange(qrTime);
    }
  }

  const renderQItemDate = repeats ? (
    <Container>
      <QItemDatePicker value={value} onTimeChange={handleChange} />
    </Container>
  ) : (
    <FormControl fullWidth sx={{ m: 1, p: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={5}>
          <Typography>{qItem.text}</Typography>
        </Grid>
        <Grid item xs={7}>
          <Container>
            <QItemDatePicker value={value} onTimeChange={handleChange} />
          </Container>
        </Grid>
      </Grid>
    </FormControl>
  );
  return <div>{renderQItemDate}</div>;
}

interface QItemDatePickerProps {
  value: Dayjs | null;
  onTimeChange: (newValue: Dayjs | null) => unknown;
}

function QItemDatePicker(props: QItemDatePickerProps) {
  const { value, onTimeChange } = props;

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <TimePicker
        value={value}
        onChange={onTimeChange}
        renderInput={(params) => <TextField {...params} />}
      />
    </LocalizationProvider>
  );
}

export default QItemTime;
