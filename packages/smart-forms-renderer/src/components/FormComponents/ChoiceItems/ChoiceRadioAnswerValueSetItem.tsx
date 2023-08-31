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

import type { ChangeEvent } from 'react';
import React from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { ChoiceItemOrientation } from '../../../interfaces/choice.enum';
import type { Coding, QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { findInAnswerValueSetCodings } from '../../../utils/choice';
import ChoiceRadioSingle from './ChoiceRadioSingle';
import { createEmptyQrItem } from '../../../utils/qrItem';
import { QRadioGroup } from '../Item.styles';
import { FullWidthFormComponentBox } from '../../Box.styles';
import useValueSetCodings from '../../../hooks/useValueSetCodings';
import useRenderingExtensions from '../../../hooks/useRenderingExtensions';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithQrItemChangeHandler
} from '../../../interfaces/renderProps.interface';
import { StyledAlert } from '../../Alert.styles';
import DisplayInstructions from '../DisplayItem/DisplayInstructions';
import LabelWrapper from '../ItemParts/ItemLabelWrapper';

interface ChoiceRadioAnswerValueSetItemProps
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithIsRepeatedAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
  orientation: ChoiceItemOrientation;
}

function ChoiceRadioAnswerValueSetItem(props: ChoiceRadioAnswerValueSetItemProps) {
  const { qItem, qrItem, isRepeated, onQrItemChange, orientation } = props;

  // Init input value
  const qrChoiceRadio = qrItem ?? createEmptyQrItem(qItem);

  let valueRadio: string | undefined;
  if (qrChoiceRadio.answer) {
    valueRadio = qrChoiceRadio.answer[0].valueCoding?.code;
  }

  // Get additional rendering extensions
  const { displayInstructions, readOnly } = useRenderingExtensions(qItem);

  // Get codings/options from valueSet
  const { codings, serverError } = useValueSetCodings(qItem);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    if (codings.length > 0) {
      const qrAnswer = findInAnswerValueSetCodings(codings, event.target.value);
      if (qrAnswer) {
        onQrItemChange({
          ...createEmptyQrItem(qItem),
          answer: [{ valueCoding: qrAnswer }]
        });
      }
    }
  }

  const choiceRadio =
    codings.length > 0 ? (
      <QRadioGroup
        row={orientation === ChoiceItemOrientation.Horizontal}
        name={qItem.text}
        id={qItem.id}
        onChange={handleChange}
        value={valueRadio ?? null}>
        {codings.map((coding: Coding) => {
          return (
            <ChoiceRadioSingle
              key={coding.code ?? ''}
              value={coding.code ?? ''}
              label={coding.display ?? `${coding.code}`}
              readOnly={readOnly}
            />
          );
        })}
      </QRadioGroup>
    ) : serverError ? (
      <StyledAlert color="error">
        <ErrorOutlineIcon color="error" sx={{ pr: 0.75 }} />
        <Typography variant="subtitle2">
          There was an error fetching options from the terminology server
        </Typography>
      </StyledAlert>
    ) : (
      <StyledAlert color="error">
        <ErrorOutlineIcon color="error" sx={{ pr: 0.75 }} />
        <Typography variant="subtitle2">
          Unable to fetch options from the questionnaire or launch context
        </Typography>
      </StyledAlert>
    );

  if (isRepeated) {
    return <>{choiceRadio}</>;
  }

  return (
    <FullWidthFormComponentBox data-test="q-item-choice-radio-answer-value-set-box">
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <LabelWrapper qItem={qItem} />
        </Grid>
        <Grid item xs={7}>
          {choiceRadio}
          <DisplayInstructions displayInstructions={displayInstructions} />
        </Grid>
      </Grid>
    </FullWidthFormComponentBox>
  );
}

export default ChoiceRadioAnswerValueSetItem;
