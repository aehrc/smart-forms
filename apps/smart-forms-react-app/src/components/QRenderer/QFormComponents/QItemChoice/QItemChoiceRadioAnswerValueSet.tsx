import React from 'react';
import { FormControl, Grid, Typography } from '@mui/material';
import { QItemChoiceOrientation } from '../../../../interfaces/Enums';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import { findInAnswerValueSetCodings } from '../../../../functions/ChoiceFunctions';
import QItemChoiceRadioSingle from './QItemChoiceRadioSingle';
import { createQrItem } from '../../../../functions/QrItemFunctions';
import {
  PropsWithQrItemChangeHandler,
  PropsWithRepeatsAttribute
} from '../../../../interfaces/Interfaces';
import useValueSetOptions from '../../../../custom-hooks/useValueSetOptions';
import { QRadioGroup } from '../../../StyledComponents/Item.styles';
import QItemDisplayInstructions from '../QItemSimple/QItemDisplayInstructions';
import QItemLabel from '../QItemParts/QItemLabel';

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

  const { options, serverError } = useValueSetOptions(qItem);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (options.length > 0) {
      const qrAnswer = findInAnswerValueSetCodings(options, event.target.value);
      if (qrAnswer) {
        onQrItemChange({ ...qrChoiceRadio, answer: [{ valueCoding: qrAnswer }] });
      }
    }
  }

  const choiceRadio =
    options.length > 0 ? (
      <QRadioGroup
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
      </QRadioGroup>
    ) : serverError ? (
      <Typography variant="subtitle2">
        There was an error fetching options from the terminology server.
      </Typography>
    ) : (
      <Typography variant="subtitle2">
        Unable to fetch options, contained resources not found in questionnaire.
      </Typography>
    );

  const renderQItemChoiceRadio = repeats ? (
    <>{choiceRadio}</>
  ) : (
    <FormControl>
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <QItemLabel qItem={qItem} />
        </Grid>
        <Grid item xs={7}>
          {choiceRadio}
          <QItemDisplayInstructions qItem={qItem} />
        </Grid>
      </Grid>
    </FormControl>
  );
  return <>{renderQItemChoiceRadio}</>;
}

export default QItemChoiceRadioAnswerValueSet;
