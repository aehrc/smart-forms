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

import type { ChangeEvent, SyntheticEvent } from 'react';
import React, { useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import Fade from '@mui/material/Fade';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import type { Coding, QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';

import { createEmptyQrItem } from '../../../utils/qrItem';
import { StandardTextField } from '../Textfield.styles';
import { FullWidthFormComponentBox } from '../../Box.styles';
import SearchIcon from '@mui/icons-material/Search';
import useDebounce from '../../../hooks/useDebounce';
import useTerminologyServerQuery from '../../../hooks/useTerminologyServerQuery';
import InfoIcon from '@mui/icons-material/Info';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DoneIcon from '@mui/icons-material/Done';
import ErrorIcon from '@mui/icons-material/Error';
import useRenderingExtensions from '../../../hooks/useRenderingExtensions';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithQrItemChangeHandler
} from '../../../interfaces/renderProps.interface';
import { AUTOCOMPLETE_DEBOUNCE_DURATION } from '../../../utils/debounce';
import DisplayInstructions from '../DisplayItem/DisplayInstructions';
import LabelWrapper from '../ItemParts/ItemLabelWrapper';

interface ChoiceAutocompleteItemProps
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function ChoiceAutocompleteItem(props: ChoiceAutocompleteItemProps) {
  const { qItem, qrItem, isRepeated, isTabled, onQrItemChange } = props;
  const qrChoice = qrItem ?? createEmptyQrItem(qItem);

  // Init input value
  let valueCoding: Coding | undefined;
  if (qrChoice.answer) {
    valueCoding = qrChoice.answer[0].valueCoding;
  }

  // Get additional rendering extensions
  const { displayUnit, displayPrompt, displayInstructions, readOnly, entryFormat } =
    useRenderingExtensions(qItem);

  const maxList = 10;

  const [input, setInput] = useState('');
  const debouncedInput = useDebounce(input, AUTOCOMPLETE_DEBOUNCE_DURATION);

  const { options, loading, feedback } = useTerminologyServerQuery(
    qItem,
    maxList,
    input,
    debouncedInput
  );

  if (!qItem.answerValueSet) {
    return null;
  }

  // Event handlers
  function handleValueChange(_: SyntheticEvent<Element, Event>, newValue: Coding | null) {
    if (newValue === null) {
      setInput('');
      onQrItemChange(createEmptyQrItem(qItem));
      return;
    }

    onQrItemChange({
      ...createEmptyQrItem(qItem),
      answer: [{ valueCoding: newValue }]
    });
  }

  const choiceAutocomplete = (
    <>
      <Autocomplete
        id={qItem.id}
        value={valueCoding ?? null}
        placeholder={entryFormat}
        options={options}
        getOptionLabel={(option) => `${option.display}`}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        disabled={readOnly}
        loading={loading}
        loadingText={'Fetching results...'}
        clearOnEscape
        autoHighlight
        onChange={handleValueChange}
        sx={{ maxWidth: !isTabled ? 280 : 3000, minWidth: 160, flexGrow: 1 }}
        filterOptions={(x) => x}
        renderInput={(params) => (
          <StandardTextField
            {...params}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
            isTabled={isTabled}
            label={displayPrompt}
            size="small"
            InputProps={{
              ...params.InputProps,

              startAdornment: (
                <>
                  {!valueCoding ? <SearchIcon fontSize="small" sx={{ ml: 0.5 }} /> : null}
                  {params.InputProps.startAdornment}
                </>
              ),
              endAdornment: (
                <>
                  {loading ? (
                    <CircularProgress color="inherit" size={16} />
                  ) : feedback ? (
                    <Fade in={!!feedback} timeout={300}>
                      <Tooltip title={feedback.message} arrow sx={{ ml: 1 }}>
                        {
                          {
                            info: <InfoIcon fontSize="small" color="info" />,
                            warning: <WarningAmberIcon fontSize="small" color="warning" />,
                            success: <DoneIcon fontSize="small" color="success" />,
                            error: <ErrorIcon fontSize="small" color="error" />
                          }[feedback.color]
                        }
                      </Tooltip>
                    </Fade>
                  ) : null}
                  {params.InputProps.endAdornment}
                  {displayUnit}
                </>
              )
            }}
          />
        )}
      />
    </>
  );

  if (isRepeated) {
    return <>{choiceAutocomplete}</>;
  }

  return (
    <FullWidthFormComponentBox>
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <LabelWrapper qItem={qItem} />
        </Grid>
        <Grid item xs={7}>
          {choiceAutocomplete}
          <DisplayInstructions displayInstructions={displayInstructions} />
        </Grid>
      </Grid>
    </FullWidthFormComponentBox>
  );
}

export default ChoiceAutocompleteItem;
