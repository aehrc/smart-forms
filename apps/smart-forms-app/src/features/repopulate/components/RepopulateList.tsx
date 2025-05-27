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

import List from '@mui/material/List';
import type { ItemToRepopulate } from '@aehrc/smart-forms-renderer';
import { Divider, Typography } from '@mui/material';
import { Fragment } from 'react';
import RepopulateListItem from './RepopulateListItem.tsx';

interface RepopulateListProps {
  itemsToRepopulateTuplesByHeadings: [string, ItemToRepopulate[]][];
  onValuePreferenceChange: (linkId: string, preferOld: boolean | undefined) => void;
  initialPreferences: Record<string, boolean | undefined>;
}

function RepopulateList(props: RepopulateListProps) {
  const { itemsToRepopulateTuplesByHeadings, onValuePreferenceChange, initialPreferences } = props;

  return (
    <>
      {itemsToRepopulateTuplesByHeadings.map(([heading, itemsToRepopulate], index) => (
        <Fragment key={heading}>
          <List
            dense
            sx={{ width: '100%', minWidth: 360, pt: 0, pb: 0.5 }}
            subheader={
              heading ? (
                <Typography
                  variant="subtitle1"
                  color="text.secondary"
                  sx={{ pl: 1, pt: 1, pb: 0.5 }}>
                  {heading}
                </Typography>
              ) : null
            }>
            {itemsToRepopulate.map((itemToRepopulateData) => {
              console.log(
                'RepopulateList: Processing itemToRepopulateData:',
                JSON.stringify(itemToRepopulateData, null, 2)
              );

              const { qItem, newQRItem, oldQRItem, newQRItems, oldQRItems } = itemToRepopulateData;

              if (!qItem) {
                return null;
              }

              return (
                <RepopulateListItem
                  key={qItem.linkId}
                  qItem={qItem}
                  oldQRItem={oldQRItem}
                  newQRItem={newQRItem}
                  oldQRItems={oldQRItems}
                  newQRItems={newQRItems}
                  onValuePreferenceChange={onValuePreferenceChange}
                  initialPreference={initialPreferences[qItem.linkId]}
                />
              );
            })}
          </List>
          {index < itemsToRepopulateTuplesByHeadings.length - 1 && itemsToRepopulate.length > 0 && (
            <Divider sx={{ mb: 1, mt: 0.5 }} light />
          )}
        </Fragment>
      ))}
    </>
  );
}

export default RepopulateList;
