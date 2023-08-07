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

import { Box } from '@mui/material';
import ContextDisplayItem from './ContextDisplayItem.tsx';
import type { QuestionnaireItem } from 'fhir/r4';
import { getContextDisplays } from '../../../../utils/tabs.ts';
import LabelText from './LabelText.tsx';

interface LabelWrapperProps {
  qItem: QuestionnaireItem;
}

function LabelWrapper(props: LabelWrapperProps) {
  const { qItem } = props;

  const contextDisplayItems = getContextDisplays(qItem);

  return (
    <Box display="flex" alignItems="center" justifyContent="space-between">
      <LabelText qItem={qItem} />

      <Box display="flex" columnGap={0.5}>
        {contextDisplayItems.map((item) => {
          return <ContextDisplayItem key={item.linkId} displayItem={item} />;
        })}
      </Box>
    </Box>
  );
}

export default LabelWrapper;
