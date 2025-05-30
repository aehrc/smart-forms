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
import { Typography } from '@mui/material';
import ListItemText from '@mui/material/ListItemText';
import { useHidden } from '@aehrc/smart-forms-renderer';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import SimplifiedRepopulateItemSwitcher from './SimplifiedRepopulateItemSwitcher.tsx';

interface RepopulateListItemProps {
  qItem: QuestionnaireItem;
  newQRItem?: QuestionnaireResponseItem;
  oldQRItem?: QuestionnaireResponseItem;
  newQRItems?: QuestionnaireResponseItem[];
  oldQRItems?: QuestionnaireResponseItem[];
  onValuePreferenceChange: (linkId: string, preferOld: boolean | undefined) => void;
  isSelected?: boolean;
  initialPreference?: boolean;
  fieldPreferences: Record<string, boolean | undefined>;
}

function RepopulateListItem(props: RepopulateListItemProps) {
  const { qItem, oldQRItem, newQRItem, newQRItems, oldQRItems, onValuePreferenceChange, fieldPreferences } = props;

  const itemIsHidden = useHidden(qItem);
  if (itemIsHidden) {
    return null;
  }

  const qItemToRepopulate = qItem;
  const itemText = qItemToRepopulate.text ?? '';

  if (qItem.text?.includes('Medical history')) {
    console.log(`RepopulateListItem: Passing to Switcher for ${qItem.linkId} (${itemText}):`, {
      serverSuggestedQRItem: newQRItem,
      currentUserFormQRItem: oldQRItem,
      serverSuggestedQRItems: newQRItems,
      currentUserFormQRItems: oldQRItems
    });
  }

  return (
    <ListItem
      disablePadding
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        pt: 0.5,
        pb: 1.5
      }}>
      <ListItemText
        primary={
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
            {itemText}
          </Typography>
        }
        secondaryTypographyProps={{ component: 'div' }}
        secondary={
          <SimplifiedRepopulateItemSwitcher
            qItem={qItemToRepopulate}
            serverSuggestedQRItem={props.newQRItem}
            currentUserFormQRItem={props.oldQRItem}
            serverSuggestedQRItems={props.newQRItems}
            currentUserFormQRItems={props.oldQRItems}
            onValuePreferenceChange={onValuePreferenceChange}
            fieldPreferences={fieldPreferences}
          />
        }
        sx={{ width: '100%' }}
      />
    </ListItem>
  );
}

export default RepopulateListItem;
