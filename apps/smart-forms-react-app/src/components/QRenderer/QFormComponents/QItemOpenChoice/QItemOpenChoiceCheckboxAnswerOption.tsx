import React, { useState } from 'react';
import { Grid } from '@mui/material';
import { CheckBoxOptionType, QItemChoiceOrientation } from '../../../../interfaces/Enums';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import { createQrItem } from '../../../../functions/QrItemFunctions';
import {
  PropsWithQrItemChangeHandler,
  PropsWithIsRepeatedAttribute
} from '../../../../interfaces/Interfaces';
import QItemCheckboxSingle from '../QItemParts/QItemCheckboxSingle';
import { getOpenLabelText } from '../../../../functions/ItemControlFunctions';
import QItemCheckboxSingleWithOpenLabel from '../QItemParts/QItemCheckboxSingleWithOpenLabel';
import { QFormGroup } from '../../../StyledComponents/Item.styles';
import QItemDisplayInstructions from '../QItemSimple/QItemDisplayInstructions';
import QItemLabel from '../QItemParts/QItemLabel';
import { updateQrOpenChoiceCheckboxAnswers } from '../../../../functions/OpenChoiceFunctions';
import { FullWidthFormComponentBox } from '../../../StyledComponents/Boxes.styles';

interface QItemOpenChoiceCheckboxProps
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithIsRepeatedAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
  orientation: QItemChoiceOrientation;
}

function QItemOpenChoiceCheckboxAnswerOption(props: QItemOpenChoiceCheckboxProps) {
  const { qItem, qrItem, isRepeated, onQrItemChange, orientation } = props;

  const qrOpenChoiceCheckbox = qrItem ? qrItem : createQrItem(qItem);
  const answers = qrOpenChoiceCheckbox['answer'] ? qrOpenChoiceCheckbox['answer'] : [];

  const openLabelText = getOpenLabelText(qItem);
  const [openLabelValue, setOpenLabelValue] = useState<string>('');
  const [openLabelChecked, setOpenLabelChecked] = useState<boolean>(false);

  function handleValueChange(
    changedOptionValue: string | null,
    changedOpenLabelValue: string | null
  ) {
    const answerOptions = qItem.answerOption;
    if (!answerOptions) return null;

    let updatedQrChoiceCheckbox: QuestionnaireResponseItem | null = null;
    if (changedOptionValue) {
      updatedQrChoiceCheckbox = updateQrOpenChoiceCheckboxAnswers(
        changedOptionValue,
        null,
        answers,
        answerOptions,
        qrOpenChoiceCheckbox,
        CheckBoxOptionType.AnswerOption,
        isRepeated
      );
    } else if (changedOpenLabelValue) {
      updatedQrChoiceCheckbox = updateQrOpenChoiceCheckboxAnswers(
        null,
        changedOpenLabelValue,
        answers,
        answerOptions,
        qrOpenChoiceCheckbox,
        CheckBoxOptionType.AnswerOption,
        isRepeated
      );
    }

    if (updatedQrChoiceCheckbox) {
      onQrItemChange(updatedQrChoiceCheckbox);
    }
  }

  const openChoiceCheckbox = (
    <QFormGroup row={orientation === QItemChoiceOrientation.Horizontal}>
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
              onCheckedChange={(changedValue) => handleValueChange(changedValue, null)}
            />
          );
        } else if (option['valueString']) {
          return (
            <QItemCheckboxSingle
              key={option.valueString}
              value={option.valueString}
              label={option.valueString}
              isChecked={answers.some((answer) => answer.valueString === option.valueString)}
              onCheckedChange={(changedValue) => handleValueChange(changedValue, null)}
            />
          );
        } else if (option['valueInteger']) {
          return (
            <QItemCheckboxSingle
              key={option.valueInteger}
              value={option.valueInteger.toString()}
              label={option.valueInteger.toString()}
              isChecked={answers.some((answer) => answer.valueInteger === option.valueInteger)}
              onCheckedChange={(changedValue) => handleValueChange(changedValue, null)}
            />
          );
        }
      })}

      {openLabelText ? (
        <QItemCheckboxSingleWithOpenLabel
          value={openLabelValue}
          label={openLabelText}
          isChecked={openLabelChecked}
          onCheckedChange={(checked) => {
            handleValueChange(null, openLabelValue);
            setOpenLabelChecked(checked);
          }}
          onInputChange={(input) => {
            handleValueChange(null, input);
            setOpenLabelValue(input);
          }}
        />
      ) : null}
    </QFormGroup>
  );

  return (
    <FullWidthFormComponentBox>
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <QItemLabel qItem={qItem} />
        </Grid>
        <Grid item xs={7}>
          {openChoiceCheckbox}
          <QItemDisplayInstructions qItem={qItem} />
        </Grid>
      </Grid>
    </FullWidthFormComponentBox>
  );
}

export default QItemOpenChoiceCheckboxAnswerOption;
