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
import { Grid, Typography } from '@mui/material';
import { QItemChoiceOrientation } from '../../../../types/choice.enum.ts';
import type { Coding, QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { findInAnswerValueSetCodings } from '../../../../utils/choice.ts';
import QItemChoiceRadioSingle from './QItemChoiceRadioSingle.tsx';
import { createEmptyQrItem } from '../../../../utils/qrItem.ts';
import { QRadioGroup } from '../Item.styles.tsx';
import { FullWidthFormComponentBox } from '../../../../../../components/Box/Box.styles.tsx';
import useValueSetCodings from '../../../../hooks/useValueSetCodings.ts';
import useRenderingExtensions from '../../../../hooks/useRenderingExtensions.ts';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithQrItemChangeHandler
} from '../../../../types/renderProps.interface.ts';
import { StyledAlert } from '../../../../../../components/Nav/Nav.styles.ts';
import DisplayInstructions from '../DisplayItem/DisplayInstructions.tsx';
import LabelWrapper from '../QItemParts/LabelWrapper.tsx';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithIsRepeatedAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
  orientation: QItemChoiceOrientation;
}

function QItemChoiceRadioAnswerValueSet(props: Props) {
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
        row={orientation === QItemChoiceOrientation.Horizontal}
        name={qItem.text}
        id={qItem.id}
        onChange={handleChange}
        value={valueRadio ?? null}>
        {codings.map((coding: Coding) => {
          return (
            <QItemChoiceRadioSingle
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

  const renderQItemChoiceRadio = isRepeated ? (
    <>{choiceRadio}</>
  ) : (
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
  return <>{renderQItemChoiceRadio}</>;
}

export default QItemChoiceRadioAnswerValueSet;
