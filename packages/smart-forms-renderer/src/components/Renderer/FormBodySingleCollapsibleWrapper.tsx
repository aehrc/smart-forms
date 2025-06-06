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

import React from 'react';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import GroupItem from '../FormComponents/GroupItem/GroupItem';
import FormBodySingleCollapsible from './FormBodySingleCollapsible';
import type {
  PropsWithItemPathAttribute,
  PropsWithParentIsReadOnlyAttribute,
  PropsWithQrItemChangeHandler
} from '../../interfaces/renderProps.interface';
import useHidden from '../../hooks/useHidden';

interface FormBodySingleCollapsibleProps
  extends PropsWithQrItemChangeHandler,
    PropsWithItemPathAttribute,
    PropsWithParentIsReadOnlyAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem | null;
  index: number;
  selectedIndex: number;
  onToggleExpand: (index: number) => void;
}

function FormBodySingleCollapsibleWrapper(props: FormBodySingleCollapsibleProps) {
  const {
    qItem,
    qrItem,
    index,
    selectedIndex,
    parentIsReadOnly,
    itemPath,
    onToggleExpand,
    onQrItemChange
  } = props;

  const itemIsHidden = useHidden(qItem);
  if (itemIsHidden) {
    return null;
  }

  return (
    <FormBodySingleCollapsible
      key={qItem.linkId}
      qItem={qItem}
      index={index}
      selectedIndex={selectedIndex}
      onToggleExpand={onToggleExpand}>
      <GroupItem
        qItem={qItem}
        qrItem={qrItem}
        itemPath={itemPath}
        isRepeated={true}
        groupCardElevation={1}
        parentIsReadOnly={parentIsReadOnly}
        onQrItemChange={onQrItemChange}
      />
    </FormBodySingleCollapsible>
  );
}

export default FormBodySingleCollapsibleWrapper;
