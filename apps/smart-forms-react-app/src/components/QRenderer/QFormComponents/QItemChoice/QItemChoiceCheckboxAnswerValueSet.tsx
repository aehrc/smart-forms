import React from 'react';
import { FormControl, FormGroup, Grid, Typography } from '@mui/material';

import {
  PropsWithQrItemChangeHandler,
  PropsWithRepeatsAttribute
} from '../../../../interfaces/Interfaces';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import { createQrItem } from '../../../../functions/QrItemFunctions';
import useValueSetOptions from '../../../../custom-hooks/useValueSetOptions';
import { CheckBoxOptionType, QItemChoiceOrientation } from '../../../../interfaces/Enums';
import { updateQrChoiceCheckboxAnswers } from '../../../../functions/ChoiceFunctions';
import QItemCheckboxSingle from '../QItemParts/QItemCheckboxSingle';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithRepeatsAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
  orientation: QItemChoiceOrientation;
}

function QItemChoiceCheckboxAnswerValueSet(props: Props) {
  const { qItem, qrItem, repeats, onQrItemChange, orientation } = props;

  const qrChoiceCheckbox = qrItem ? qrItem : createQrItem(qItem);
  const answers = qrChoiceCheckbox['answer'] ? qrChoiceCheckbox['answer'] : [];

  const [options] = useValueSetOptions(qItem);

  function handleCheckedChange(changedValue: string) {
    if (options.length < 1) return null;

    const updatedQrChoiceCheckbox = updateQrChoiceCheckboxAnswers(
      changedValue,
      answers,
      options,
      qrChoiceCheckbox,
      CheckBoxOptionType.AnswerValueSet
    );

    if (updatedQrChoiceCheckbox) {
      onQrItemChange(updatedQrChoiceCheckbox);
    }
  }

  const choiceCheckbox = (
    <FormGroup row={orientation === QItemChoiceOrientation.Horizontal}>
      {options.map((option) => {
        return (
          <QItemCheckboxSingle
            key={option.code ?? ''}
            value={option.code ?? ''}
            label={option.display ?? `${option.code}`}
            isChecked={answers.some((answer) => JSON.stringify(answer) === JSON.stringify(option))}
            onCheckedChange={handleCheckedChange}
          />
        );
      })}
    </FormGroup>
  );

  const renderQItemChoiceCheckbox = repeats ? (
    <>{choiceCheckbox}</>
  ) : (
    <FormControl>
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <Typography>{qItem.text}</Typography>
        </Grid>
        <Grid item xs={7}>
          {choiceCheckbox}
        </Grid>
      </Grid>
    </FormControl>
  );
  return <>{renderQItemChoiceCheckbox}</>;
}

export default QItemChoiceCheckboxAnswerValueSet;
