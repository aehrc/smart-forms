import React, { useEffect, useState } from 'react';
import { FormControl, Grid, RadioGroup, Typography } from '@mui/material';
import {
  PropsWithQrItemChangeHandler,
  PropsWithRepeatsAttribute,
  QItemChoiceOrientation
} from '../FormModel';
import { Coding, QuestionnaireItem, QuestionnaireResponseItem, ValueSet } from 'fhir/r5';
import { findInAnswerValueSetCodings } from '../functions/ChoiceFunctions';
import QItemChoiceRadioSingle from './QItemChoiceRadioSingle';
import { createQrItem } from '../functions/QrItemFunctions';
import { AnswerValueSet } from '../AnswerValueSet';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithRepeatsAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
  orientation: QItemChoiceOrientation;
}

function QItemChoiceRadioAnswerValueSet(props: Props) {
  const { qItem, qrItem, repeats, onQrItemChange, orientation } = props;

  const qrChoiceRadio = qrItem ? qrItem : createQrItem(qItem);

  let valueRadio: string | undefined;
  if (qrChoiceRadio['answer']) {
    valueRadio = qrChoiceRadio['answer'][0].valueCoding?.code;
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

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (options.length > 0) {
      const qrAnswer = findInAnswerValueSetCodings(options, event.target.value);
      if (qrAnswer) {
        onQrItemChange({ ...qrChoiceRadio, answer: [{ valueCoding: qrAnswer }] });
      }
    }
  }

  const choiceRadio = (
    <RadioGroup
      row={orientation === QItemChoiceOrientation.Horizontal}
      name={qItem.text}
      id={qItem.id}
      onChange={handleChange}
      value={valueRadio ?? null}>
      {options.map((option) => {
        return (
          <QItemChoiceRadioSingle
            key={option.code ?? ''}
            value={option.code ?? ''}
            label={option.display ?? `${option.code}`}
          />
        );
      })}
    </RadioGroup>
  );

  const renderQItemChoiceRadio = repeats ? (
    <div>{choiceRadio}</div>
  ) : (
    <FormControl>
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <Typography>{qItem.text}</Typography>
        </Grid>
        <Grid item xs={7}>
          {choiceRadio}
        </Grid>
      </Grid>
    </FormControl>
  );
  return <div>{renderQItemChoiceRadio}</div>;
}

export default QItemChoiceRadioAnswerValueSet;
