import React, { useEffect, useState } from 'react';
import { Autocomplete, FormControl, Grid, TextField, Typography } from '@mui/material';
import { PropsWithQrItemChangeHandler, PropsWithRepeatsAttribute } from '../FormModel';
import { AnswerValueSet } from '../AnswerValueSet';
import { QuestionnaireResponseService } from '../QuestionnaireResponseService';
import { Coding, QuestionnaireItem, QuestionnaireResponseItem, ValueSet } from 'fhir/r5';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithRepeatsAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemOpenChoiceSelectAnswerValueSet(props: Props) {
  const { qItem, qrItem, repeats, onQrItemChange } = props;

  const qrOpenChoice = qrItem ? qrItem : QuestionnaireResponseService.createQrItem(qItem);

  let valueSelect: Coding | undefined = undefined;
  if (qrOpenChoice['answer']) {
    valueSelect = qrOpenChoice['answer'][0].valueCoding;
  }

  const [options, setOptions] = useState<Coding[]>([]);

  // get options from answerValueSet on render
  useEffect(() => {
    const valueSetUrl = qItem.answerValueSet;
    if (!valueSetUrl) return;

    // set options from cached answer options if present
    const cachedAnswerOptions = AnswerValueSet.cache[valueSetUrl];
    if (cachedAnswerOptions) {
      setOptions(cachedAnswerOptions);
      return;
    }

    // get options from ontoserver and cache them for future use
    AnswerValueSet.expand(valueSetUrl, (newOptions: ValueSet) => {
      const contains = newOptions.expansion?.contains;
      if (contains) {
        const answerOptions = AnswerValueSet.getValueCodings(contains);
        AnswerValueSet.cache[valueSetUrl] = answerOptions;
        setOptions(answerOptions);
      }
    });
  }, [qItem]);

  function handleValueChange(event: any, newValue: Coding | string | null) {
    if (newValue) {
      if (typeof newValue === 'string') {
        onQrItemChange({ ...qrOpenChoice, answer: [{ valueString: newValue }] });
      } else {
        onQrItemChange({ ...qrOpenChoice, answer: [{ valueCoding: newValue }] });
      }
      return;
    }
    onQrItemChange(QuestionnaireResponseService.createQrItem(qItem));
  }

  const openChoiceSelectAnswerValueSet = (
    <Autocomplete
      id={qItem.id}
      freeSolo
      value={valueSelect ?? null}
      options={options}
      getOptionLabel={(option) => (typeof option === 'string' ? option : `${option.display}`)}
      onChange={handleValueChange}
      onInputChange={(event, newValue) => handleValueChange(event, newValue)}
      renderInput={(params) => <TextField {...params} sx={{ ...(repeats && { mb: 0 }) }} />}
    />
  );

  const renderQItemOpenChoiceSelectAnswerValueSet = repeats ? (
    <div>{openChoiceSelectAnswerValueSet}</div>
  ) : (
    <FormControl>
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <Typography>{qItem.text}</Typography>
        </Grid>
        <Grid item xs={7}>
          {openChoiceSelectAnswerValueSet}
        </Grid>
      </Grid>
    </FormControl>
  );
  return <div>{renderQItemOpenChoiceSelectAnswerValueSet}</div>;
}

export default QItemOpenChoiceSelectAnswerValueSet;
