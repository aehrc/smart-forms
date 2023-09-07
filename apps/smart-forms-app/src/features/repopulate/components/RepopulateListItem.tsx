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

import ListItem from '@mui/material/ListItem';
import { Checkbox, Grid, ListItemButton, ListItemIcon, Typography } from '@mui/material';
import ListItemText from '@mui/material/ListItemText';
import { SingleItem, useHidden } from '@aehrc/smart-forms-renderer';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';

interface RepopulateListItemProps {
  checkedIds: string[];
  qItem: QuestionnaireItem;
  newQRItem: QuestionnaireResponseItem;
  oldQRItem?: QuestionnaireResponseItem;
  onCheckItem: () => void;
}

function RepopulateListItem(props: RepopulateListItemProps) {
  const { qItem, oldQRItem, newQRItem, checkedIds, onCheckItem } = props;

  const itemIsHidden = useHidden(qItem);
  if (itemIsHidden) {
    return null;
  }

  qItem.readOnly = true;
  const linkId = qItem.linkId;
  const itemText = qItem.text ?? '';

  return (
    <ListItem disablePadding>
      <ListItemButton onClick={onCheckItem}>
        <ListItemIcon>
          <Checkbox
            edge="start"
            checked={checkedIds.indexOf(linkId) !== -1}
            tabIndex={-1}
            disableRipple
          />
        </ListItemIcon>
        <ListItemText
          primary={
            <Typography variant="subtitle1" fontWeight={600}>
              {itemText}
            </Typography>
          }
          secondary={
            <Typography component="span">
              <Grid container columnSpacing={2} mt={1}>
                <Grid item xs={12} md={6}>
                  <Typography color="text.secondary">Old answer</Typography>
                  <SingleItem
                    qItem={qItem}
                    qrItem={
                      oldQRItem ?? {
                        linkId: qItem.linkId,
                        text: qItem.text
                      }
                    }
                    isRepeated={true}
                    isTabled={false}
                    onQrItemChange={() => void 0}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography color="text.secondary">New answer</Typography>
                  <SingleItem
                    qItem={qItem}
                    qrItem={newQRItem}
                    isRepeated={true}
                    isTabled={false}
                    onQrItemChange={() => void 0}
                  />
                </Grid>
              </Grid>
            </Typography>
          }
        />
      </ListItemButton>
    </ListItem>
  );
}

export default RepopulateListItem;