/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
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
import AttachmentField from './AttachmentField';
import { FullWidthFormComponentBox } from '../../Box.styles';
import ItemFieldGrid from '../ItemParts/ItemFieldGrid';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledRequiredAttribute
} from '../../../interfaces/renderProps.interface';
import type { QuestionnaireItem } from 'fhir/r4';
import type { AttachmentValues } from './AttachmentItem';
import { useQuestionnaireStore } from '../../../stores';
import ItemLabel from '../ItemParts/ItemLabel';

interface AttachmentFieldWrapperProps
  extends PropsWithIsRepeatedAttribute,
    PropsWithIsTabledRequiredAttribute {
  qItem: QuestionnaireItem;
  attachmentValues: AttachmentValues;
  feedback: string;
  readOnly: boolean;
  onUploadFile: (file: File | null) => void;
  onUrlChange: (url: string) => void;
  onFileNameChange: (fileName: string) => void;
}

function AttachmentFieldWrapper(props: AttachmentFieldWrapperProps) {
  const {
    qItem,
    attachmentValues,
    feedback,
    readOnly,
    isRepeated,
    isTabled,
    onUploadFile,
    onUrlChange,
    onFileNameChange
  } = props;

  const onFocusLinkId = useQuestionnaireStore.use.onFocusLinkId();

  if (isRepeated) {
    return (
      <AttachmentField
        linkId={qItem.linkId}
        itemType={qItem.type}
        attachmentValues={attachmentValues}
        feedback={feedback}
        readOnly={readOnly}
        isTabled={isTabled}
        onUploadFile={onUploadFile}
        onUrlChange={onUrlChange}
        onFileNameChange={onFileNameChange}
      />
    );
  }

  return (
    <FullWidthFormComponentBox
      data-test="q-item-attachment-box"
      data-linkid={qItem.linkId}
      data-label={qItem.text}
      onClick={() => onFocusLinkId(qItem.linkId)}>
      <ItemFieldGrid
        qItem={qItem}
        readOnly={readOnly}
        labelChildren={<ItemLabel qItem={qItem} readOnly={readOnly} />}
        fieldChildren={
          <AttachmentField
            linkId={qItem.linkId}
            itemType={qItem.type}
            attachmentValues={attachmentValues}
            feedback={feedback}
            readOnly={readOnly}
            isTabled={isTabled}
            onUploadFile={onUploadFile}
            onUrlChange={onUrlChange}
            onFileNameChange={onFileNameChange}
          />
        }
      />
    </FullWidthFormComponentBox>
  );
}

export default AttachmentFieldWrapper;
