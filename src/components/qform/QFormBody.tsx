import React from 'react';
import { Box, Typography } from '@mui/material';
import QItemGroup from './qform-components/QItemGroup';
import { PropsWithQrItemChangeHandler, QItemType } from './FormModel';
import { getQrItemsIndex, mapQItemsIndex } from './functions/IndexFunctions';
import QItemSwitcher from './qform-components/QItemSwitcher';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import { updateLinkedItem } from './functions/QrItemFunctions';

interface Props extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem> {
  qForm: QuestionnaireItem;
  qrForm: QuestionnaireResponseItem;
}

function QFormBody(props: Props) {
  const { qForm, qrForm, onQrItemChange } = props;
  const indexMap: Record<string, number> = mapQItemsIndex(qForm);

  function handleQrGroupChange(qrItem: QuestionnaireResponseItem) {
    updateLinkedItem(qrItem, qrForm, indexMap);
    onQrItemChange(qrForm);
  }

  const qFormItems = qForm.item;
  const qrFormItems = qrForm.item;

  if (qFormItems && qrFormItems) {
    const qrFormItemsByIndex = getQrItemsIndex(qFormItems, qrFormItems);

    return (
      <div>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {qForm.text}
        </Typography>
        {qFormItems.map((qItem: QuestionnaireItem, i) => {
          const qrItem = qrFormItemsByIndex[i];
          if (qItem.type === QItemType.Group) {
            return (
              <Box key={qItem.linkId} sx={{ mb: 5 }}>
                <QItemGroup
                  qItem={qItem}
                  qrItem={qrItem}
                  repeats={qItem.repeats ?? false}
                  groupCardElevation={1}
                  onQrItemChange={handleQrGroupChange}></QItemGroup>
              </Box>
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
      </div>
    );
  } else {
    return <div>Unable to load form</div>;
  }
}

export default QFormBody;
