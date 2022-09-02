import React, { useState } from 'react';
import { TextField } from '@mui/material';
import { QuestionnaireItem } from '../../questionnaire/QuestionnaireModel';
import { QuestionnaireResponseItem } from '../../questionnaireResponse/QuestionnaireResponseModel';
import { PropsWithQrItemChangeHandler } from '../FormModel';
import { QuestionnaireResponseService } from '../../questionnaireResponse/QuestionnaireResponseService';

interface Props extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem> {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemDate(props: Props) {
  const { qItem, qrItem, onQrItemChange } = props;

  let qrDate = qrItem ? qrItem : QuestionnaireResponseService.createQrItem(qItem);

  const answerValue = qrDate['answer'] ? qrDate['answer'][0].valueDate : '';
  const [value, setValue] = useState(answerValue);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value);
    qrDate = { ...qrDate, text: qItem.text, answer: [{ valueDate: e.target.value }] };
    onQrItemChange(qrDate);
  }

  return (
    <div>
      <TextField id={qItem.linkId} type="date" value={value} onChange={handleChange} />
    </div>
  );
}

export default QItemDate;
