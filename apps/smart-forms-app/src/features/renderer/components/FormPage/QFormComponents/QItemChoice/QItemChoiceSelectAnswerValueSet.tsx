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
import { useEffect, useMemo } from 'react';
import { Autocomplete, Grid, Typography } from '@mui/material';

import type { Coding, QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { createEmptyQrItem } from '../../../../utils/qrItem.ts';
import LabelText from '../QItemParts/LabelText.tsx';
import { StandardTextField } from '../Textfield.styles.tsx';
import { FullWidthFormComponentBox } from '../../../../../../components/Box/Box.styles.tsx';
import useValueSetCodings from '../../../../hooks/useValueSetCodings.ts';
import useRenderingExtensions from '../../../../hooks/useRenderingExtensions.ts';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithQrItemChangeHandler
} from '../../../../types/renderProps.interface.ts';
import { StyledAlert } from '../../../../../../components/Nav/Nav.styles.ts';
import DisplayInstructions from '../DisplayItem/DisplayInstructions.tsx';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemChoiceSelectAnswerValueSet(props: Props) {
  const { qItem, qrItem, isRepeated, isTabled, onQrItemChange } = props;

  // Init input value
  const qrChoiceSelect = qrItem ?? createEmptyQrItem(qItem);
  let valueCoding: Coding | undefined;
  if (qrChoiceSelect.answer) {
    valueCoding = qrChoiceSelect.answer[0].valueCoding;
  }

  // Get additional rendering extensions
  const { displayUnit, displayPrompt, displayInstructions, readOnly, entryFormat } =
    useRenderingExtensions(qItem);

  // Get codings/options from valueSet
  const { codings, serverError } = useValueSetCodings(qItem);

  valueCoding = useMemo(() => {
    const updatedValueCoding = codings.find(
      (queriedCoding) => queriedCoding.code === valueCoding?.code
    );
    return updatedValueCoding ?? valueCoding;
  }, [codings, valueCoding]);

  // Check and remove populated answer if it is a string
  // NOTE: $populate will try to populate answer as valueCoding,
  //       but will fail if answer provided is not within options
  useEffect(
    () => {
      if (qrChoiceSelect.answer && qrChoiceSelect.answer[0].valueString) {
        onQrItemChange(createEmptyQrItem(qItem));
      }
    },
    // Only run effect once - on populate
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Event handlers
  function handleChange(_: SyntheticEvent<Element, Event>, newValue: Coding | null) {
    if (newValue) {
      onQrItemChange({
        ...createEmptyQrItem(qItem),
        answer: [{ valueCoding: newValue }]
      });
      return;
    }
    onQrItemChange(createEmptyQrItem(qItem));
  }

  const choiceSelectAnswerValueSet =
    codings.length > 0 ? (
      <Autocomplete
        id={qItem.id}
        options={codings}
        getOptionLabel={(option) => `${option.display}`}
        value={valueCoding ?? null}
        onChange={handleChange}
        openOnFocus
        autoHighlight
        sx={{ maxWidth: !isTabled ? 280 : 3000, flexGrow: 1 }}
        disabled={readOnly}
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
            data-test="q-item-choice-dropdown-answer-value-set-field"
          />
        )}
      />
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

  const renderQItemChoiceSelectAnswerValueSet = isRepeated ? (
    <>{choiceSelectAnswerValueSet}</>
  ) : (
    <FullWidthFormComponentBox data-test="q-item-choice-dropdown-answer-value-set-box">
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <LabelText qItem={qItem} />
        </Grid>
        <Grid item xs={7}>
          {choiceSelectAnswerValueSet}
          <DisplayInstructions displayInstructions={displayInstructions} />
        </Grid>
      </Grid>
    </FullWidthFormComponentBox>
  );
  return <>{renderQItemChoiceSelectAnswerValueSet}</>;
}

export default QItemChoiceSelectAnswerValueSet;
