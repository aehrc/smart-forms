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

function QItemOpenChoiceAutocomplete(props: Props) {
  const { qItem, qrItem, repeats, onQrItemChange } = props;

  const qrOpenChoice = qrItem ? qrItem : createQrItem(qItem);

  let valueAutocomplete: Coding | string | undefined;
  if (qrOpenChoice['answer']) {
    const answer = qrOpenChoice['answer'][0];
    valueAutocomplete = answer.valueCoding ? answer.valueCoding : answer.valueString;
  }

  const [options, setOptions] = useState<Coding[]>([]);
  const [loading, setLoading] = useState(false);
  const answerValueSetUrl = qItem.answerValueSet;
  const maxlist = 10;

  function handleValueChange(event: any, newValue: Coding | string | null) {
    if (newValue) {
      if (typeof newValue === 'string') {
        onQrItemChange({ ...qrOpenChoice, answer: [{ valueString: newValue }] });
      } else {
        onQrItemChange({ ...qrOpenChoice, answer: [{ valueCoding: newValue }] });
      }
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
    handleValueChange(event, newInput);
  }

  const openChoiceAutocomplete = (
    <Autocomplete
      id={qItem.id}
      freeSolo
      value={valueAutocomplete ?? null}
      options={options}
      getOptionLabel={(option) => (typeof option === 'string' ? option : `${option.display}`)}
      onChange={handleValueChange}
      filterOptions={(x) => x}
      renderInput={(params) => (
        <TextField
          {...params}
          label={'Search ' + qItem.text?.toLowerCase() + '...'}
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

  const renderQItemOpenChoiceAutocomplete = repeats ? (
    <div>{openChoiceAutocomplete}</div>
  ) : (
    <FormControl>
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <Typography>{qItem.text}</Typography>
        </Grid>
        <Grid item xs={7}>
          {openChoiceAutocomplete}
        </Grid>
      </Grid>
    </FormControl>
  );
  return <div>{renderQItemOpenChoiceAutocomplete}</div>;
}

export default QItemOpenChoiceAutocomplete;
