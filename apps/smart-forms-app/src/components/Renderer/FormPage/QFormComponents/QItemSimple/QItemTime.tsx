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

import { memo, useState } from 'react';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, TimeField } from '@mui/x-date-pickers';
import { Grid } from '@mui/material';

import type {
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithQrItemChangeHandler
} from '../../../../../interfaces/Interfaces';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { createEmptyQrItem } from '../../../../../functions/QrItemFunctions';
import QItemDisplayInstructions from './QItemDisplayInstructions';
import QItemLabel from '../QItemParts/QItemLabel';
import { FullWidthFormComponentBox } from '../../../../StyledComponents/Boxes.styles';
import useRenderingExtensions from '../../../../../custom-hooks/useRenderingExtensions';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemTime(props: Props) {
  const { qItem, qrItem, isRepeated, isTabled, onQrItemChange } = props;

  // Init input value
  const qrTime = qrItem ? qrItem : createEmptyQrItem(qItem);
  const answerValue = qrTime['answer'] ? qrTime['answer'][0].valueTime : null;
  const answerValueDayJs = answerValue ? dayjs(answerValue) : null;

  const [value, setValue] = useState<Dayjs | null>(answerValueDayJs);

  // Get additional rendering extensions
  const { displayPrompt, displayInstructions, readOnly, entryFormat } =
    useRenderingExtensions(qItem);

  // Event handlers
  function handleChange(newValue: Dayjs | null | undefined) {
    if (newValue) {
      setValue(newValue);
      onQrItemChange({ ...qrTime, answer: [{ valueTime: newValue.format() }] });
    } else {
      onQrItemChange(createEmptyQrItem(qItem));
    }
  }

  const renderQItemTime = isRepeated ? (
    <QItemTimePicker
      value={value}
      onTimeChange={handleChange}
      isTabled={isTabled}
      displayPrompt={displayPrompt}
      readOnly={readOnly}
      entryFormat={entryFormat}
    />
  ) : (
    <FullWidthFormComponentBox>
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <QItemLabel qItem={qItem} />
        </Grid>
        <Grid item xs={7}>
          <QItemTimePicker
            value={value}
            onTimeChange={handleChange}
            isTabled={isTabled}
            displayPrompt={displayPrompt}
            readOnly={readOnly}
            entryFormat={entryFormat}
          />
          <QItemDisplayInstructions displayInstructions={displayInstructions} />
        </Grid>
      </Grid>
    </FullWidthFormComponentBox>
  );
  return <>{renderQItemTime}</>;
}

interface QItemTimePickerProps extends PropsWithIsTabledAttribute {
  value: Dayjs | null;
  onTimeChange: (newValue: Dayjs | null) => unknown;
  displayPrompt: string;
  readOnly: boolean;
  entryFormat: string;
}

function QItemTimePicker(props: QItemTimePickerProps) {
  const { value, onTimeChange, displayPrompt, readOnly, isTabled, entryFormat } = props;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <TimeField
        format={entryFormat !== '' ? entryFormat : 'hh:mm a'}
        value={value}
        fullWidth
        disabled={readOnly}
        label={displayPrompt}
        sx={{ maxWidth: !isTabled ? 280 : 3000 }}
        onChange={onTimeChange}
      />
    </LocalizationProvider>
  );
}

export default memo(QItemTime);
