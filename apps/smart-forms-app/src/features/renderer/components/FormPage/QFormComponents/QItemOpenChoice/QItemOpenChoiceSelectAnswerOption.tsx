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

import type { SyntheticEvent } from 'react';
import { Autocomplete, Grid } from '@mui/material';

import type {
  QuestionnaireItem,
  QuestionnaireItemAnswerOption,
  QuestionnaireResponseItem
} from 'fhir/r4';
import { getAnswerOptionLabel } from '../../../../utils/openChoice.ts';
import { createEmptyQrItem } from '../../../../utils/qrItem.ts';
import { StandardTextField } from '../Textfield.styles.tsx';
import { FullWidthFormComponentBox } from '../../../../../../components/Box/Box.styles.tsx';
import useRenderingExtensions from '../../../../hooks/useRenderingExtensions.ts';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithQrItemChangeHandler
} from '../../../../types/renderProps.interface.ts';
import DisplayInstructions from '../DisplayItem/DisplayInstructions.tsx';
import LabelWrapper from '../QItemParts/LabelWrapper.tsx';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemOpenChoiceSelectAnswerOption(props: Props) {
  const { qItem, qrItem, isRepeated, isTabled, onQrItemChange } = props;

  // Get additional rendering extensions
  const { displayUnit, displayPrompt, displayInstructions, readOnly, entryFormat } =
    useRenderingExtensions(qItem);

  // Init input value
  const answerOptions = qItem.answerOption;
  if (!answerOptions) return null;

  const qrOpenChoice = qrItem ?? createEmptyQrItem(qItem);
  let valueSelect: QuestionnaireItemAnswerOption | undefined = undefined;
  if (qrOpenChoice.answer) {
    valueSelect = qrOpenChoice.answer[0];
  }

  // Event handlers
  function handleChange(
    _: SyntheticEvent<Element, Event>,
    newValue: QuestionnaireItemAnswerOption | string | null
  ) {
    if (newValue) {
      if (typeof newValue === 'string') {
        onQrItemChange({
          ...qrOpenChoice,
          answer: [{ valueString: newValue }]
        });
      } else {
        const option = newValue;
        if (option['valueCoding']) {
          onQrItemChange({
            ...qrOpenChoice,
            answer: [{ valueCoding: option.valueCoding }]
          });
        } else if (option['valueString']) {
          onQrItemChange({
            ...qrOpenChoice,
            answer: [{ valueString: option.valueString }]
          });
        } else if (option['valueInteger']) {
          onQrItemChange({
            ...qrOpenChoice,
            answer: [{ valueInteger: option.valueInteger }]
          });
        }
      }
      return;
    }
    onQrItemChange(createEmptyQrItem(qItem));
  }

  const openOpenChoiceSelectAnswerOption = (
    <Autocomplete
      id={qItem.id}
      value={valueSelect ?? null}
      options={answerOptions}
      getOptionLabel={(option) => getAnswerOptionLabel(option)}
      onChange={handleChange}
      freeSolo
      autoHighlight
      sx={{ maxWidth: !isTabled ? 280 : 3000, flexGrow: 1 }}
      disabled={readOnly}
      size="small"
      placeholder={entryFormat}
      renderInput={(params) => (
        <StandardTextField
          isTabled={isTabled}
          label={displayPrompt}
          {...params}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {params.InputProps.endAdornment}
                {displayUnit}
              </>
            )
          }}
        />
      )}
    />
  );
  const renderQItemOpenChoiceAutocomplete = isRepeated ? (
    <>{openOpenChoiceSelectAnswerOption}</>
  ) : (
    <FullWidthFormComponentBox data-test="q-item-open-choice-select-answer-option-box">
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <LabelWrapper qItem={qItem} />
        </Grid>
        <Grid item xs={7}>
          {openOpenChoiceSelectAnswerOption}
          <DisplayInstructions displayInstructions={displayInstructions} />
        </Grid>
      </Grid>
    </FullWidthFormComponentBox>
  );
  return <>{renderQItemOpenChoiceAutocomplete}</>;
}

export default QItemOpenChoiceSelectAnswerOption;
