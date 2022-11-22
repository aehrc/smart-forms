import React from 'react';
import { FormControl, FormGroup, Grid, Typography } from '@mui/material';
import { CheckBoxOptionType, QItemChoiceOrientation } from '../../../../interfaces/Enums';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import { createQrItem } from '../../../../functions/QrItemFunctions';
import {
  PropsWithQrItemChangeHandler,
  PropsWithRepeatsAttribute
} from '../../../../interfaces/Interfaces';
import QItemCheckboxSingle from '../QItemParts/QItemCheckboxSingle';
import { getOpenLabelText } from '../../../../functions/ItemControlFunctions';
import QItemCheckboxSingleWithOpenLabel from '../QItemParts/QItemCheckboxSingleWithOpenLabel';
import { updateQrOpenChoiceCheckboxAnswers } from '../../../../functions/OpenChoiceFunctions';

interface QItemChoiceCheckboxProps
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithRepeatsAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
  orientation: QItemChoiceOrientation;
}

function QItemOpenChoiceCheckboxAnswerOption(props: QItemChoiceCheckboxProps) {
  const { qItem, qrItem, repeats, onQrItemChange, orientation } = props;

  const qrOpenChoiceCheckbox = qrItem ? qrItem : createQrItem(qItem);
  const answers = qrOpenChoiceCheckbox['answer'] ? qrOpenChoiceCheckbox['answer'] : [];

  const openLabelText = getOpenLabelText(qItem);

  function handleCheckedChange(changedValue: string) {
    const answerOptions = qItem.answerOption;
    if (!answerOptions) return null;

    const updatedQrChoiceCheckbox = updateQrOpenChoiceCheckboxAnswers(
      changedValue,
      answers,
      answerOptions,
      qrOpenChoiceCheckbox,
      CheckBoxOptionType.AnswerOption
    );

    if (updatedQrChoiceCheckbox) {
      onQrItemChange(updatedQrChoiceCheckbox);
    }
  }

  const openChoiceCheckbox = (
    <FormGroup row={orientation === QItemChoiceOrientation.Horizontal}>
      {qItem.answerOption?.map((option) => {
        if (option['valueCoding']) {
          return (
            <QItemCheckboxSingle
              key={option.valueCoding.code ?? ''}
              value={option.valueCoding.code ?? ''}
              label={option.valueCoding.display ?? `${option.valueCoding.code}`}
              isChecked={answers.some(
                (answer) => JSON.stringify(answer) === JSON.stringify(option)
              )}
              onCheckedChange={handleCheckedChange}
            />
          );
        } else if (option['valueString']) {
          return (
            <QItemCheckboxSingle
              key={option.valueString}
              value={option.valueString}
              label={option.valueString}
              isChecked={answers.some((answer) => answer.valueString === option.valueString)}
              onCheckedChange={handleCheckedChange}
            />
          );
        } else if (option['valueInteger']) {
          return (
            <QItemCheckboxSingle
              key={option.valueInteger}
              value={option.valueInteger.toString()}
              label={option.valueInteger.toString()}
              isChecked={answers.some((answer) => answer.valueInteger === option.valueInteger)}
              onCheckedChange={handleCheckedChange}
            />
          );
        }
      })}

      {openLabelText ? (
        <QItemCheckboxSingleWithOpenLabel
          value={openLabelText}
          label={openLabelText}
          isChecked={answers.some((answer) => answer.valueString === openLabelText)}
          onCheckedChange={handleCheckedChange}
        />
      ) : null}
    </FormGroup>
  );

  const renderQItemChoiceCheckbox = repeats ? (
    <>{openChoiceCheckbox}</>
  ) : (
    <FormControl>
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <Typography>{qItem.text}</Typography>
        </Grid>
        <Grid item xs={7}>
          {openChoiceCheckbox}
        </Grid>
      </Grid>
    </FormControl>
  );
  return <>{renderQItemChoiceCheckbox}</>;
}

export default QItemOpenChoiceCheckboxAnswerOption;
