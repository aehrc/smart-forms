import React, { useState } from 'react';
import {
  Autocomplete,
  CircularProgress,
  FormControl,
  Grid,
  TextField,
  Typography
} from '@mui/material';
import { Coding, QuestionnaireItem, QuestionnaireResponseItem, ValueSet } from 'fhir/r5';
import { PropsWithQrItemChangeHandler, PropsWithRepeatsAttribute } from '../FormModel';
import { AnswerValueSet } from '../AnswerValueSet';
import { createQrItem } from '../functions/QrItemFunctions';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithRepeatsAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemChoiceAutocomplete(props: Props) {
  const { qItem, qrItem, repeats, onQrItemChange } = props;
  const qrOpenChoice = qrItem ? qrItem : createQrItem(qItem);

  let valueCoding: Coding | undefined;
  if (qrOpenChoice['answer']) {
    valueCoding = qrOpenChoice['answer'][0].valueCoding;
  }

  const [options, setOptions] = useState<Coding[]>([]);
  const [loading, setLoading] = useState(false);
  const answerValueSetUrl = qItem.answerValueSet;
  const maxlist = 10;

  function handleValueChange(event: any, newValue: Coding | null) {
    if (newValue) {
      onQrItemChange({
        ...qrOpenChoice,
        answer: [{ valueCoding: newValue }]
      });
      return;
    }
    onQrItemChange(createQrItem(qItem));
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (!answerValueSetUrl) return;

    const newInput = event.target.value;

    // make no changes if input is less than 2 characters long
    if (newInput.length < 2) {
      setOptions([]);
      return;
    }

    const fullUrl = answerValueSetUrl + 'filter=' + newInput + '&count=' + maxlist;
    const cachedAnswerOptions = AnswerValueSet.cache[fullUrl];
    if (cachedAnswerOptions) {
      // set options from cached answer options
      setOptions(cachedAnswerOptions);
    } else {
      // expand valueSet, then set and cache answer options
      setLoading(true);
      AnswerValueSet.expand(fullUrl, (newOptions: ValueSet) => {
        const contains = newOptions.expansion?.contains;
        if (contains) {
          const answerOptions = AnswerValueSet.getValueCodings(contains);
          AnswerValueSet.cache[fullUrl] = answerOptions;
          setOptions(answerOptions);
        }
        setLoading(false);
      });
    }
  }

  const choiceAutocomplete = (
    <Autocomplete
      id={qItem.id}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      value={valueCoding ?? null}
      options={options}
      getOptionLabel={(option) => `${option.display}`}
      onChange={handleValueChange}
      filterOptions={(x) => x}
      renderInput={(params) => (
        <TextField
          {...params}
          label={valueCoding ? '' : 'Search ' + qItem.text?.toLowerCase() + '...'}
          onChange={handleInputChange}
          sx={{ ...(repeats && { mb: 0 }) }}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            )
          }}
        />
      )}
    />
  );

  const renderQItemChoiceAutocomplete = repeats ? (
    <div>{choiceAutocomplete}</div>
  ) : (
    <FormControl>
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <Typography>{qItem.text}</Typography>
        </Grid>
        <Grid item xs={7}>
          {choiceAutocomplete}
        </Grid>
      </Grid>
    </FormControl>
  );
  return <div>{renderQItemChoiceAutocomplete}</div>;
}

export default QItemChoiceAutocomplete;
