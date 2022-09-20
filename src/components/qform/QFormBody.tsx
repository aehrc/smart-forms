import React from 'react';
import { Card, Typography } from '@mui/material';
import QItemGroup from './qform-components/QItemGroup';
import { PropsWithQrItemChangeHandler, QItemType } from './FormModel';
import { QuestionnaireResponseService } from './QuestionnaireResponseService';
import { getQrItemsIndex, mapQItemsIndex } from './functions/IndexFunctions';
import QItemSwitcher from './qform-components/QItemSwitcher';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';

interface Props extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem> {
  qForm: QuestionnaireItem;
  qrForm: QuestionnaireResponseItem;
}

function QFormBody(props: Props) {
  const { qForm, qrForm, onQrItemChange } = props;
  const indexMap: Record<string, number> = mapQItemsIndex(qForm);

  function handleQrGroupChange(qrItem: QuestionnaireResponseItem) {
    QuestionnaireResponseService.updateLinkedItem(qrItem, qrForm, indexMap);
    onQrItemChange(qrForm);
  }

  const qFormItems = qForm.item;
  const qrFormItems = qrForm.item;

  if (qFormItems && qrFormItems) {
    const qrFormItemsByIndex = getQrItemsIndex(qFormItems, qrFormItems);

    return (
      <div>
        <Card>
          <Typography variant="h5" component="h1" sx={{ mb: 2 }}>
            {qForm.text}
          </Typography>
          {qFormItems.map((qItem: QuestionnaireItem, i) => {
            const qrItem = qrFormItemsByIndex[i];
            if (qItem.type === QItemType.Group) {
              return (
                <QItemGroup
                  key={qItem.linkId}
                  qItem={qItem}
                  qrItem={qrItem}
                  repeats={qItem.repeats ?? false}
                  groupCardElevation={1}
                  onQrItemChange={handleQrGroupChange}></QItemGroup>
              );
            } else {
              return (
                <QItemSwitcher
                  key={qItem.linkId}
                  qItem={qItem}
                  qrItem={qrItem}
                  repeats={qItem.repeats ?? false}
                  onQrItemChange={handleQrGroupChange}></QItemSwitcher>
              );
            }
          })}
        </Card>
      </div>
    );
  } else {
    return <div>Unable to load form</div>;
  }
}

export default QFormBody;
