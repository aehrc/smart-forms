import React, { useEffect, useState } from 'react';
import { Autocomplete, FormControl, Grid, TextField, Typography } from '@mui/material';
import { PropsWithQrItemChangeHandler, PropsWithRepeatsAttribute } from '../FormModel';
import { AnswerValueSet } from '../AnswerValueSet';
import { Coding, QuestionnaireItem, QuestionnaireResponseItem, ValueSet } from 'fhir/r5';
import { createQrItem } from '../functions/QrItemFunctions';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithRepeatsAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemChoiceSelectAnswerValueSet(props: Props) {
  const { qItem, qrItem, repeats, onQrItemChange } = props;

  const qrChoiceSelect = qrItem ? qrItem : createQrItem(qItem);

  let valueCoding: Coding | undefined;
  if (qrChoiceSelect['answer']) {
    valueCoding = qrChoiceSelect['answer'][0].valueCoding;
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

  function handleChange(event: any, newValue: Coding | null) {
    if (newValue) {
      onQrItemChange({
        ...qrChoiceSelect,
        answer: [{ valueCoding: newValue }]
      });
      return;
    }
    onQrItemChange(createQrItem(qItem));
  }

  const choiceSelectAnswerValueSet = (
    <Autocomplete
      id={qItem.id}
      options={options}
      getOptionLabel={(option) => `${option.display}`}
      value={valueCoding ?? null}
      onChange={handleChange}
      renderInput={(params) => <TextField {...params} sx={{ ...(repeats && { mb: 0 }) }} />}
    />
  );

  const renderQItemChoiceSelectAnswerValueSet = repeats ? (
    <div>{choiceSelectAnswerValueSet}</div>
  ) : (
    <FormControl>
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <Typography>{qItem.text}</Typography>
        </Grid>
        <Grid item xs={7}>
          {choiceSelectAnswerValueSet}
        </Grid>
      </Grid>
    </FormControl>
  );
  return <div>{renderQItemChoiceSelectAnswerValueSet}</div>;
}

export default QItemChoiceSelectAnswerValueSet;
