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
  checkedLinkIds: string[];
  onCheckItem: (linkId: string) => void;
}

function RepopulateList(props: RepopulateListProps) {
  const { itemsToRepopulateTuplesByHeadings, checkedLinkIds, onCheckItem } = props;

  return (
    <>
      {itemsToRepopulateTuplesByHeadings.map(([heading, itemsToRepopulate], index) => (
        <Fragment key={heading}>
          <List
            dense
            sx={{ width: '100%', minWidth: 360 }}
            subheader={
              <Typography variant="subtitle1" color="text.secondary">
                {heading}
              </Typography>
            }>
            {itemsToRepopulate.map((itemToRepopulate) => {
              const { qItem, newQRItem, oldQRItem, newQRItems, oldQRItems } = itemToRepopulate;

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
                  checkedIds={checkedLinkIds}
                  onCheckItem={() => onCheckItem(qItem.linkId)}
                />
              );
            })}
          </List>
          {index !== itemsToRepopulateTuplesByHeadings.length - 1 && (
            <Divider sx={{ mb: 1.5 }} light />
          )}
        </Fragment>
      ))}
    </>
  );
}

export default RepopulateList;
