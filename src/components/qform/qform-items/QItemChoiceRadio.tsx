import React from 'react';
import { Container, FormControl, Grid, RadioGroup, Typography } from '@mui/material';
import { PropsWithQrItemChangeHandler, QItemChoiceOrientation } from '../FormModel';
import { QuestionnaireResponseService } from '../../questionnaireResponse/QuestionnaireResponseService';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import { findInAnswerOptions, getQrChoiceValue } from './QItemChoiceFunctions';
import QItemChoiceRadioSingle from './QItemChoiceRadioSingle';

interface Props extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem> {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
  orientation: QItemChoiceOrientation;
}

function QItemChoiceRadio(props: Props) {
  const { qItem, qrItem, onQrItemChange, orientation } = props;

  const qrChoiceRadio = qrItem ? qrItem : QuestionnaireResponseService.createQrItem(qItem);
  const valueRadio = getQrChoiceValue(qrChoiceRadio);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (qItem.answerOption) {
      const qrAnswer = findInAnswerOptions(qItem.answerOption, e.target.value);
      if (qrAnswer) {
        onQrItemChange({ ...qrChoiceRadio, answer: [qrAnswer] });
      }
    }
  }

  return (
    <FormControl>
      <Grid container spacing={4}>
        <Grid item xs={5}>
          <Typography>{qItem.text}</Typography>
        </Grid>
        <Grid item xs={7}>
          <Container>
            <RadioGroup
              row={orientation === QItemChoiceOrientation.Horizontal}
              name={qItem.text}
              id={qItem.id}
              onChange={handleChange}
              value={valueRadio}>
              {qItem.answerOption?.map((option) => {
                if (option['valueCoding']) {
                  return (
                    <QItemChoiceRadioSingle
                      key={option.valueCoding.code}
                      value={option.valueCoding.code ?? ''}
                      label={option.valueCoding.display ?? ''}
                    />
                  );
                } else if (option['valueString']) {
                  return (
                    <QItemChoiceRadioSingle
                      key={option.valueString}
                      value={option.valueString}
                      label={option.valueString}
                    />
                  );
                } else if (option['valueInteger']) {
                  return (
                    <QItemChoiceRadioSingle
                      key={option.valueInteger}
                      value={option.valueInteger.toString()}
                      label={option.valueInteger.toString()}
                    />
                  );
                }
              })}
            </RadioGroup>
          </Container>
        </Grid>
      </Grid>
    </FormControl>
  );
}

export default QItemChoiceRadio;
