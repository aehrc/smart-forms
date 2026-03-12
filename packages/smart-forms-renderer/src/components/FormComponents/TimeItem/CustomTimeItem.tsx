/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
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

import { useState } from 'react';
import type { BaseItemProps } from '../../../interfaces/renderProps.interface';
import { createEmptyQrItem, getQRItemId } from '../../../utils/qrItem';
import { FullWidthFormComponentBox } from '../../Box.styles';
import ItemFieldGrid from '../ItemParts/ItemFieldGrid';
import ItemLabel from '../ItemParts/ItemLabel';
import useReadOnly from '../../../hooks/useReadOnly';
import useTimeValidation from '../../../hooks/useTimeValidation';
import { useQuestionnaireStore } from '../../../stores';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import CustomTimeField from '../DateTimeItems/CustomDateTimeItem/CustomTimeField';
import { parseDateTimeToDisplayTime } from '../DateTimeItems/utils/parseTime';
import { validateTimeInput } from '../DateTimeItems/utils/parseTime';

function CustomTimeItem(props: BaseItemProps) {
  const {
    qItem,
    qrItem,
    isRepeated,
    isTabled,
    renderingExtensions,
    parentIsReadOnly,
    calcExpUpdated,
    onQrItemChange
  } = props;

  const onFocusLinkId = useQuestionnaireStore.use.onFocusLinkId();

  const readOnly = useReadOnly(qItem, parentIsReadOnly);
  const { displayPrompt, displayInstructions } = renderingExtensions;

  // Init input value
  const answerKey = getQRItemId(qrItem?.answer?.[0]?.id);
  let timeString: string | null = null;
  if (qrItem?.answer && qrItem?.answer[0].valueTime) {
    timeString = qrItem.answer[0].valueTime;
  }

  // Parse FHIR time (HH:mm:ss) to display format
  const timeDayJs: Dayjs | null = timeString ? dayjs(timeString, 'HH:mm:ss') : null;
  const { displayTime, displayPeriod, timeParseFail } = parseDateTimeToDisplayTime(timeDayJs);

  const [timeInput, setTimeInput] = useState(displayTime);
  const [periodInput, setPeriodInput] = useState(displayPeriod);

  // Perform validation checks
  const { timeFeedback, is24HourNotation } = useTimeValidation(
    timeInput,
    periodInput,
    timeParseFail
  );

  // Generate instruction ID if instructions exist and there's no feedback
  const instructionsId =
    displayInstructions && !timeFeedback ? `instructions-${qItem.linkId}` : undefined;

  function handleTimeInputChange(newTimeInput: string) {
    setTimeInput(newTimeInput);

    // Clear answer if input is empty
    if (newTimeInput === '') {
      onQrItemChange(createEmptyQrItem(qItem, answerKey));
      return;
    }

    // Validate and save if valid
    const { timeIsValid, is24HourNotation: is24Hour } = validateTimeInput(
      newTimeInput,
      periodInput
    );

    if (!timeIsValid) {
      return;
    }

    // Convert to FHIR format (HH:mm:ss)
    const fhirTime = convertToFhirTime(newTimeInput, periodInput, is24Hour);

    onQrItemChange({
      ...createEmptyQrItem(qItem, answerKey),
      answer: [{ id: answerKey, valueTime: fhirTime }]
    });
  }

  function handlePeriodChange(newPeriod: string) {
    setPeriodInput(newPeriod);

    // Only save if time input is valid
    const { timeIsValid, is24HourNotation: is24Hour } = validateTimeInput(timeInput, newPeriod);

    if (!timeIsValid) {
      return;
    }

    // Convert to FHIR format (HH:mm:ss)
    const fhirTime = convertToFhirTime(timeInput, newPeriod, is24Hour);

    onQrItemChange({
      ...createEmptyQrItem(qItem, answerKey),
      answer: [{ id: answerKey, valueTime: fhirTime }]
    });
  }

  // Helper function to convert display time to FHIR format
  function convertToFhirTime(
    timeInput: string,
    periodInput: string,
    is24HourNotation: boolean
  ): string {
    if (is24HourNotation) {
      // Already in 24-hour format
      return `${timeInput}:00`;
    }

    // Convert 12-hour format to 24-hour format
    const timePeriod = periodInput || 'AM';
    const timeDayJs = dayjs(`${timeInput} ${timePeriod}`, 'HH:mm A');
    return timeDayJs.format('HH:mm:ss');
  }

  if (isRepeated) {
    return (
      <CustomTimeField
        linkId={qItem.linkId}
        itemType={qItem.type}
        itemText={qItem.text}
        timeInput={timeInput}
        periodInput={periodInput}
        is24HourNotation={is24HourNotation}
        feedback={timeFeedback ?? ''}
        displayPrompt={displayPrompt}
        readOnly={readOnly}
        calcExpUpdated={calcExpUpdated}
        isPartOfDateTime={false}
        isTabled={isTabled}
        instructionsId={instructionsId}
        onTimeInputChange={handleTimeInputChange}
        onPeriodChange={handlePeriodChange}
      />
    );
  }

  return (
    <FullWidthFormComponentBox
      data-test="q-item-time-box"
      data-linkid={qItem.linkId}
      data-label={qItem.text}
      onClick={() => onFocusLinkId(qItem.linkId)}>
      <ItemFieldGrid
        qItem={qItem}
        readOnly={readOnly}
        labelChildren={<ItemLabel qItem={qItem} readOnly={readOnly} />}
        fieldChildren={
          <CustomTimeField
            linkId={qItem.linkId}
            itemType={qItem.type}
            itemText={qItem.text}
            timeInput={timeInput}
            periodInput={periodInput}
            is24HourNotation={is24HourNotation}
            feedback={timeFeedback ?? ''}
            displayPrompt={displayPrompt}
            readOnly={readOnly}
            calcExpUpdated={calcExpUpdated}
            isPartOfDateTime={false}
            isTabled={isTabled}
            instructionsId={instructionsId}
            onTimeInputChange={handleTimeInputChange}
            onPeriodChange={handlePeriodChange}
          />
        }
        feedback={timeFeedback ?? undefined}
      />
    </FullWidthFormComponentBox>
  );
}

export default CustomTimeItem;
