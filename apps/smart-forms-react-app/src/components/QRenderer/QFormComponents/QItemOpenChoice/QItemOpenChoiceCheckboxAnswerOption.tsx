import React, { useState } from 'react';
import { FormControl, Grid } from '@mui/material';
import { CheckBoxOptionType, QItemChoiceOrientation } from '../../../../interfaces/Enums';
import {
  QuestionnaireItem,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer
} from 'fhir/r5';
import { createQrItem } from '../../../../functions/QrItemFunctions';
import {
  PropsWithQrItemChangeHandler,
  PropsWithRepeatsAttribute
} from '../../../../interfaces/Interfaces';
import QItemCheckboxSingle from '../QItemParts/QItemCheckboxSingle';
import { getOpenLabelText } from '../../../../functions/ItemControlFunctions';
import QItemCheckboxSingleWithOpenLabel from '../QItemParts/QItemCheckboxSingleWithOpenLabel';
import { updateQrCheckboxAnswers } from '../../../../functions/ChoiceFunctions';
import { QFormGroup } from '../../../StyledComponents/Item.styles';
import QItemDisplayInstructions from '../QItemSimple/QItemDisplayInstructions';
import QItemLabel from '../QItemParts/QItemLabel';

interface QItemOpenChoiceCheckboxProps
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithRepeatsAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
  orientation: QItemChoiceOrientation;
}

function QItemOpenChoiceCheckboxAnswerOption(props: QItemOpenChoiceCheckboxProps) {
  const { qItem, qrItem, repeats, onQrItemChange, orientation } = props;

  const qrOpenChoiceCheckbox = qrItem ? qrItem : createQrItem(qItem);
  const answers = qrOpenChoiceCheckbox['answer'] ? qrOpenChoiceCheckbox['answer'] : [];

  const openLabelText = getOpenLabelText(qItem);
  const [openLabelValue, setOpenLabelValue] = useState<string>('');
  const [openLabelChecked, setOpenLabelChecked] = useState<boolean>(false);

  function handleCheckedChange(changedValue: string) {
    setOpenLabelChecked(false);
    const answerOptions = qItem.answerOption;
    if (!answerOptions) return null;

    const updatedQrChoiceCheckbox = updateQrCheckboxAnswers(
      changedValue,
      answers,
      answerOptions,
      qrOpenChoiceCheckbox,
      CheckBoxOptionType.AnswerOption,
      repeats
    );

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
          value={openLabelValue}
          label={openLabelText}
          isChecked={openLabelChecked}
          onCheckedChange={(checked) => {
            const updatedAnswer: QuestionnaireResponseItemAnswer = { valueString: openLabelValue };
            onQrItemChange({ ...qrOpenChoiceCheckbox, answer: [updatedAnswer] });
            setOpenLabelChecked(checked);
          }}
          onInputChange={(input) => {
            const updatedAnswer: QuestionnaireResponseItemAnswer = { valueString: input };
            onQrItemChange({ ...qrOpenChoiceCheckbox, answer: [updatedAnswer] });
            setOpenLabelValue(input);
          }}
        />
      ) : null}
    </QFormGroup>
  );

  const renderQItemChoiceCheckbox = repeats ? (
    <>{openChoiceCheckbox}</>
  ) : (
    <FormControl>
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <QItemLabel qItem={qItem} />
        </Grid>
        <Grid item xs={7}>
          {openChoiceCheckbox}
          <QItemDisplayInstructions qItem={qItem} />
        </Grid>
      </Grid>
    </FormControl>
  );
  return <>{renderQItemChoiceCheckbox}</>;
}

export default QItemOpenChoiceCheckboxAnswerOption;
