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

import React, { SyntheticEvent } from 'react';
import { Autocomplete, CircularProgress, Grid, Typography } from '@mui/material';
import { Coding, QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';

import {
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithQrItemChangeHandler
} from '../../../../interfaces/Interfaces';
import { createEmptyQrItem } from '../../../../functions/QrItemFunctions';
import useValueSetAutocomplete from '../../../../custom-hooks/useValueSetAutocomplete';
import QItemDisplayInstructions from '../QItemSimple/QItemDisplayInstructions';
import QItemLabel from '../QItemParts/QItemLabel';
import { StandardTextField } from '../../../StyledComponents/Textfield.styles';
import { FullWidthFormComponentBox } from '../../../StyledComponents/Boxes.styles';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemChoiceAutocomplete(props: Props) {
  const { qItem, qrItem, isRepeated, isTabled, onQrItemChange } = props;
  const qrOpenChoice = qrItem ? qrItem : createEmptyQrItem(qItem);

  let valueCoding: Coding | undefined;
  if (qrOpenChoice['answer']) {
    valueCoding = qrOpenChoice['answer'][0].valueCoding;
  }

  const answerValueSetUrl = qItem.answerValueSet;
  if (!answerValueSetUrl) return null;

  const maxList = 10;

  const { options, loading, setLoading, searchResultsWithDebounce, serverError } =
    useValueSetAutocomplete(answerValueSetUrl, maxList);

  function handleValueChange(event: SyntheticEvent<Element, Event>, newValue: Coding | null) {
    if (newValue) {
      onQrItemChange({
        ...qrOpenChoice,
        answer: [{ valueCoding: newValue }]
      });
      return;
    }
    onQrItemChange(createEmptyQrItem(qItem));
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    setLoading(true);
    searchResultsWithDebounce(event.target.value);
  }

  const choiceAutocomplete = (
    <>
      <Autocomplete
        id={qItem.id}
        value={valueCoding ?? null}
        options={options}
        noOptionsText={'No results'}
        getOptionLabel={(option) => `${option.display}`}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        loading={loading}
        loadingText={'Fetching results...'}
        clearOnEscape
        autoHighlight
        fullWidth
        onChange={handleValueChange}
        filterOptions={(x) => x}
        renderInput={(params) => (
          <StandardTextField
            {...params}
            label={valueCoding ? '' : 'Search...'}
            onChange={handleInputChange}
            isTabled={isTabled}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              )
            }}
          />
        )}
      />

      {serverError ? (
        <Typography variant="subtitle2">
          There was an error fetching results from the terminology server.
        </Typography>
      ) : null}
    </>
  );

  const renderQItemChoiceAutocomplete = isRepeated ? (
    <>{choiceAutocomplete}</>
  ) : (
    <FullWidthFormComponentBox>
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <QItemLabel qItem={qItem} />
        </Grid>
        <Grid item xs={7}>
          {choiceAutocomplete}
          <QItemDisplayInstructions qItem={qItem} />
        </Grid>
      </Grid>
    </FullWidthFormComponentBox>
  );
  return <>{renderQItemChoiceAutocomplete}</>;
}

export default QItemChoiceAutocomplete;
