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
import React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import type { Coding, QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { createEmptyQrItem } from '../../../utils/qrItem';
import { StandardTextField } from '../Textfield.styles';
import { FullWidthFormComponentBox } from '../../Box.styles';
import useValueSetCodings from '../../../hooks/useValueSetCodings';
import useRenderingExtensions from '../../../hooks/useRenderingExtensions';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithQrItemChangeHandler
} from '../../../interfaces/renderProps.interface';
import DisplayInstructions from '../DisplayItem/DisplayInstructions';
import LabelWrapper from '../ItemParts/ItemLabelWrapper';

interface OpenChoiceSelectAnswerValueSetItemProps
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function OpenChoiceSelectAnswerValueSetItem(props: OpenChoiceSelectAnswerValueSetItemProps) {
  const { qItem, qrItem, isRepeated, isTabled, onQrItemChange } = props;

  // Init input value
  const qrOpenChoice = qrItem ?? createEmptyQrItem(qItem);
  let valueSelect: Coding | undefined = undefined;
  if (qrOpenChoice['answer']) {
    valueSelect = qrOpenChoice['answer'][0].valueCoding;
  }

  // Get codings/options from valueSet
  const { codings, serverError } = useValueSetCodings(qItem);

  // Get additional rendering extensions
  const { displayUnit, displayPrompt, displayInstructions, readOnly, entryFormat } =
    useRenderingExtensions(qItem);

  // Event handlers
  function handleValueChange(_: SyntheticEvent<Element, Event>, newValue: Coding | string | null) {
    if (newValue) {
      if (typeof newValue === 'string') {
        onQrItemChange({
          ...qrOpenChoice,
          answer: [{ valueString: newValue }]
        });
      } else {
        onQrItemChange({
          ...qrOpenChoice,
          answer: [{ valueCoding: newValue }]
        });
      }
      return;
    }
    onQrItemChange(createEmptyQrItem(qItem));
  }

  const openChoiceSelectAnswerValueSet = (
    <>
      <Autocomplete
        id={qItem.id}
        value={valueSelect ?? null}
        options={codings}
        getOptionLabel={(option) => (typeof option === 'string' ? option : `${option.display}`)}
        onChange={handleValueChange}
        onInputChange={(event, newValue) => handleValueChange(event, newValue)}
        freeSolo
        autoHighlight
        sx={{ maxWidth: !isTabled ? 280 : 3000, minWidth: 160, flexGrow: 1 }}
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
      {serverError ? (
        <Typography variant="subtitle2">
          There was an error fetching options from the terminology server.
        </Typography>
      ) : null}
    </>
  );

  if (isRepeated) {
    return <>{openChoiceSelectAnswerValueSet}</>;
  }

  return (
    <FullWidthFormComponentBox>
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <LabelWrapper qItem={qItem} />
        </Grid>
        <Grid item xs={7}>
          {openChoiceSelectAnswerValueSet}
          <DisplayInstructions displayInstructions={displayInstructions} />
        </Grid>
      </Grid>
    </FullWidthFormComponentBox>
  );
}

export default OpenChoiceSelectAnswerValueSetItem;
