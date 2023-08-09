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

import type { SelectChangeEvent } from '@mui/material';
import { Grid, InputAdornment, MenuItem, Select } from '@mui/material';

import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { findInAnswerOptions, getQrChoiceValue } from '../../../../utils/choice.ts';
import { createEmptyQrItem } from '../../../../utils/qrItem.ts';
import { FullWidthFormComponentBox } from '../../../../../../components/Box/Box.styles.tsx';
import useRenderingExtensions from '../../../../hooks/useRenderingExtensions.ts';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithQrItemChangeHandler
} from '../../../../types/renderProps.interface.ts';
import DisplayInstructions from '../DisplayItem/DisplayInstructions.tsx';
import { Fragment } from 'react';
import LabelWrapper from '../QItemParts/LabelWrapper.tsx';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemChoiceSelectAnswerOption(props: Props) {
  const { qItem, qrItem, isRepeated, isTabled, onQrItemChange } = props;

  // Init input value
  const qrChoiceSelect = qrItem ?? createEmptyQrItem(qItem);
  let valueSelect = getQrChoiceValue(qrChoiceSelect);
  if (valueSelect === null) {
    valueSelect = '';
  }

  // Get additional rendering extensions
  const { displayUnit, displayPrompt, displayInstructions, readOnly, entryFormat } =
    useRenderingExtensions(qItem);

  // Event handlers
  function handleChange(e: SelectChangeEvent) {
    if (qItem.answerOption) {
      const qrAnswer = findInAnswerOptions(qItem.answerOption, e.target.value);
      if (qrAnswer) {
        onQrItemChange({ ...createEmptyQrItem(qItem), answer: [qrAnswer] });
        return;
      }
    }
    onQrItemChange(createEmptyQrItem(qItem));
  }

  const choiceSelectAnswerOption = (
    <Select
      id={qItem.id}
      name={qItem.text}
      value={valueSelect}
      disabled={readOnly}
      fullWidth
      placeholder={entryFormat}
      label={displayPrompt}
      endAdornment={<InputAdornment position={'end'}>{displayUnit}</InputAdornment>}
      sx={{ maxWidth: !isTabled ? 280 : 3000, minWidth: 160 }}
      size="small"
      onChange={handleChange}>
      {qItem.answerOption?.map((option, index) => {
        if (option['valueCoding']) {
          return (
            <MenuItem key={option.valueCoding.code} value={option.valueCoding.code}>
              {option.valueCoding.display ?? option.valueCoding.code}
            </MenuItem>
          );
        }

        if (option['valueString']) {
          return (
            <MenuItem key={option.valueString} value={option.valueString}>
              {option.valueString}
            </MenuItem>
          );
        }

        if (option['valueInteger']) {
          return (
            <MenuItem key={option.valueInteger} value={option.valueInteger.toString()}>
              {option.valueInteger}
            </MenuItem>
          );
        }

        return <Fragment key={index} />;
      })}
    </Select>
  );

  const renderQItemChoiceSelectAnswerOption = isRepeated ? (
    <>{choiceSelectAnswerOption}</>
  ) : (
    <FullWidthFormComponentBox data-test="q-item-choice-select-answer-option-box">
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <LabelWrapper qItem={qItem} />
        </Grid>
        <Grid item xs={7}>
          {choiceSelectAnswerOption}
          <DisplayInstructions displayInstructions={displayInstructions} />
        </Grid>
      </Grid>
    </FullWidthFormComponentBox>
  );
  return <>{renderQItemChoiceSelectAnswerOption}</>;
}

export default QItemChoiceSelectAnswerOption;
