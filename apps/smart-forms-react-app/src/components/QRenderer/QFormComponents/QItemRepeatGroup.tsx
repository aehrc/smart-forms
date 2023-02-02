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

import React, { useContext, useEffect, useState } from 'react';
import { Box, Button, Card, Divider, IconButton, Stack } from '@mui/material';

import {
  PropsWithIsRepeatedAttribute,
  PropsWithQrRepeatGroupChangeHandler
} from '../../../interfaces/Interfaces';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import QItemGroup from './QItemGroup';

import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import { createEmptyQrItem } from '../../../functions/QrItemFunctions';
import { isHidden } from '../../../functions/QItemFunctions';
import { RepeatDeleteTooltip, RepeatGroupContainerStack } from './QItemRepeat.styles';
import QItemLabel from './QItemParts/QItemLabel';
import { QGroupHeadingTypography } from '../../StyledComponents/Typographys.styles';
import { EnableWhenContext } from '../../../custom-contexts/EnableWhenContext';
import { EnableWhenChecksContext } from '../Form';

interface Props extends PropsWithQrRepeatGroupChangeHandler, PropsWithIsRepeatedAttribute {
  qItem: QuestionnaireItem;
  qrItems: QuestionnaireResponseItem[];
  groupCardElevation: number;
}

function QItemRepeatGroup(props: Props) {
  const { qItem, qrItems, groupCardElevation, onQrRepeatGroupChange } = props;

  const enableWhenContext = useContext(EnableWhenContext);
  const enableWhenChecksContext = useContext(EnableWhenChecksContext);

  const emptyQrItem = createEmptyQrItem(qItem);
  const qrRepeatGroups: (QuestionnaireResponseItem | undefined)[] =
    qrItems.length > 0 ? qrItems : [undefined];

  const [repeatGroups, setRepeatGroups] = useState(qrRepeatGroups);

  useEffect(() => {
    setRepeatGroups(qrRepeatGroups);
  }, [qrItems]);

  if (isHidden(qItem, enableWhenContext, enableWhenChecksContext)) return null;

  function handleAnswerItemsChange(newQrGroup: QuestionnaireResponseItem, index: number) {
    const newQrGroupItems = newQrGroup.item;
    const repeatGroupsTemp = [...repeatGroups];

    if (newQrGroupItems) {
      repeatGroupsTemp[index] = {
        linkId: newQrGroup.linkId,
        text: newQrGroup.text,
        item: newQrGroupItems
      };
    }
    updateAnswerItems(repeatGroupsTemp);
  }

  function deleteAnswerItem(index: number) {
    const repeatGroupsTemp = [...repeatGroups];
    if (repeatGroupsTemp.length === 1) {
      repeatGroupsTemp[0] = undefined;
    } else {
      repeatGroupsTemp.splice(index, 1);
    }
    updateAnswerItems(repeatGroupsTemp);
  }

  function updateAnswerItems(updatedRepeatGroups: (QuestionnaireResponseItem | undefined)[]) {
    setRepeatGroups([...updatedRepeatGroups]);

    const groupsWithValues: QuestionnaireResponseItem[] = updatedRepeatGroups.flatMap(
      (singleGroup) => (singleGroup ? [singleGroup] : [])
    );
    onQrRepeatGroupChange({ linkId: qItem.linkId, qrItems: groupsWithValues });
  }

  return (
    <Card elevation={groupCardElevation} sx={{ p: 3, pt: 2.5, mb: 3.5 }}>
      <QGroupHeadingTypography variant="h6">
        <QItemLabel qItem={qItem} />
      </QGroupHeadingTypography>
      <Divider sx={{ mt: 1, mb: 1.5 }} light />
      {repeatGroups.map((singleGroup, index) => {
        const singleQrGroup: QuestionnaireResponseItem = singleGroup
          ? { ...emptyQrItem, item: singleGroup.item }
          : { ...emptyQrItem };

        return (
          <RepeatGroupContainerStack key={index} direction="row" justifyContent="end">
            <Box sx={{ flexGrow: 1 }}>
              <QItemGroup
                qItem={qItem}
                qrItem={singleQrGroup}
                isRepeated={true}
                groupCardElevation={groupCardElevation + 1}
                onQrItemChange={(newQrGroup) =>
                  handleAnswerItemsChange(newQrGroup, index)
                }></QItemGroup>
            </Box>

            <RepeatDeleteTooltip className="repeat-group-delete" title="Delete item">
              <span>
                <IconButton
                  size="small"
                  color="error"
                  disabled={!singleGroup}
                  onClick={() => deleteAnswerItem(index)}>
                  <DeleteIcon />
                </IconButton>
              </span>
            </RepeatDeleteTooltip>
          </RepeatGroupContainerStack>
        );
      })}

      <Stack direction="row" justifyContent="end" sx={{ mt: 1 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          disabled={!repeatGroups[repeatGroups.length - 1]}
          onClick={() => setRepeatGroups([...repeatGroups, undefined])}>
          Add Item
        </Button>
      </Stack>
    </Card>
  );
}

export default QItemRepeatGroup;
