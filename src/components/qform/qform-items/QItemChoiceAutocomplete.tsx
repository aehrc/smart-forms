import React, { useEffect, useState } from 'react';
import {
  Autocomplete,
  CircularProgress,
  Container,
  FormControl,
  Grid,
  TextField,
  Typography
} from '@mui/material';
import { Coding, QuestionnaireItem, QuestionnaireResponseItem, ValueSet } from 'fhir/r5';
import { PropsWithQrItemChangeHandler, PropsWithRepeatsAttribute } from '../FormModel';
import { AnswerValueSet } from '../../questionnaire/AnswerValueSet';
import { QuestionnaireResponseService } from '../../questionnaireResponse/QuestionnaireResponseService';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithRepeatsAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemChoiceAutocomplete(props: Props) {
  const { qItem, qrItem, repeats, onQrItemChange } = props;

  const qrOpenChoice = qrItem ? qrItem : QuestionnaireResponseService.createQrItem(qItem);

  let valueCoding: Coding | undefined;
  if (qrOpenChoice['answer']) {
    valueCoding = qrOpenChoice['answer'][0].valueCoding;
  }

  const [value, setValue] = useState<Coding | null>(null);
  const [options, setOptions] = useState<Coding[]>([]);
  const [loading, setLoading] = useState(false);
  const answerValueSetUrl = qItem.answerValueSet;
  const maxlist = 10;

  useEffect(() => {
    if (valueCoding) {
      setValue(valueCoding);
    } else {
      setValue(null);
    }
  }, [qrItem]);

  function handleValueChange(event: any, newValue: Coding | null) {
    setValue(newValue);
    const newQrItem = newValue
      ? {
          ...qrOpenChoice,
          answer: [{ valueCoding: newValue }]
        }
      : QuestionnaireResponseService.createQrItem(qItem);
    onQrItemChange(newQrItem);
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
      value={value}
      options={options}
      getOptionLabel={(option) => option.display ?? ''}
      onChange={handleValueChange}
      filterOptions={(x) => x}
      renderInput={(params) => (
        <TextField
          {...params}
          label={'Search ' + qItem.text?.toLowerCase()}
          onChange={handleInputChange}
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
    <Container>{choiceAutocomplete}</Container>
  ) : (
    <FormControl>
      <Grid container spacing={4}>
        <Grid item xs={5}>
          <Typography>{qItem.text}</Typography>
        </Grid>
        <Grid item xs={7}>
          <Container>{choiceAutocomplete}</Container>
        </Grid>
      </Grid>
    </FormControl>
  );
  return <div>{renderQItemChoiceAutocomplete}</div>;
}

export default QItemChoiceAutocomplete;
