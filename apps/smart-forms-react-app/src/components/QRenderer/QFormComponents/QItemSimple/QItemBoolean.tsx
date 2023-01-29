import React, { useContext, useEffect } from 'react';
import { Checkbox, FormControlLabel, Grid } from '@mui/material';

import {
  PropsWithIsRepeatedAttribute,
  PropsWithQrItemChangeHandler
} from '../../../../interfaces/Interfaces';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import { createQrItem } from '../../../../functions/QrItemFunctions';
import { EnableWhenContext } from '../../../../custom-contexts/EnableWhenContext';
import QItemDisplayInstructions from './QItemDisplayInstructions';
import QItemLabel from '../QItemParts/QItemLabel';
import { FullWidthFormComponentBox } from '../../../StyledComponents/Boxes.styles';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithIsRepeatedAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemBoolean(props: Props) {
  const { qItem, qrItem, isRepeated, onQrItemChange } = props;
  const enableWhenContext = useContext(EnableWhenContext);
  const enableWhenLinkMap = { ...enableWhenContext.linkMap };

  const qrBoolean = qrItem ? qrItem : createQrItem(qItem);
  const valueBoolean = qrBoolean['answer'] ? qrBoolean['answer'][0].valueBoolean : false;

  useEffect(() => {
    // if boolean item is an enableWhen linked question and it does not have an answer yet
    // set default answer to false - to trigger enableWhen == false
    if (qItem.linkId in enableWhenLinkMap && !qrBoolean['answer']) {
      onQrItemChange({ ...qrBoolean, answer: [{ valueBoolean: false }] });
    }
  }, []);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    onQrItemChange({ ...qrBoolean, answer: [{ valueBoolean: event.target.checked }] });
  }

  const booleanInput = (
    <FormControlLabel
      control={<Checkbox checked={valueBoolean} onChange={handleChange} />}
      label=""
    />
  );

  const renderQItemBoolean = isRepeated ? (
    <>{booleanInput}</>
  ) : (
    <FullWidthFormComponentBox>
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <QItemLabel qItem={qItem} />
        </Grid>
        <Grid item xs={7}>
          {booleanInput}
          <QItemDisplayInstructions qItem={qItem} />
        </Grid>
      </Grid>
    </FullWidthFormComponentBox>
  );

  return <>{renderQItemBoolean}</>;
}

export default QItemBoolean;
