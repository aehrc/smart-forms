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

import type {
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithQrItemChangeHandler
} from '../../../../types/renderProps.interface.ts';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import useRenderingExtensions from '../../../../hooks/useRenderingExtensions.ts';
import { createEmptyQrItem } from '../../../../utils/qrItem.ts';
import { FullWidthFormComponentBox } from '../../../../../../components/Box/Box.styles.tsx';
import FieldGrid from '../FieldGrid.tsx';
import DateTimeField from './DateTimeField.tsx';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { checkStringIsDateTime } from '../../../../utils/parseInputs.ts';

interface DateTimeItemProps
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function DateTimeItem(props: DateTimeItemProps) {
  const { qItem, qrItem, isRepeated, isTabled, onQrItemChange } = props;

  // Get additional rendering extensions
  const { displayPrompt, displayInstructions, readOnly, entryFormat } =
    useRenderingExtensions(qItem);

  // Init input value
  let dateTimeString: string | null = null;
  if (qrItem?.answer) {
    if (qrItem?.answer[0].valueDateTime) {
      dateTimeString = qrItem.answer[0].valueDateTime;
    }

    if (qrItem?.answer[0].valueString) {
      if (checkStringIsDateTime(qrItem.answer[0].valueString)) {
        dateTimeString = qrItem.answer[0].valueString;
      }
    }
  }
  const dateTimeDayJs = dateTimeString ? dayjs(dateTimeString) : null;

  // Event handlers
  function handleDateTimeChange(newValue: Dayjs | null) {
    const emptyQrItem = createEmptyQrItem(qItem);
    if (newValue) {
      onQrItemChange({ ...emptyQrItem, answer: [{ valueDateTime: newValue.format() }] });
    } else {
      onQrItemChange(emptyQrItem);
    }
  }

  if (isRepeated) {
    return (
      <DateTimeField
        value={dateTimeDayJs}
        displayPrompt={displayPrompt}
        entryFormat={entryFormat}
        readOnly={readOnly}
        onDateTimeChange={handleDateTimeChange}
        isTabled={isTabled}
      />
    );
  }

  return (
    <FullWidthFormComponentBox data-test="q-item-date-time-box">
      <FieldGrid qItem={qItem} displayInstructions={displayInstructions}>
        <DateTimeField
          value={dateTimeDayJs}
          displayPrompt={displayPrompt}
          entryFormat={entryFormat}
          readOnly={readOnly}
          onDateTimeChange={handleDateTimeChange}
          isTabled={isTabled}
        />
      </FieldGrid>
    </FullWidthFormComponentBox>
  );
}

export default DateTimeItem;
