/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { ChangeEvent } from 'react';
import { memo, useContext, useEffect, useState } from 'react';
import { Checkbox, FormControlLabel, Grid } from '@mui/material';

import type {
  PropsWithIsRepeatedAttribute,
  PropsWithQrItemChangeHandler
} from '../../../../../interfaces/Interfaces';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { EnableWhenContext } from '../../../../../custom-contexts/EnableWhenContext';
import QItemDisplayInstructions from './QItemDisplayInstructions';
import QItemLabel from '../QItemParts/QItemLabel';
import { FullWidthFormComponentBox } from '../../../../StyledComponents/Boxes.styles';
import useRenderingExtensions from '../../../../../custom-hooks/useRenderingExtensions';
import { createEmptyQrItem } from '../../../../../functions/QrItemFunctions';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithIsRepeatedAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemBoolean(props: Props) {
  const { qItem, qrItem, isRepeated, onQrItemChange } = props;

  // Init input value
  const qrBoolean = qrItem ?? createEmptyQrItem(qItem);
  const valueBoolean = qrBoolean['answer'] ? qrBoolean['answer'][0].valueBoolean : false;
  const [isChecked, setIsChecked] = useState(valueBoolean);

  // Get additional rendering extensions
  const { displayInstructions, readOnly } = useRenderingExtensions(qItem);

  // Trigger enableWhen on init - special case
  const { linkMap } = useContext(EnableWhenContext);
  useEffect(() => {
    // if boolean item is an enableWhen linked question and it does not have an answer yet
    // set default answer to false - to trigger enableWhen == false
    if (qItem.linkId in linkMap && !qrBoolean.answer) {
      setIsChecked(false);
      onQrItemChange({ ...createEmptyQrItem(qItem), answer: [{ valueBoolean: false }] });
    }
  }, []); // Only run effect on init

  // Event handlers
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setIsChecked(event.target.checked);
    onQrItemChange({
      ...createEmptyQrItem(qItem),
      answer: [{ valueBoolean: event.target.checked }]
    });
  }

  const booleanInput = (
    <FormControlLabel
      disabled={readOnly}
      control={<Checkbox checked={isChecked} onChange={handleChange} />}
      label=""
    />
  );

  const renderQItemBoolean = isRepeated ? (
    <>{booleanInput}</>
  ) : (
    <FullWidthFormComponentBox data-test="q-item-boolean-box">
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <QItemLabel qItem={qItem} />
        </Grid>
        <Grid item xs={7}>
          {booleanInput}
          <QItemDisplayInstructions displayInstructions={displayInstructions} />
        </Grid>
      </Grid>
    </FullWidthFormComponentBox>
  );

  return <>{renderQItemBoolean}</>;
}

export default memo(QItemBoolean);
