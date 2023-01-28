import React, { useEffect } from 'react';
import { Grid } from '@mui/material';
import { FullWidthFormComponentBox } from '../../../StyledComponents/Boxes.styles';

import {
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithQrItemChangeHandler
} from '../../../../interfaces/Interfaces';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import { createQrItem } from '../../../../functions/QrItemFunctions';
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
      onQrItemChange({ ...qrDate, answer: [{ valueDate: newValue.format('YYYY-MM-DD') }] });
    }
  }

  const renderQItemDate = isRepeated ? (
    <QItemDatePicker value={value} onDateChange={handleChange} isTabled={isTabled} />
  ) : (
    <FullWidthFormComponentBox>
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
        renderInput={(params) => <StandardTextField fullWidth isTabled={isTabled} {...params} />}
      />
    </LocalizationProvider>
  );
}

export default QItemDate;
