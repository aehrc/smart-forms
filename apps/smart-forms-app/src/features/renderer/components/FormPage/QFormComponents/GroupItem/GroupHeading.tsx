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

import { memo } from 'react';
import { Box, Divider } from '@mui/material';
import { QGroupHeadingTypography } from '../Typography.styles.ts';
import QItemLabel from '../QItemParts/QItemLabel.tsx';
import CompleteTabButton from '../../Tabs/CompleteTabButton.tsx';
import { PropsWithIsRepeatedAttribute } from '../../../../types/renderProps.interface.ts';
import { QuestionnaireItem } from 'fhir/r4';

interface GroupHeadingProps extends PropsWithIsRepeatedAttribute {
  qItem: QuestionnaireItem;
  tabIsMarkedAsComplete?: boolean;
}

const GroupHeading = memo(function GroupHeading(props: GroupHeadingProps) {
  const { qItem, tabIsMarkedAsComplete, isRepeated } = props;

  if (isRepeated) {
    return null;
  }

  return (
    <>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <QGroupHeadingTypography variant="h6" isTabHeading={tabIsMarkedAsComplete !== undefined}>
          <QItemLabel qItem={qItem} />
        </QGroupHeadingTypography>

        {tabIsMarkedAsComplete !== undefined ? (
          <CompleteTabButton
            tabLinkId={qItem.linkId}
            tabIsMarkedAsComplete={tabIsMarkedAsComplete}
          />
        ) : null}
      </Box>
      {qItem.text ? <Divider sx={{ mt: 1, mb: 1.5 }} light /> : null}
    </>
  );
});

export default GroupHeading;
