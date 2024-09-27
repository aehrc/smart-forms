/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
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
import { Checkbox, ListItemButton, ListItemIcon, Typography } from '@mui/material';
import ListItemText from '@mui/material/ListItemText';
import { useHidden } from '@aehrc/smart-forms-renderer';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import RepopulateItemSwitcher from './RepopulateItemSwitcher.tsx';

interface RepopulateListItemProps {
  checkedIds: string[];
  qItem: QuestionnaireItem;
  newQRItem?: QuestionnaireResponseItem;
  oldQRItem?: QuestionnaireResponseItem;
  newQRItems?: QuestionnaireResponseItem[];
  oldQRItems?: QuestionnaireResponseItem[];
  onCheckItem: () => void;
}

function RepopulateListItem(props: RepopulateListItemProps) {
  const { qItem, oldQRItem, newQRItem, newQRItems, oldQRItems, checkedIds, onCheckItem } = props;

  const itemIsHidden = useHidden(qItem);
  if (itemIsHidden) {
    return null;
  }

  const qItemToRepopulate = structuredClone({ ...qItem, readOnly: true });
  const linkId = qItemToRepopulate.linkId;
  const itemText = qItemToRepopulate.text ?? '';

  return (
    <ListItem disablePadding>
      <ListItemButton onClick={onCheckItem} disableRipple>
        <ListItemIcon>
          <Checkbox
            edge="start"
            checked={checkedIds.indexOf(linkId) !== -1}
            tabIndex={-1}
            disableRipple
          />
        </ListItemIcon>
        <ListItemText
          primary={<Typography variant="subtitle2">{itemText}</Typography>}
          secondary={
            <Typography component="span">
              <RepopulateItemSwitcher
                qItem={qItemToRepopulate}
                oldQRItem={oldQRItem}
                newQRItem={newQRItem}
                newQRItems={newQRItems}
                oldQRItems={oldQRItems}
              />
            </Typography>
          }
        />
      </ListItemButton>
    </ListItem>
  );
}

export default RepopulateListItem;
