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
import type { QuestionnaireItem } from 'fhir/r4';
import { FullWidthFormComponentBox } from '../../../../../../components/Box/Box.styles.tsx';
import LabelText from '../QItemParts/LabelText.tsx';

interface DisplayItemProps {
  qItem: QuestionnaireItem;
}

const DisplayItem = memo(function DisplayItem(props: DisplayItemProps) {
  const { qItem } = props;

  return (
    <FullWidthFormComponentBox>
      <LabelText qItem={qItem} />
    </FullWidthFormComponentBox>
  );
});

export default DisplayItem;
